// Golden-set runner for POST /api/admin/suggestions (PRD §12 Smart Suggestion Engine).
//
// Unlike eval/run-golden-tests.mjs (which tests a standalone intent classifier that
// the live server never calls), this spins up the REAL server, injects synthetic-but-
// realistic events into a throwaway event log, and calls the REAL endpoint. Two kinds
// of check run per case:
//   1. Algebra check — evidence.* in the response must match numbers hand-computed
//      from the seeded events. Pure arithmetic, no AI involved, must always be exact.
//   2. Grounding check — every number >=4 that the AI writes in insight/recommendation
//      must trace back to a number actually present in the evidence given to it. This
//      is the check nothing else in the repo does today: it catches a model inventing
//      a percentage or headcount that was never in its input.
//
// Usage: node eval/run-admin-suggestion-eval.mjs [admin_suggestion_golden_set.json]

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const datasetPath = resolve(rootDir, "eval", process.argv[2] || "admin_suggestion_golden_set.json");
const resultsDir = resolve(rootDir, "eval", "results");
const PORT = Number(process.env.EVAL_PORT || 3999);
const BASE_URL = `http://localhost:${PORT}`;
const MIN_NUMBER_CHECKED = 4;
const ROUNDING_TOLERANCE = 1;

const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
const tempDir = await mkdtemp(join(tmpdir(), "vlearn-admin-eval-"));
const eventsPath = join(tempDir, "events.jsonl");

console.log(`Dataset: ${dataset.dataset_id} (${dataset.cases.length} cases)`);
console.log(`Throwaway event log: ${eventsPath}`);
console.log(`Starting server on ${BASE_URL} ...`);

const server = spawn(process.execPath, ["codebase/server.js"], {
  cwd: rootDir,
  env: { ...process.env, PORT: String(PORT), EVENTS_LOG_PATH: eventsPath },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => (serverOutput += chunk));
server.stderr.on("data", (chunk) => (serverOutput += chunk));

let exitCode = 0;
try {
  await waitForHealth();
  const health = await fetchJson(`${BASE_URL}/api/health`);
  console.log(`Server up. Provider: ${health.provider} (${health.model}), hasApiKey: ${health.hasApiKey}`);
  if (!health.hasApiKey) {
    console.warn("WARNING: no API key configured — accept-cases will fail at the AI call, not just the threshold check.");
  }

  const results = [];
  for (const testCase of dataset.cases) {
    const result = await runCase(testCase);
    results.push(result);
    console.log(`${result.pass ? "PASS" : "FAIL"} ${testCase.id}${result.diagnostics.length ? " — " + result.diagnostics.join("; ") : ""}`);
  }

  const passed = results.filter((r) => r.pass).length;
  const summary = {
    dataset_id: dataset.dataset_id,
    target: dataset.target,
    started_at: new Date().toISOString(),
    total: results.length,
    passed,
    failed: results.length - passed,
    pass_rate: results.length ? Number((passed / results.length).toFixed(4)) : 0,
  };

  await mkdir(resultsDir, { recursive: true });
  const outputPath = join(resultsDir, `admin-suggestion-golden-run-${stampForFile(summary.started_at)}.json`);
  await writeFile(outputPath, JSON.stringify({ summary, results }, null, 2) + "\n", "utf8");

  console.log("");
  console.log(`Summary: ${passed}/${results.length} passed (${Math.round(summary.pass_rate * 100)}%).`);
  console.log(`Wrote ${outputPath}`);
  exitCode = summary.failed > 0 ? 1 : 0;
} catch (error) {
  console.error("Eval run failed:", error.message);
  console.error(serverOutput.slice(-2000));
  exitCode = 1;
} finally {
  server.kill();
  await rm(tempDir, { recursive: true, force: true });
}

process.exitCode = exitCode;

/* ── Per-case execution ─────────────────────────────────────────────── */

async function runCase(testCase) {
  const diagnostics = [];
  const lessonId = dataset.lessonId;

  const lines = [];
  for (const event of testCase.seedEvents || []) {
    lines.push(JSON.stringify({ lessonId, ...event }));
  }
  if (testCase.foreignSeedEvents) {
    for (const event of testCase.foreignSeedEvents.events) {
      lines.push(JSON.stringify({ lessonId: testCase.foreignSeedEvents.lessonId, ...event }));
    }
  }
  // Overwrite, not append — every case starts from a clean log so page numbers can
  // be reused across cases without one case's events bleeding into the next.
  await writeFile(eventsPath, lines.join("\n") + (lines.length ? "\n" : ""), "utf8");

  const response = await fetch(`${BASE_URL}/api/admin/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId, pageNumber: testCase.pageNumber }),
  });
  const body = await response.json().catch(() => ({}));

  if (testCase.expect.refuse) {
    if (response.status === 422) return { id: testCase.id, pass: true, diagnostics };
    diagnostics.push(`expected 422 refusal, got HTTP ${response.status}`);
    return { id: testCase.id, pass: false, diagnostics, actual: body };
  }

  if (response.status !== 200) {
    diagnostics.push(`expected HTTP 200, got ${response.status}: ${body.error || "(no error message)"}`);
    return { id: testCase.id, pass: false, diagnostics, actual: body };
  }

  checkAlgebra(testCase, body, diagnostics);
  checkGrounding(testCase, body, diagnostics);
  checkShape(body, diagnostics);

  return { id: testCase.id, pass: diagnostics.length === 0, diagnostics, actual: body };
}

/* ── Check 1: algebra (evidence.* must match hand-computed truth) ────── */

function checkAlgebra(testCase, body, diagnostics) {
  const expected = testCase.expect.evidence;
  if (!expected) return;

  if (expected.affectedLearners != null && body.evidence.affectedLearners !== expected.affectedLearners) {
    diagnostics.push(`evidence.affectedLearners expected ${expected.affectedLearners}, got ${body.evidence.affectedLearners}`);
  }
  if (expected.affectedRate != null && Math.abs(body.evidence.affectedRate - expected.affectedRate) > 0.001) {
    diagnostics.push(`evidence.affectedRate expected ${expected.affectedRate}, got ${body.evidence.affectedRate}`);
  }
  if (expected.wrongRate != null && Math.abs(body.evidence.wrongRate - expected.wrongRate) > 0.001) {
    diagnostics.push(`evidence.wrongRate expected ${expected.wrongRate}, got ${body.evidence.wrongRate}`);
  }
  if (expected.topQuestionsCount != null && body.evidence.topQuestions.length !== expected.topQuestionsCount) {
    diagnostics.push(
      `evidence.topQuestions.length expected ${expected.topQuestionsCount}, got ${body.evidence.topQuestions.length} (${JSON.stringify(body.evidence.topQuestions)})`
    );
  }

  if (testCase.topQuestionRanking) {
    // Only the text order matters here (count isn't echoed in evidence.topQuestions,
    // which is text-only) — the count itself is checked indirectly via
    // topQuestionsCount plus this ordering, since the aggregator sorts by count desc.
    const wantOrder = testCase.topQuestionRanking.map((q) => q.text);
    const gotOrder = body.evidence.topQuestions;
    if (JSON.stringify(wantOrder) !== JSON.stringify(gotOrder)) {
      diagnostics.push(`topQuestions order expected ${JSON.stringify(wantOrder)}, got ${JSON.stringify(gotOrder)}`);
    }
  }
}

/* ── Check 2: grounding (no number in the AI text may be invented) ───── */

function checkGrounding(testCase, body, diagnostics) {
  const allowed = new Set(
    [
      testCase.pageNumber,
      body.evidence.affectedLearners,
      Math.round(body.evidence.affectedRate * 100),
      Math.round(body.evidence.wrongRate * 100),
    ].map(Number)
  );
  // Every raw count seeded for this page is fair game too (questionCount,
  // highlightCount, quiz attempts/correct) — the prompt includes all of them, not
  // just the derived evidence fields, so the model is allowed to cite any of them.
  const derived = deriveCountsFromSeed(testCase.seedEvents || []);
  for (const value of Object.values(derived)) allowed.add(Number(value));

  // A number embedded in a common-question's own text (e.g. "...tối thiểu 20
  // case?") was literally handed to the model as part of that question — quoting
  // it back is grounding, not fabrication. Pull numbers out of every question text
  // the model actually saw (echoed in evidence.topQuestions) and allow those too.
  for (const question of body.evidence.topQuestions || []) {
    for (const match of question.matchAll(/\d+/g)) allowed.add(Number(match[0]));
  }

  const text = `${body.insight} ${body.recommendation}`;
  const found = [...text.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(",", ".")));

  for (const n of found) {
    if (n < MIN_NUMBER_CHECKED) continue;
    const grounded = [...allowed].some((a) => Math.abs(a - n) <= ROUNDING_TOLERANCE);
    if (!grounded) {
      diagnostics.push(
        `possible fabricated number in AI text: "${n}" not found in evidence (allowed: ${[...allowed].sort((a, b) => a - b).join(", ")}) — insight/recommendation: "${body.insight}" / "${body.recommendation}"`
      );
    }
  }
}

function deriveCountsFromSeed(seedEvents) {
  const counts = { questionCount: 0, highlightCount: 0, microQuizCount: 0, quizAttempts: 0, quizCorrect: 0 };
  for (const event of seedEvents) {
    if (event.type === "ask_question") counts.questionCount += 1;
    else if (event.type === "selection_text") counts.highlightCount += 1;
    else if (event.type === "quiz_generated") counts.microQuizCount += 1;
    else if (event.type === "quiz_answered") {
      counts.quizAttempts += 1;
      if (event.isCorrect) counts.quizCorrect += 1;
    }
  }
  counts.wrongCount = counts.quizAttempts - counts.quizCorrect;
  return counts;
}

/* ── Check 3: response shape (contract, not content) ──────────────────── */

function checkShape(body, diagnostics) {
  if (!text(body.issueType)) diagnostics.push("issueType is empty");
  if (!text(body.insight)) diagnostics.push("insight is empty");
  if (!text(body.recommendation)) diagnostics.push("recommendation is empty");
  if (!Array.isArray(body.evidence?.topQuestions)) diagnostics.push("evidence.topQuestions is not an array");
}

/* ── Plumbing ──────────────────────────────────────────────────────────── */

async function waitForHealth(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {
      // server not listening yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not become healthy within ${timeoutMs}ms.\n${serverOutput}`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stampForFile(value) {
  return value.replace(/[:.]/g, "-");
}
