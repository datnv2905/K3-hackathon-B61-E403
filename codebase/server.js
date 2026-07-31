import { createServer } from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const publicDir = join(rootDir, "codebase", "public");
const varDir = join(rootDir, "codebase", "var");
const eventLogPath = join(varDir, "events.jsonl");
const preferredPort = Number(process.env.PORT || 3000);

loadEnv(join(rootDir, ".env"));

// Which model provider serves every AI call (tutor answer, quiz, grading, admin
// smart suggestion). Resolved once at boot so the whole process — health endpoint,
// boot log, every request — reports the same answer. Default is gemini, so a
// teammate with only GEMINI_API_KEY set runs exactly as before: no new env var,
// no new flag, nothing to learn.
const AI_PROVIDER = resolveProvider();

// Canonical wording for the two refusal paths. The model proposes; the server decides
// the final text, so a chatty model cannot talk its way past a refusal.
const INSUFFICIENT_TEXT = "Nội dung hiện tại chưa được giải thích đầy đủ trong bài giảng.";
const OUT_OF_SCOPE_TEXT = "Câu này ngoài phạm vi mình được phép trả lời trong phiên học.";
const CLARIFY_TEXT = "Mình chưa chắc bạn đang hỏi phần nào.";
const RETRIEVAL_TOP_K = 4;
const DEFAULT_LESSON_ID = "d1-ai-llm-foundation";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

// Module-level state that buildLessonRegistry() (called via top-level await just
// below) depends on. Must be declared before that call — `let` bindings are in the
// temporal dead zone until their own declaration runs, and top-level await means
// the module is still paused on the call below when these would otherwise execute.
let pdfjsNodeModulePromise = null;

// Loaded once at boot — see buildLessonRegistry(). Top-level await is safe here
// because package.json declares "type": "module".
const lessons = await buildLessonRegistry();
const lessonsById = new Map(lessons.map((entry) => [entry.id, entry]));

const routes = [
  ["GET", "/api/health", handleHealth],
  ["GET", "/api/lessons", handleLessons],
  ["GET", "/api/lesson", handleLesson],
  ["GET", "/api/pdf", handlePdf],
  ["POST", "/api/tutor/answer", handleTutorAnswer],
  ["POST", "/api/tutor/quiz", handleTutorQuiz],
  ["POST", "/api/tutor/grade", handleTutorGrade],
  ["POST", "/api/events", handleEvents],
  ["GET", "/api/admin/overview", handleAdminOverview],
  ["GET", "/api/admin/pages/:pageNumber/questions", handleAdminPageQuestions],
  ["POST", "/api/admin/suggestions", handleAdminSuggestion],
  ["POST", "/api/admin/slide-preview", handleAdminSlidePreview],
];

// pageNumber is a path param, not a literal segment — match it manually alongside
// the exact-match routes above rather than pulling in a router dependency for one case.
const ADMIN_PAGE_QUESTIONS_RE = /^\/api\/admin\/pages\/(\d+)\/questions$/;

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const route = routes.find(([method, path]) => method === req.method && path === url.pathname);

    const pageQuestionsMatch = req.method === "GET" && ADMIN_PAGE_QUESTIONS_RE.exec(url.pathname);

    // Every handler is awaited. Returning an un-awaited promise from this try block
    // would let rejections escape as unhandledRejection and kill the process.
    if (route) return await route[2](req, res, url);
    if (pageQuestionsMatch) return await handleAdminPageQuestions(req, res, url, Number(pageQuestionsMatch[1]));
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
    console.log(`Lessons loaded: ${lessons.map((l) => `${l.id} (${l.kind}, ${l.pages.length}p)`).join(", ")}`);
    console.log(`AI provider: ${AI_PROVIDER} (${getActiveModel()})`);
    // Only nag about the key this provider actually needs — running with --claude
    // must not complain about a missing GEMINI_API_KEY, and vice versa.
    if (!getApiKey()) {
      console.warn(`${API_KEY_ENV[AI_PROVIDER]} is not set — tutor, quiz and suggestion calls will return 503.`);
    }
  });
}

/* ── Lesson registry ────────────────────────────────────────────────── */

async function buildLessonRegistry() {
  const list = [];

  list.push(
    await buildPdfLesson({
      id: "d1-ai-llm-foundation",
      title: "Day 1 — AI & LLM Foundation",
      pdfFile: join(rootDir, "Slide", "d1-slide-hackathon.pdf"),
      baseQuestionsFile: join(rootDir, "codebase", "lesson", "d1-quiz-mock.json"),
    })
  );

  list.push(
    buildMockLesson({
      id: "day06-ai-product-method",
      file: join(rootDir, "codebase", "lesson", "day06-ai-product.json"),
    })
  );

  return list;
}

// Renders the main slide area from the real PDF (canvas, in the browser) and grounds
// the tutor in real text extracted from that same PDF (server-side, here). No more
// hand-authored page content and no more guessed page-marker placeholders.
async function buildPdfLesson({ id, title, pdfFile, baseQuestionsFile }) {
  const pdfjsLib = await loadPdfjsForNode();
  const data = new Uint8Array(await readFile(pdfFile));
  const doc = await pdfjsLib.getDocument({
    data,
    disableWorker: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item) => !isWatermarkText(item.str))
      .map((item) => item.str || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ pageNumber, text: pageText });
  }

  const quizFile = JSON.parse(readFileSync(baseQuestionsFile, "utf8"));
  const baseQuestions = quizFile.questions.map((question) => ({
    ...question,
    // pageNumber in the source file is pre-verified against this same PDF's real
    // text (see codebase/lesson/d1-quiz-mock.json pageNumberNote) — trusted as-is.
  }));

  return {
    id,
    title,
    kind: "pdf",
    isMock: false,
    sourceFile: relative(rootDir, pdfFile).replace(/\\/g, "/"),
    pdfUrl: `/api/pdf?id=${id}`,
    pdfFilePath: pdfFile, // server-only, stripped before sending to the client
    totalPagesInRealDeck: pages.length,
    pages,
    baseQuestions,
  };
}

// Every page of the Day 1 deck carries a diagonal "AI IN ACTION - HACKATHON"
// watermark as real (selectable) PDF text. It must never leak into grounding text,
// citations, or the drag-to-highlight geometry — hardcoded filter, not a guess.
function isWatermarkText(str) {
  const normalized = String(str || "").replace(/\s+/g, "").toUpperCase();
  return normalized.length > 0 && (normalized === "AIINACTION-HACKATHON" || normalized.includes("HACKATHON"));
}

function buildMockLesson({ id, file }) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return { ...raw, id: raw.id || id, kind: "mock" };
}

function loadPdfjsForNode() {
  if (!pdfjsNodeModulePromise) {
    installNodeDomPolyfills();
    pdfjsNodeModulePromise = import("./server-vendor/pdfjs/pdf.mjs");
  }
  return pdfjsNodeModulePromise;
}

// Node has no DOMMatrix/Path2D. These are only accurate enough for TEXT
// EXTRACTION (getTextContent) — page.render() is never called server-side;
// all rendering happens in the browser build instead. See
// codebase/server-vendor/pdfjs/VENDORED.md.
function installNodeDomPolyfills() {
  if (globalThis.DOMMatrix) return;

  class DOMMatrixPolyfill {
    constructor(init) {
      if (Array.isArray(init) && init.length === 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }
    multiply(other) {
      const m = new DOMMatrixPolyfill();
      m.a = this.a * other.a + this.c * other.b;
      m.b = this.b * other.a + this.d * other.b;
      m.c = this.a * other.c + this.c * other.d;
      m.d = this.b * other.c + this.d * other.d;
      m.e = this.a * other.e + this.c * other.f + this.e;
      m.f = this.b * other.e + this.d * other.f + this.f;
      return m;
    }
    translate(x, y) {
      return this.multiply(new DOMMatrixPolyfill([1, 0, 0, 1, x, y]));
    }
    scale(x, y = x) {
      return this.multiply(new DOMMatrixPolyfill([x, 0, 0, y, 0, 0]));
    }
    inverse() {
      const det = this.a * this.d - this.b * this.c;
      return new DOMMatrixPolyfill([
        this.d / det,
        -this.b / det,
        -this.c / det,
        this.a / det,
        (this.c * this.f - this.d * this.e) / det,
        (this.b * this.e - this.a * this.f) / det,
      ]);
    }
  }
  globalThis.DOMMatrix = DOMMatrixPolyfill;

  class Path2DPolyfill {
    moveTo() {}
    lineTo() {}
    closePath() {}
    rect() {}
  }
  globalThis.Path2D = Path2DPolyfill;
}

function getLesson(id) {
  return lessonsById.get(id) || lessonsById.get(DEFAULT_LESSON_ID);
}

function publicLesson(entry) {
  const { pdfFilePath, ...rest } = entry;
  return rest;
}

/* ── Routes ─────────────────────────────────────────────────────────── */

function handleHealth(req, res) {
  sendJson(res, 200, {
    ok: true,
    provider: AI_PROVIDER,
    model: getActiveModel(),
    hasApiKey: Boolean(getApiKey()),
    // Kept for anything already reading this field.
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    defaultLessonId: DEFAULT_LESSON_ID,
    lessonIds: lessons.map((entry) => entry.id),
    retrievalTopK: RETRIEVAL_TOP_K,
  });
}

function handleLessons(req, res) {
  sendJson(
    res,
    200,
    lessons.map((entry) => ({
      id: entry.id,
      title: entry.title,
      kind: entry.kind,
      isMock: Boolean(entry.isMock),
      pageCount: entry.pages.length,
    }))
  );
}

function handleLesson(req, res, url) {
  const id = url.searchParams.get("id") || DEFAULT_LESSON_ID;
  const entry = lessonsById.get(id);
  if (!entry) return sendJson(res, 404, { error: `Unknown lesson id: ${id}` });
  sendJson(res, 200, publicLesson(entry));
}

async function handlePdf(req, res, url) {
  const id = url.searchParams.get("id") || DEFAULT_LESSON_ID;
  const entry = lessonsById.get(id);
  if (!entry || entry.kind !== "pdf") return sendJson(res, 404, { error: `No PDF for lesson id: ${id}` });

  const content = await readFile(entry.pdfFilePath);
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": content.length,
    "Cache-Control": "public, max-age=3600",
  });
  res.end(content);
}

async function handleTutorAnswer(req, res) {
  const body = await readJsonBody(req);
  const question = text(body.question);
  if (!question) return sendJson(res, 400, { error: "Question is required" });

  const lesson = getLesson(text(body.lessonId));
  const selectedText = text(body.selectedText);
  const selectedRegion = body.selectedRegion || null;
  const regionImage = parseRegionImage(body.regionImage);
  const pinnedPage = Number(body.pageNumber) || 0;
  const retrieved = retrievePages(lesson, question, selectedText, pinnedPage);

  // Có ảnh thì dùng prompt thị giác riêng — model được NHÌN vùng khoanh, nên luật
  // "chỉ dựa vào text" của prompt thường không còn đúng và phải viết lại.
  const prompt = regionImage
    ? buildVisualPrompt({ question, selectedRegion, retrieved })
    : buildAnswerPrompt({ question, selectedText, selectedRegion, retrieved });

  const json = await callModelJson(prompt, { image: regionImage });
  sendJson(
    res,
    200,
    normalizeAnswer(json, {
      retrieved,
      pinnedPage,
      selectedText,
      selectedRegion,
      hasImage: Boolean(regionImage),
    })
  );
}

async function handleTutorQuiz(req, res) {
  const body = await readJsonBody(req);
  const sourceAnswer = text(body.sourceAnswer);
  if (!sourceAnswer) return sendJson(res, 400, { error: "Source answer is required" });

  const lesson = getLesson(text(body.lessonId));
  const count = clamp(Number(body.questionCount) || 2, 1, 3);
  const forceMcq = body.forceMcq === true;
  const pageNumber = Number(body.pageNumber) || 0;
  const page = lesson.pages.find((item) => item.pageNumber === pageNumber) || lesson.pages[0];

  const json = await callModelJson(buildQuizPrompt({ sourceAnswer, count, page, forceMcq }));
  sendJson(res, 200, normalizeQuiz(json, count, page.pageNumber));
}

async function handleTutorGrade(req, res) {
  const body = await readJsonBody(req);
  const learnerAnswer = text(body.learnerAnswer);
  const questionPrompt = text(body.prompt);
  if (!learnerAnswer || !questionPrompt) {
    return sendJson(res, 400, { error: "prompt and learnerAnswer are required" });
  }

  const json = await callModelJson(buildGradePrompt({
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
    .map((event) => ({ ...event, receivedAt: new Date().toISOString() }));

  if (stamped.length === 0) return sendJson(res, 400, { error: "No events supplied" });

  await mkdir(varDir, { recursive: true });
  await appendFile(eventLogPath, stamped.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
  sendJson(res, 200, { stored: stamped.length });
}

const MIN_SIGNAL_QUESTIONS = 2;
const MIN_SIGNAL_HIGHLIGHTS = 2;
const TOP_COMMON_QUESTIONS = 8;

async function handleAdminOverview(req, res, url) {
  const lessonId = text(url.searchParams.get("lessonId")) || DEFAULT_LESSON_ID;
  const lesson = getLesson(lessonId);
  const events = await readEventsForLesson(lesson.id);
  sendJson(res, 200, buildOverviewAggregate(lesson, events));
}

async function handleAdminPageQuestions(req, res, url, pageNumber) {
  const lessonId = text(url.searchParams.get("lessonId")) || DEFAULT_LESSON_ID;
  const lesson = getLesson(lessonId);
  const events = await readEventsForLesson(lesson.id);
  const questions = collectCommonQuestions(events, pageNumber, Infinity);
  sendJson(res, 200, { lessonId: lesson.id, pageNumber, questions });
}

async function handleAdminSuggestion(req, res) {
  const body = await readJsonBody(req);
  const lessonId = text(body.lessonId) || DEFAULT_LESSON_ID;
  const pageNumber = Number(body.pageNumber);
  if (!Number.isInteger(pageNumber)) return sendJson(res, 400, { error: "pageNumber is required" });

  const lesson = getLesson(lessonId);
  const events = await readEventsForLesson(lesson.id);
  const overview = buildOverviewAggregate(lesson, events);
  const page = overview.pages.find((entry) => entry.pageNumber === pageNumber);

  if (!page) return sendJson(res, 404, { error: `No aggregate for page ${pageNumber}` });
  if (page.questionCount < MIN_SIGNAL_QUESTIONS && page.highlightCount < MIN_SIGNAL_HIGHLIGHTS) {
    const error = new Error(
      `Chưa đủ tín hiệu ở trang ${pageNumber} để tạo smart suggestion (cần ít nhất ${MIN_SIGNAL_QUESTIONS} câu hỏi hoặc ${MIN_SIGNAL_HIGHLIGHTS} lượt bôi đen).`
    );
    error.status = 422;
    throw error;
  }

  const json = await callModelJson(buildSuggestionPrompt({ lesson, page, overview }));
  sendJson(res, 200, normalizeSuggestion(json, page, overview));
}

async function handleAdminSlidePreview(req, res) {
  const body = await readJsonBody(req);
  const lessonId = text(body.lessonId) || DEFAULT_LESSON_ID;
  const pageNumber = Number(body.pageNumber);
  if (!Number.isInteger(pageNumber)) return sendJson(res, 400, { error: "pageNumber is required" });

  const lesson = getLesson(lessonId);
  const sourcePage = lesson.pages.find((entry) => entry.pageNumber === pageNumber);
  if (!sourcePage) return sendJson(res, 404, { error: `No lesson page ${pageNumber}` });

  const recommendation = text(body.recommendation);
  if (!recommendation) return sendJson(res, 400, { error: "recommendation is required" });

  const json = await callModelJson(
    buildSlidePreviewPrompt({
      lesson,
      sourcePage,
      recommendation,
      insight: text(body.insight),
      variation: Math.max(1, Number(body.variation) || 1),
    })
  );

  sendJson(res, 200, normalizeSlidePreview(json, lesson, sourcePage, recommendation));
}

async function readEventsForLesson(lessonId) {
  let raw;
  try {
    raw = await readFile(eventLogPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const events = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event && event.lessonId === lessonId) events.push(event);
    } catch {
      // A malformed line must not take the whole dashboard down.
    }
  }
  return events;
}

// Single pass: seed one entry per lesson page (so pages with zero activity still
// show up as rows), then fold every event into its page bucket. quiz_rated and
// quiz_include_toggled carry only quizId, not pageNumber, so quizId->pageNumber
// is resolved via the quiz_generated event first.
function buildOverviewAggregate(lesson, events) {
  const byPage = new Map(
    lesson.pages.map((page) => [
      page.pageNumber,
      {
        pageNumber: page.pageNumber,
        questionCount: 0,
        highlightCount: 0,
        microQuizCount: 0,
        quizAttempts: 0,
        quizCorrect: 0,
        ratingUseful: 0,
        ratingNotUseful: 0,
        optOutCount: 0,
        notUsefulReasons: new Map(),
        questionTexts: new Map(),
        // sessionId phân biệt đã hỏi hoặc bôi đen trên trang này. Dùng làm
        // affectedLearners — đếm NGƯỜI, không phải đếm lượt: một người hỏi 10 câu
        // vẫn là một người, nếu không tỷ lệ trên tổng người học vọt quá 100%.
        interactedSessions: new Set(),
      },
    ])
  );

  const quizPage = new Map(); // quizId -> pageNumber
  const quizRating = new Map(); // quizId -> latest "useful" | "not_useful" | "cleared"
  const quizReason = new Map(); // quizId -> latest not-useful reason
  const quizIncluded = new Map(); // quizId -> latest includeInFinal (defaults true when generated)
  const sessionIds = new Set();

  const bucketFor = (pageNumber) => byPage.get(Number(pageNumber));

  for (const event of events) {
    if (event.sessionId) sessionIds.add(event.sessionId);

    switch (event.type) {
      case "ask_question": {
        const bucket = bucketFor(event.pageNumber);
        if (!bucket) break;
        bucket.questionCount += 1;
        if (event.sessionId) bucket.interactedSessions.add(event.sessionId);
        const q = text(event.question);
        if (q) bucket.questionTexts.set(q, (bucket.questionTexts.get(q) || 0) + 1);
        break;
      }
      case "selection_text": {
        const bucket = bucketFor(event.pageNumber);
        if (!bucket) break;
        bucket.highlightCount += 1;
        if (event.sessionId) bucket.interactedSessions.add(event.sessionId);
        break;
      }
      case "quiz_generated": {
        if (event.quizId) quizPage.set(event.quizId, Number(event.pageNumber));
        quizIncluded.set(event.quizId, true);
        const bucket = bucketFor(event.pageNumber);
        if (bucket) bucket.microQuizCount += 1;
        break;
      }
      case "quiz_answered": {
        const bucket = bucketFor(event.pageNumber);
        if (!bucket) break;
        bucket.quizAttempts += 1;
        if (event.isCorrect) bucket.quizCorrect += 1;
        break;
      }
      case "quiz_rated": {
        if (event.quizId) {
          quizRating.set(event.quizId, event.rating);
          quizReason.set(event.quizId, text(event.reason));
        }
        break;
      }
      case "quiz_include_toggled": {
        if (event.quizId) quizIncluded.set(event.quizId, Boolean(event.includeInFinal));
        break;
      }
      default:
        break;
    }
  }

  for (const [quizId, rating] of quizRating.entries()) {
    const bucket = bucketFor(quizPage.get(quizId));
    if (!bucket) continue;
    if (rating === "useful") bucket.ratingUseful += 1;
    else if (rating === "not_useful") {
      bucket.ratingNotUseful += 1;
      const reason = quizReason.get(quizId);
      if (reason) bucket.notUsefulReasons.set(reason, (bucket.notUsefulReasons.get(reason) || 0) + 1);
    }
  }

  for (const [quizId, included] of quizIncluded.entries()) {
    if (included) continue;
    const bucket = bucketFor(quizPage.get(quizId));
    if (bucket) bucket.optOutCount += 1;
  }

  const pages = [...byPage.values()]
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((bucket) => ({
      pageNumber: bucket.pageNumber,
      questionCount: bucket.questionCount,
      highlightCount: bucket.highlightCount,
      microQuizCount: bucket.microQuizCount,
      quizAttempts: bucket.quizAttempts,
      quizCorrect: bucket.quizCorrect,
      ratingUseful: bucket.ratingUseful,
      ratingNotUseful: bucket.ratingNotUseful,
      optOutCount: bucket.optOutCount,
      affectedLearners: bucket.interactedSessions.size,
      notUsefulReasons: [...bucket.notUsefulReasons.entries()]
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
      commonQuestions: [...bucket.questionTexts.entries()]
        .map(([question, count]) => ({ text: question, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, TOP_COMMON_QUESTIONS),
    }));

  const totals = pages.reduce(
    (acc, page) => ({
      totalQuestions: acc.totalQuestions + page.questionCount,
      totalHighlights: acc.totalHighlights + page.highlightCount,
      totalMicroQuizzes: acc.totalMicroQuizzes + page.microQuizCount,
      quizAttempts: acc.quizAttempts + page.quizAttempts,
      quizCorrect: acc.quizCorrect + page.quizCorrect,
      ratingUseful: acc.ratingUseful + page.ratingUseful,
      ratingNotUseful: acc.ratingNotUseful + page.ratingNotUseful,
      optOutCount: acc.optOutCount + page.optOutCount,
    }),
    {
      totalQuestions: 0,
      totalHighlights: 0,
      totalMicroQuizzes: 0,
      quizAttempts: 0,
      quizCorrect: 0,
      ratingUseful: 0,
      ratingNotUseful: 0,
      optOutCount: 0,
    }
  );

  const ratedTotal = totals.ratingUseful + totals.ratingNotUseful;

  return {
    lessonId: lesson.id,
    totalLearners: sessionIds.size,
    totalQuestions: totals.totalQuestions,
    totalHighlights: totals.totalHighlights,
    totalMicroQuizzes: totals.totalMicroQuizzes,
    quizAccuracy: totals.quizAttempts > 0 ? totals.quizCorrect / totals.quizAttempts : 0,
    ratingUsefulRate: ratedTotal > 0 ? totals.ratingUseful / ratedTotal : 0,
    optOutRate: totals.totalMicroQuizzes > 0 ? totals.optOutCount / totals.totalMicroQuizzes : 0,
    pages,
  };
}

function collectCommonQuestions(events, pageNumber, limit) {
  const counts = new Map();
  for (const event of events) {
    if (event.type !== "ask_question" || Number(event.pageNumber) !== pageNumber) continue;
    const q = text(event.question);
    if (!q) continue;
    counts.set(q, (counts.get(q) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([question, count]) => ({ text: question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildSuggestionPrompt({ lesson, page, overview }) {
  const wrongRate = page.quizAttempts > 0 ? (page.quizAttempts - page.quizCorrect) / page.quizAttempts : null;
  const wrongRateLine = wrongRate != null ? `, wrong rate: ${(wrongRate * 100).toFixed(0)}%` : "";
  const quizLine = `Quiz attempts: ${page.quizAttempts}, correct: ${page.quizCorrect}${wrongRateLine}`;

  return [
    "You are helping a Vietnamese instructor find which lecture pages are confusing learners, based only on real usage numbers gathered by the app.",
    "Write in Vietnamese.",
    "",
    "HARD RULES:",
    "1. Use ONLY the numbers given below. Never invent a number that is not supplied.",
    "2. If you reference a number in the insight or recommendation, it must be one of the numbers listed.",
    `3. "issueType" is a short label (max 6 words), e.g. "Câu hỏi trùng lặp nhiều lần" or "Tỷ lệ trả lời sai cao".`,
    `4. "insight" is 1-2 sentences describing what the numbers show. "recommendation" is one concrete, actionable suggestion for the instructor.`,
    "",
    `Lesson: ${lesson.title}`,
    `Page: ${page.pageNumber}`,
    `Questions asked on this page: ${page.questionCount}`,
    `Highlights on this page: ${page.highlightCount}`,
    `Micro quizzes generated on this page: ${page.microQuizCount}`,
    quizLine,
    `Rated useful: ${page.ratingUseful}, rated not useful: ${page.ratingNotUseful}`,
    `Opted out of final quiz: ${page.optOutCount}`,
    `Distinct learners in this lesson (sessions): ${overview.totalLearners}`,
    page.commonQuestions.length
      ? `Most common questions on this page:\n${page.commonQuestions.map(formatCommonQuestion).join("\n")}`
      : "No repeated question text recorded on this page.",
    "",
    "Reply with strict JSON only:",
    '{"issueType":"...","insight":"...","recommendation":"..."}',
  ].join("\n");
}

function formatCommonQuestion(q) {
  return `- "${q.text}" (asked ${q.count}x)`;
}

function normalizeSuggestion(json, page, overview) {
  const wrongRate = page.quizAttempts > 0 ? (page.quizAttempts - page.quizCorrect) / page.quizAttempts : 0;
  // Số NGƯỜI phân biệt đã hỏi/bôi đen trên trang này, không phải số lượt. Đếm lượt
  // thì một người hỏi nhiều lần sẽ đẩy affectedRate vượt 100%.
  const affectedLearners = page.affectedLearners;
  // Chặn trên ở 1: tổng người học đếm theo cả bài, về lý thuyết luôn ≥ số người
  // trên một trang, nhưng nếu log thiếu sessionId thì kẹp lại cho an toàn.
  const affectedRate =
    overview.totalLearners > 0 ? Math.min(affectedLearners / overview.totalLearners, 1) : 0;

  return {
    pageNumber: page.pageNumber,
    issueType: text(json.issueType) || "Cần xem lại trang này",
    insight: text(json.insight) || `Chưa có nhận định — ${AI_PROVIDER} không trả về nội dung hợp lệ.`,
    recommendation: text(json.recommendation) || "Xem lại trang này thủ công.",
    evidence: {
      affectedLearners,
      affectedRate,
      wrongRate,
      topQuestions: page.commonQuestions.map((q) => q.text),
    },
    generatedAt: new Date().toISOString(),
  };
}

function buildSlidePreviewPrompt({ lesson, sourcePage, recommendation, insight, variation }) {
  return [
    "You are redesigning one Vietnamese lecture slide as a concise HTML preview for an instructor.",
    "Keep the meaning grounded in the source slide. Do not add facts that are absent from the source.",
    "Apply the smart suggestion, improve scanability, and keep the result suitable for a 16:9 slide.",
    `This is design variation ${variation}; vary the wording and emphasis while preserving meaning.`,
    "Return 3-5 short bullets. Each bullet must fit on one line when possible.",
    "The callout is one short takeaway, question, or concrete emphasis line.",
    "Choose theme from: blue, teal, amber, violet.",
    "Write in Vietnamese.",
    "",
    `Lesson: ${lesson.title}`,
    `Page: ${sourcePage.pageNumber}`,
    `Source slide content: ${pageCorpus(sourcePage)}`,
    `Observed issue: ${insight || "Không có nhận định bổ sung."}`,
    `Smart suggestion to apply: ${recommendation}`,
    "",
    "Reply with strict JSON only:",
    '{"title":"...","subtitle":"...","bullets":["..."],"callout":"...","theme":"blue|teal|amber|violet","changeSummary":"..."}',
  ].join("\n");
}

function normalizeSlidePreview(json, lesson, sourcePage, recommendation) {
  const allowedThemes = new Set(["blue", "teal", "amber", "violet"]);
  const rawBullets = Array.isArray(json.bullets) ? json.bullets.map(text).filter(Boolean).slice(0, 5) : [];
  const sourcePoints = sourcePage.points?.map(text).filter(Boolean).slice(0, 4) || [];
  const fallbackBullets = sourcePoints.length
    ? sourcePoints
    : sourcePage.text
        .split(/[.!?]\s+/)
        .map(text)
        .filter(Boolean)
        .slice(0, 4);

  return {
    lessonId: lesson.id,
    pageNumber: sourcePage.pageNumber,
    title: text(json.title) || sourcePage.title || `Trang ${sourcePage.pageNumber}`,
    subtitle: text(json.subtitle),
    bullets: rawBullets.length ? rawBullets : fallbackBullets,
    callout: text(json.callout) || recommendation,
    theme: allowedThemes.has(text(json.theme)) ? text(json.theme) : "blue",
    changeSummary: text(json.changeSummary) || "Sắp xếp lại nội dung theo smart suggestion.",
    source: {
      kind: lesson.kind,
      pdfUrl: lesson.kind === "pdf" ? lesson.pdfUrl : "",
      title: sourcePage.title || `Trang ${sourcePage.pageNumber}`,
      text: pageCorpus(sourcePage),
      points: sourcePage.points || [],
      theme: sourcePage.theme || "blue",
    },
    generatedAt: new Date().toISOString(),
  };
}

/* ── Retrieval ──────────────────────────────────────────────────────── */

// Naive lexical retrieval: good enough to prove the citation contract, and it keeps
// the "only cite what was retrieved" rule enforceable. A larger deck would need real
// chunking + embeddings — see codebase/MOCKS.md.
function retrievePages(lesson, question, selectedText, pinnedPage) {
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

// Mock lessons carry title/points/visual; PDF lessons carry only extracted text.
// Support both shapes so retrieval works identically either way.
function pageCorpus(page) {
  if (page.title) return `${page.title}. ${page.text} ${(page.points || []).join(" ")}`;
  return page.text || "";
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
    ...retrieved.map((page) => `--- Page ${page.pageNumber}\n${pageCorpus(page)}`),
    "",
    `Learner selected text: ${selectedText || "(none)"}`,
    regionLine,
    `Learner question: ${question}`,
    "",
    "Reply with strict JSON only:",
    '{"answer":"...","sufficient":true,"outOfScope":false,"redirect":"","clarifyingQuestion":"","citation":{"pageNumber":1,"quote":"..."},"confidence":"high|medium|low"}',
  ].join("\n");
}

// Prompt cho câu hỏi thị giác: model ĐƯỢC NHÌN vùng học viên khoanh. Khác prompt
// thường ở ba chỗ — cho phép mô tả thứ chỉ có trong hình, bắt tự khai nguồn gốc
// câu trả lời qua "groundedIn", và dặn bỏ qua watermark.
function buildVisualPrompt({ question, selectedRegion, retrieved }) {
  return [
    "You are a Vietnamese AI tutor embedded in a slide-reading app. The learner has circled a region of a lecture slide and the cropped image is attached. Answer in Vietnamese, at most 4 sentences.",
    "",
    "HARD RULES:",
    "1. Describe ONLY what is actually visible in the attached crop, plus the lesson pages supplied below. Never add outside knowledge, never search, never guess at content that is cut off at the edge of the crop.",
    "2. Every page of this deck carries a diagonal watermark reading \"AI IN ACTION - HACKATHON\". It is NOT part of the lesson — ignore it completely and never mention it.",
    `3. If the crop is too blurry, too small, or too ambiguous to explain safely, set "sufficient": false and say what you would need instead. Do not invent a plausible-sounding reading of an unclear diagram.`,
    `4. Set "outOfScope": true ONLY when the learner asks you to do something you are not permitted to do — reveal final-quiz answers, change a grade, complete a graded assignment — or asks about something plainly unrelated to studying.`,
    `5. "groundedIn" MUST be "text" if everything you said is also written in the lesson pages below, or "image" if any part of your answer comes from what you saw in the picture (arrows, layout, colours, chart shapes) and is not spelled out in the page text. Be honest — this flag decides what the app tells the learner about how checkable your answer is.`,
    `6. "citation.pageNumber" MUST be one of: ${retrieved.map((page) => page.pageNumber).join(", ")}.`,
    `7. When "groundedIn" is "text", "citation.quote" MUST be copied verbatim from that page below. When it is "image", put the single most relevant verbatim line from the page in "citation.quote" if one exists, otherwise leave it empty — never fabricate a quote to look better grounded.`,
    "",
    "LESSON PAGES (text of the pages around the circled region):",
    ...retrieved.map((page) => `--- Page ${page.pageNumber}\n${pageCorpus(page)}`),
    "",
    selectedRegion
      ? `The crop comes from page ${selectedRegion.pageNumber || "?"} of the deck.`
      : "The crop comes from the page the learner is reading.",
    `Learner question: ${question}`,
    "",
    "Reply with strict JSON only:",
    '{"answer":"...","sufficient":true,"outOfScope":false,"redirect":"","clarifyingQuestion":"","groundedIn":"text|image","citation":{"pageNumber":1,"quote":"..."},"confidence":"high|medium|low"}',
  ].join("\n");
}

function buildQuizPrompt({ sourceAnswer, count, page, forceMcq = false }) {
  return [
    `Create a Vietnamese micro quiz of exactly ${count} question(s) that checks whether the learner understood the tutor answer below.`,
    "",
    "RULES:",
    "1. Every question must be answerable from the lesson page text alone.",
    forceMcq
      ? `2. Every question MUST be an "mcq". Never return "short_answer".`
      : `2. Include at least one "mcq". You may include one "short_answer" if it fits.`,
    "3. mcq: 3 options, exactly one correct, set correctOptionIndex (0-based).",
    "4. short_answer: supply a concise referenceAnswer instead of options.",
    "5. Keep every explanation under 2 sentences. Do not repeat the same fact twice.",
    "",
    `Lesson page ${page.pageNumber}:`,
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
function normalizeAnswer(json, { retrieved, pinnedPage, selectedText, selectedRegion, hasImage = false }) {
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
  } else if (hasImage && (json.groundedIn === "image" || !quoteVerified)) {
    // Câu trả lời đọc từ PIXEL, không phải từ text bài giảng — verifyQuote() không
    // áp dụng được, vì thứ model mô tả (mũi tên, bố cục, hình dạng biểu đồ) vốn
    // không tồn tại dưới dạng chữ để đối chiếu.
    //
    // Đây KHÔNG phải lỗi, nhưng cũng KHÔNG được trình bày như câu trả lời đã đối
    // chiếu nguồn. Tách thành trạng thái riêng để UI nói thật với học viên rằng
    // mức kiểm chứng ở đây thấp hơn, thay vì im lặng gắn cờ "chưa đối chiếu được"
    // rồi để người học tưởng hệ thống hỏng.
    kind = "visual";
    confidence = "low";
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
      // "image" = câu trả lời đọc từ vùng ảnh đã khoanh, không đối chiếu được với
      // text bài giảng. "text" = đường cũ, vẫn qua verifyQuote như thường.
      groundedIn: hasImage && (json.groundedIn === "image" || !quoteVerified) ? "image" : "text",
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

// Chuẩn hoá dấu câu kiểu chữ trước khi so khớp trích dẫn.
//
// Lý do có hàm này: deck dùng nháy cong “ ˮ và gạch dài —, còn model khi chép lại
// thường tự đổi sang " và -. Nội dung y hệt, nhưng so khớp chuỗi thô thì trượt, nên
// một trích dẫn TRUNG THỰC bị đánh dấu "chưa đối chiếu được". Golden set lượt 1
// phát hiện đúng lỗi này: 5/12 case chiều "đúng-có-căn-cứ" trượt oan vì nó.
//
// Chỉ chuẩn hoá HÌNH DẠNG dấu câu, tuyệt đối không nới lỏng việc so khớp từ ngữ —
// model diễn giải lại hay bỏ bớt nội dung thì vẫn phải trượt như cũ.
const TYPOGRAPHIC = [
  // Ky tu vung Private Use Area: pdf.js anh xa glyph cua font icon nhung trong PDF
  // sang U+E000-U+F8FF. Chung vo hinh, khong mang nghia, va model khong the chep lai
  // - nen bat ky trich dan nao di ngang qua chung deu KHONG BAO GIO khop duoc.
  // Trang 17 cua deck co U+E08B va U+E088 giua "2020" va "GPT 3"; golden set luot 2
  // va 3 deu truot case T24 vi dung ly do nay, mot cach tat dinh.
  [/[\u{E000}-\u{F8FF}]/gu, " "],
  [/[‘’‚‛ʼˮ]/g, "'"],
  [/[“”„‟«»]/g, '"'],
  [/[‐-―−]/g, "-"],
  [/[…]/g, "..."],
  [/[   ]/g, " "],
];

function flatten(value) {
  let out = String(value).toLowerCase();
  for (const [pattern, replacement] of TYPOGRAPHIC) out = out.replace(pattern, replacement);
  return out.replace(/\s+/g, " ").trim();
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

/* ── Model providers ────────────────────────────────────────────────── */

// The single choke point every AI call goes through. Both providers take the same
// prompt string and return the same parsed JSON object, so nothing downstream —
// normalizeAnswer, verifyQuote, the three refusal paths, the admin suggestion
// builder — knows or cares which model produced it.
// `image` (tuỳ chọn) là { mediaType, base64 } — vùng học viên khoanh trên slide,
// đã cắt từ canvas phía trình duyệt. Hai provider nhận ảnh theo hai định dạng khác
// nhau, nhưng chỗ rẽ vẫn chỉ có một nên phần còn lại của server không đổi.
function callModelJson(prompt, options = {}) {
  return AI_PROVIDER === "claude" ? callClaudeJson(prompt, options) : callGeminiJson(prompt, options);
}

// Ảnh gửi lên là base64 trong JSON body nên phồng ~33%. Chặn ở đây để một vùng
// khoanh quá to không làm treo demo hoặc đội token ngoài dự tính.
const MAX_IMAGE_BASE64_BYTES = 1_500_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Nhận data URL từ client, tách ra { mediaType, base64 } và từ chối thẳng nếu sai
// định dạng hoặc quá lớn — không đẩy rác lên nhà cung cấp model.
function parseRegionImage(value) {
  if (!value) return null;
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(String(value));
  if (!match) {
    const error = new Error("regionImage phải là data URL base64.");
    error.status = 400;
    throw error;
  }
  const [, mediaType, base64] = match;
  if (!ALLOWED_IMAGE_TYPES.has(mediaType)) {
    const error = new Error(`Định dạng ảnh không hỗ trợ: ${mediaType}`);
    error.status = 400;
    throw error;
  }
  if (base64.length > MAX_IMAGE_BASE64_BYTES) {
    const error = new Error("Vùng khoanh quá lớn — hãy khoanh hẹp lại quanh phần cần hỏi.");
    error.status = 413;
    throw error;
  }
  return { mediaType, base64 };
}

const API_KEY_ENV = { gemini: "GEMINI_API_KEY", claude: "ANTHROPIC_API_KEY" };

function resolveProvider() {
  const fromFlag = process.argv.includes("--claude")
    ? "claude"
    : process.argv.includes("--gemini")
      ? "gemini"
      : "";
  const value = String(fromFlag || process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  if (value !== "gemini" && value !== "claude") {
    // Loud, but never fatal: a typo must not kill a live demo. /api/health always
    // reports the provider that actually ran, so this can't pass unnoticed.
    console.error(`AI_PROVIDER khong hop le: "${value}". Chi nhan "gemini" hoac "claude". Dang chay gemini.`);
    return "gemini";
  }
  return value;
}

function getApiKey() {
  return process.env[API_KEY_ENV[AI_PROVIDER]] || "";
}

function getActiveModel() {
  return AI_PROVIDER === "claude" ? getClaudeModel() : getGeminiModel();
}

function missingKeyError() {
  const error = new Error(
    `Chưa cấu hình ${API_KEY_ENV[AI_PROVIDER]} — sao chép .env.example sang .env và điền key.`
  );
  error.status = 503;
  return error;
}

async function callGeminiJson(prompt, { image } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw missingKeyError();

  const model = getGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            // Ảnh đặt TRƯỚC câu hỏi: model đọc bối cảnh thị giác rồi mới tới yêu cầu.
            ...(image ? [{ inline_data: { mime_type: image.mediaType, data: image.base64 } }] : []),
            { text: prompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `Gemini request failed with ${response.status}`;
    const error = new Error(message);
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

// Claude has no responseMimeType equivalent, so the JSON contract is stated in a
// system prompt. parseJsonLoose() is still the safety net, exactly as for Gemini.
const CLAUDE_JSON_SYSTEM =
  "You reply with a single strict JSON object and nothing else. No markdown fences, no commentary.";

async function callClaudeJson(prompt, { image } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw missingKeyError();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: getClaudeModel(),
      max_tokens: 2048,
      // Haiku 4.5 still accepts temperature (the Claude 5 models reject it), so both
      // providers run at the same 0.2 — keeps the two comparable on the golden set.
      temperature: 0.2,
      // No `thinking` and no `output_config.effort`: Haiku 4.5 does not think by
      // default (good for demo latency) and returns 400 if sent an effort level.
      system: CLAUDE_JSON_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            // Anh dat TRUOC cau hoi: model doc boi canh thi giac roi moi toi yeu cau.
            ...(image
              ? [{ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } }]
              : []),
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `Claude request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }

  // Claude can decline with HTTP 200 and an empty content array — check this before
  // reading content, or the empty-body branch below reports a misleading cause.
  if (data.stop_reason === "refusal") {
    const error = new Error("Claude từ chối trả lời yêu cầu này.");
    error.status = 502;
    throw error;
  }

  const body = (Array.isArray(data.content) ? data.content : [])
    .filter((block) => block && block.type === "text")
    .map((block) => block.text || "")
    .join("")
    .trim();

  if (!body) {
    const error = new Error("Claude returned an empty response");
    error.status = 502;
    throw error;
  }
  return parseJsonLoose(body);
}

function getClaudeModel() {
  return String(process.env.CLAUDE_MODEL || "claude-haiku-4-5").trim();
}

/* ── HTTP plumbing ──────────────────────────────────────────────────── */

async function serveStatic(pathname, res) {
  // "/" mở màn đăng nhập (mock) — nó tự chuyển tiếp sang /index.html hoặc
  // /admin.html tuỳ vai trò. Xem codebase/public/auth.js và codebase/MOCKS.md.
  const filePath = normalize(join(publicDir, pathname === "/" ? "/login.html" : pathname));
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

  const headers = { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" };
  // Vendored libraries are content-stable and large — cache them. App code changes
  // constantly during development, so it must never be served stale from cache.
  headers["Cache-Control"] = pathname.startsWith("/vendor/") ? "public, max-age=86400" : "no-store";
  res.writeHead(200, headers);
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
