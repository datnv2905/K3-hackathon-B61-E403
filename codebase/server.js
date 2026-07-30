import { createServer } from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const publicDir = join(rootDir, "codebase", "public");
const lessonPath = join(rootDir, "codebase", "lesson", "day06-ai-product.json");
const varDir = join(rootDir, "codebase", "var");
const eventLogPath = join(varDir, "events.jsonl");
const preferredPort = Number(process.env.PORT || 3000);

loadEnv(join(rootDir, ".env"));

const lesson = JSON.parse(readFileSync(lessonPath, "utf8"));

// Canonical wording for the two refusal paths. The model proposes; the server decides
// the final text, so a chatty model cannot talk its way past a refusal.
const INSUFFICIENT_TEXT = "Nội dung hiện tại chưa được giải thích đầy đủ trong bài giảng.";
const OUT_OF_SCOPE_TEXT = "Câu này ngoài phạm vi mình được phép trả lời trong phiên học.";
const CLARIFY_TEXT = "Mình chưa chắc bạn đang hỏi phần nào.";
const RETRIEVAL_TOP_K = 4;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const routes = [
  ["GET", "/api/health", handleHealth],
  ["GET", "/api/lesson", handleLesson],
  ["POST", "/api/tutor/answer", handleTutorAnswer],
  ["POST", "/api/tutor/quiz", handleTutorQuiz],
  ["POST", "/api/tutor/grade", handleTutorGrade],
  ["POST", "/api/events", handleEvents],
];

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const route = routes.find(([method, path]) => method === req.method && path === url.pathname);

    // Every handler is awaited. Returning an un-awaited promise from this try block
    // would let rejections escape as unhandledRejection and kill the process.
    if (route) return await route[2](req, res);
    if (req.method === "GET") return await serveStatic(url.pathname, res);

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    if (res.headersSent || res.writableEnded) return;
    sendJson(res, error.status || 500, { error: error.message || "Unexpected server error" });
  }
});

// Belt and braces: a live demo must never die from a stray rejection.
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));

listenWithFallback(preferredPort);

function listenWithFallback(nextPort, attempts = 0) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts < 10 && !process.env.PORT) {
      listenWithFallback(nextPort + 1, attempts + 1);
      return;
    }
    throw error;
  });

  server.listen(nextPort, () => {
    console.log(`VLearn slide AI tutor running at http://localhost:${nextPort}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set — tutor and quiz calls will return 503.");
    }
  });
}

/* ── Routes ─────────────────────────────────────────────────────────── */

function handleHealth(req, res) {
  sendJson(res, 200, {
    ok: true,
    model: getGeminiModel(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    lessonId: lesson.id,
    retrievalTopK: RETRIEVAL_TOP_K,
  });
}

function handleLesson(req, res) {
  sendJson(res, 200, lesson);
}

async function handleTutorAnswer(req, res) {
  const body = await readJsonBody(req);
  const question = text(body.question);
  if (!question) return sendJson(res, 400, { error: "Question is required" });

  const selectedText = text(body.selectedText);
  const selectedRegion = body.selectedRegion || null;
  const pinnedPage = Number(body.pageNumber) || 0;
  const retrieved = retrievePages(question, selectedText, pinnedPage);

  const json = await callGeminiJson(buildAnswerPrompt({ question, selectedText, selectedRegion, retrieved }));
  sendJson(res, 200, normalizeAnswer(json, { retrieved, pinnedPage, selectedText, selectedRegion }));
}

async function handleTutorQuiz(req, res) {
  const body = await readJsonBody(req);
  const sourceAnswer = text(body.sourceAnswer);
  if (!sourceAnswer) return sendJson(res, 400, { error: "Source answer is required" });

  const count = clamp(Number(body.questionCount) || 2, 1, 3);
  const pageNumber = Number(body.pageNumber) || 0;
  const page = lesson.pages.find((item) => item.pageNumber === pageNumber) || lesson.pages[0];

  const json = await callGeminiJson(buildQuizPrompt({ sourceAnswer, count, page }));
  sendJson(res, 200, normalizeQuiz(json, count, page.pageNumber));
}

async function handleTutorGrade(req, res) {
  const body = await readJsonBody(req);
  const learnerAnswer = text(body.learnerAnswer);
  const questionPrompt = text(body.prompt);
  if (!learnerAnswer || !questionPrompt) {
    return sendJson(res, 400, { error: "prompt and learnerAnswer are required" });
  }

  const json = await callGeminiJson(buildGradePrompt({
    questionPrompt,
    learnerAnswer,
    referenceAnswer: text(body.referenceAnswer),
    pageNumber: Number(body.pageNumber) || 0,
  }));

  sendJson(res, 200, {
    isCorrect: json.isCorrect === true,
    feedback: text(json.feedback) || "Chưa có nhận xét chi tiết.",
    missingPoints: Array.isArray(json.missingPoints) ? json.missingPoints.map(text).filter(Boolean) : [],
  });
}

async function handleEvents(req, res) {
  const body = await readJsonBody(req);
  const events = Array.isArray(body.events) ? body.events : [body];
  const stamped = events
    .filter((event) => event && typeof event === "object")
    .map((event) => ({ ...event, receivedAt: new Date().toISOString(), lessonId: lesson.id }));

  if (stamped.length === 0) return sendJson(res, 400, { error: "No events supplied" });

  await mkdir(varDir, { recursive: true });
  await appendFile(eventLogPath, stamped.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
  sendJson(res, 200, { stored: stamped.length });
}

/* ── Retrieval ──────────────────────────────────────────────────────── */

// Naive lexical retrieval: good enough to prove the citation contract on a small
// deck, and it keeps the "only cite what was retrieved" rule enforceable.
// A 37-page deck would need real chunking + embeddings — see codebase/MOCKS.md.
function retrievePages(question, selectedText, pinnedPage) {
  const query = tokenize(`${question} ${selectedText}`);
  const ranked = lesson.pages
    .map((page) => ({ page, score: overlap(query, tokenize(pageCorpus(page))) }))
    .sort((a, b) => b.score - a.score);

  const picked = [];
  const pinned = lesson.pages.find((page) => page.pageNumber === pinnedPage);
  if (pinned) picked.push(pinned);
  for (const entry of ranked) {
    if (picked.length >= RETRIEVAL_TOP_K) break;
    if (!picked.includes(entry.page)) picked.push(entry.page);
  }
  return picked.sort((a, b) => a.pageNumber - b.pageNumber);
}

function pageCorpus(page) {
  return `${page.title}. ${page.text} ${page.points.join(" ")}`;
}

function tokenize(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 2)
  );
}

function overlap(query, target) {
  let hits = 0;
  for (const token of query) if (target.has(token)) hits += 1;
  return query.size === 0 ? 0 : hits / query.size;
}

/* ── Prompts ────────────────────────────────────────────────────────── */

function buildAnswerPrompt({ question, selectedText, selectedRegion, retrieved }) {
  const regionLine = selectedRegion
    ? `Learner circled a visual region on page ${selectedRegion.pageNumber || "?"}: x=${selectedRegion.x}%, y=${selectedRegion.y}%, w=${selectedRegion.width}%, h=${selectedRegion.height}%. You cannot see the image, so rely on that page's text and say so if the region is ambiguous.`
    : "No visual region was circled.";

  return [
    "You are a Vietnamese AI tutor embedded in a slide-reading app. Answer in Vietnamese, at most 4 sentences.",
    "",
    "HARD RULES:",
    "1. Use ONLY the lesson pages supplied below. Never add outside knowledge, never search.",
    `2. If the pages do not contain the answer, set "sufficient": false. Do not guess. This covers questions that are about this course or its tooling but are simply not explained on these pages — those are "sufficient": false, NOT "outOfScope".`,
    `3. Set "outOfScope": true ONLY when the learner asks you to do something you are not permitted to do — reveal final-quiz answers, change a grade or score, complete a graded assignment for them — or asks about a topic plainly unrelated to studying (weather, sport, personal life). Put a useful next step in "redirect".`,
    "4. If the question is too vague to answer safely, set confidence to \"low\" and put ONE clarifying question in \"clarifyingQuestion\".",
    `5. "citation.pageNumber" MUST be one of: ${retrieved.map((page) => page.pageNumber).join(", ")}.`,
    `6. "citation.quote" MUST be copied verbatim from that page's text below — do not paraphrase it.`,
    "",
    "LESSON PAGES (the only source of truth):",
    ...retrieved.map((page) => `--- Page ${page.pageNumber}: ${page.title}\n${pageCorpus(page)}`),
    "",
    `Learner selected text: ${selectedText || "(none)"}`,
    regionLine,
    `Learner question: ${question}`,
    "",
    "Reply with strict JSON only:",
    '{"answer":"...","sufficient":true,"outOfScope":false,"redirect":"","clarifyingQuestion":"","citation":{"pageNumber":1,"quote":"..."},"confidence":"high|medium|low"}',
  ].join("\n");
}

function buildQuizPrompt({ sourceAnswer, count, page }) {
  return [
    `Create a Vietnamese micro quiz of exactly ${count} question(s) that checks whether the learner understood the tutor answer below.`,
    "",
    "RULES:",
    "1. Every question must be answerable from the lesson page text alone.",
    `2. Include at least one "mcq". You may include one "short_answer" if it fits.`,
    "3. mcq: 3 options, exactly one correct, set correctOptionIndex (0-based).",
    "4. short_answer: supply a concise referenceAnswer instead of options.",
    "5. Keep every explanation under 2 sentences. Do not repeat the same fact twice.",
    "",
    `Lesson page ${page.pageNumber} — ${page.title}:`,
    pageCorpus(page),
    "",
    `Tutor answer to verify: ${sourceAnswer}`,
    "",
    "Reply with strict JSON only:",
    '{"questions":[{"type":"mcq","prompt":"...","options":["...","...","..."],"correctOptionIndex":0,"explanation":"..."},{"type":"short_answer","prompt":"...","referenceAnswer":"...","explanation":"..."}]}',
  ].join("\n");
}

function buildGradePrompt({ questionPrompt, learnerAnswer, referenceAnswer, pageNumber }) {
  return [
    "Grade a Vietnamese short answer. Be generous about wording, strict about meaning.",
    "Mark it correct when the learner captures the core idea, even if phrased differently.",
    "Give feedback in Vietnamese, at most 2 sentences.",
    "",
    `Page: ${pageNumber || "unknown"}`,
    `Question: ${questionPrompt}`,
    `Reference answer: ${referenceAnswer || "(none supplied)"}`,
    `Learner answer: ${learnerAnswer}`,
    "",
    "Reply with strict JSON only:",
    '{"isCorrect":true,"feedback":"...","missingPoints":["..."]}',
  ].join("\n");
}

/* ── Response normalisation ─────────────────────────────────────────── */

// The server, not the model, decides the final shape. Anything unverifiable is
// downgraded and flagged so the UI can show the learner why to distrust it.
function normalizeAnswer(json, { retrieved, pinnedPage, selectedText, selectedRegion }) {
  const allowedPages = retrieved.map((page) => page.pageNumber);
  const citation = json.citation || {};
  let pageNumber = Number(citation.pageNumber);
  if (!allowedPages.includes(pageNumber)) pageNumber = pinnedPage || allowedPages[0];

  const citedPage = retrieved.find((page) => page.pageNumber === pageNumber);
  const quote = text(citation.quote).slice(0, 220);
  const citationVerified = allowedPages.includes(Number(citation.pageNumber));
  const quoteVerified = verifyQuote(quote, citedPage);

  let kind = "answer";
  let answer = text(json.answer);
  let confidence = ["high", "medium", "low"].includes(json.confidence) ? json.confidence : "medium";
  const clarifyingQuestion = text(json.clarifyingQuestion);

  if (json.outOfScope === true) {
    kind = "out_of_scope";
    confidence = "low";
    const redirect = text(json.redirect);
    answer = redirect ? `${OUT_OF_SCOPE_TEXT} ${redirect}` : OUT_OF_SCOPE_TEXT;
  } else if (clarifyingQuestion) {
    // Layer ②: the input is too vague to answer safely, so ask back instead of guessing.
    kind = "needs_clarification";
    confidence = "low";
    answer = `${CLARIFY_TEXT} ${clarifyingQuestion}`;
  } else if (json.sufficient === false) {
    kind = "insufficient";
    confidence = "low";
    answer = INSUFFICIENT_TEXT;
  } else if (!answer) {
    kind = "insufficient";
    confidence = "low";
    answer = INSUFFICIENT_TEXT;
  } else if (!citationVerified || !quoteVerified) {
    // Grounding could not be confirmed, so the answer stops claiming confidence.
    confidence = "low";
  }

  return {
    kind,
    answer,
    clarifyingQuestion,
    confidence,
    citation: {
      pageNumber,
      quote,
      regionLabel: selectedRegion ? `Vùng đã khoanh trên trang ${selectedRegion.pageNumber || pageNumber}` : "",
      verified: citationVerified && quoteVerified,
      citationVerified,
      quoteVerified,
    },
    retrievedPages: allowedPages,
    selectionEcho: selectedText.slice(0, 220),
  };
}

function verifyQuote(quote, page) {
  if (!page) return false;
  if (quote.length < 12) return false;
  return flatten(pageCorpus(page)).includes(flatten(quote));
}

function flatten(value) {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeQuiz(json, count, pageNumber) {
  const raw = Array.isArray(json.questions) ? json.questions : [];
  const questions = raw.slice(0, count).map((question, index) => {
    const isShort = question.type === "short_answer" && !Array.isArray(question.options);
    const base = {
      id: `q-${Date.now()}-${index}`,
      type: isShort ? "short_answer" : "mcq",
      prompt: text(question.prompt) || "Câu hỏi kiểm tra nhanh",
      explanation: text(question.explanation) || "Xem lại câu trả lời của tutor và trang nguồn.",
      pageNumber: Number(question.pageNumber) || pageNumber,
    };

    if (isShort) {
      return { ...base, referenceAnswer: text(question.referenceAnswer) };
    }

    const options = (Array.isArray(question.options) ? question.options : []).map(text).filter(Boolean).slice(0, 4);
    while (options.length < 3) options.push("Chưa đủ dữ kiện để kết luận");
    const correct = Number(question.correctOptionIndex);
    return {
      ...base,
      options,
      correctOptionIndex: Number.isInteger(correct) && correct >= 0 && correct < options.length ? correct : 0,
    };
  });

  if (questions.length === 0) {
    const error = new Error("Gemini returned no usable quiz questions");
    error.status = 502;
    throw error;
  }
  return { questions };
}

/* ── Gemini ─────────────────────────────────────────────────────────── */

async function callGeminiJson(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Chưa cấu hình GEMINI_API_KEY — sao chép .env.example sang .env và điền key.");
    error.status = 503;
    throw error;
  }

  const model = getGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Gemini request failed with ${response.status}`);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }

  const body = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!body) {
    const error = new Error("Gemini returned an empty response");
    error.status = 502;
    throw error;
  }
  return parseJsonLoose(body);
}

function getGeminiModel() {
  return String(process.env.GEMINI_MODEL || "gemini-2.5-flash").replace(/^models\//, "");
}

/* ── HTTP plumbing ──────────────────────────────────────────────────── */

async function serveStatic(pathname, res) {
  const filePath = normalize(join(publicDir, pathname === "/" ? "/index.html" : pathname));
  if (!filePath.startsWith(publicDir)) return sendJson(res, 403, { error: "Forbidden" });

  let content;
  try {
    content = await readFile(filePath);
  } catch (error) {
    // A missing favicon must be a 404, not a dead server.
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      return sendJson(res, 404, { error: "Not found" });
    }
    throw error;
  }

  res.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
  res.end(content);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) {
      const error = new Error("Request body too large");
      error.status = 413;
      throw error;
    }
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Body is not valid JSON");
    error.status = 400;
    throw error;
  }
}

function parseJsonLoose(value) {
  try {
    return JSON.parse(value);
  } catch {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(value.slice(start, end + 1));
    const error = new Error("Could not parse Gemini JSON response");
    error.status = 502;
    throw error;
  }
}

function text(value) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
