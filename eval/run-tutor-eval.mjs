// Chạy golden set của lát cắt học viên qua ĐÚNG endpoint thật (POST /api/tutor/answer),
// tức là qua cả retrieval, lời gọi AI, và lớp xác minh trích dẫn của server.
//
// Khác với eval/run-golden-tests.mjs (chấm codebase/intent-router.js — một bộ so khớp
// từ khoá tất định, KHÔNG có AI): file này gọi model thật, nên kết quả thay đổi giữa
// các lượt chạy. Đó là điều đúng đắn — cái cần đo là hành vi của hệ thống thật.
//
//   node eval/run-tutor-eval.mjs                  # mặc định http://localhost:3000
//   node eval/run-tutor-eval.mjs --port 5001
//   node eval/run-tutor-eval.mjs --base http://localhost:5001

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const args = process.argv.slice(2);
const portArg = readFlag("--port");
const baseUrl = readFlag("--base") || `http://localhost:${portArg || 3000}`;
const datasetPath = resolve(rootDir, readFlag("--dataset") || "eval/golden-set-tutor.json");
const resultsDir = resolve(rootDir, "eval", "results");

const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
const health = await fetchHealth();

console.log(`Base URL : ${baseUrl}`);
console.log(`Provider : ${health.provider} (${health.model})`);
console.log(`Dataset  : ${dataset.dataset_id} — ${dataset.cases.length} case\n`);

const startedAt = new Date().toISOString();
const results = [];

for (const testCase of dataset.cases) {
  const result = await runCase(testCase);
  results.push(result);
  console.log(
    `${result.pass ? "PASS" : "FAIL"} ${testCase.id} [${testCase.dimension}] ` +
      `${result.actual.kind ?? "-"}${result.pass ? "" : "  <- " + result.diagnostics.join("; ")}`
  );
}

// Mỗi chiều tính riêng: một case chỉ tính vào chiều nó được thiết kế để đo.
const byDimension = {};
for (const key of Object.keys(dataset.dimensions)) {
  const subset = results.filter((r) => r.dimension === key);
  const passed = subset.filter((r) => r.pass).length;
  byDimension[key] = {
    total: subset.length,
    passed,
    rate: subset.length ? Number((passed / subset.length).toFixed(4)) : null,
  };
}

const layerOne = results.filter((r) => r.layer === "1");
const summary = {
  dataset_id: dataset.dataset_id,
  base_url: baseUrl,
  provider: health.provider,
  model: health.model,
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  total: results.length,
  passed: results.filter((r) => r.pass).length,
  failed: results.filter((r) => !r.pass).length,
  pass_rate: Number((results.filter((r) => r.pass).length / results.length).toFixed(4)),
  by_dimension: byDimension,
  layer1_failures: layerOne.filter((r) => !r.pass).map((r) => r.id),
};

await mkdir(resultsDir, { recursive: true });
const outputPath = join(resultsDir, `tutor-eval-${startedAt.replace(/[:.]/g, "-")}.json`);
await writeFile(outputPath, JSON.stringify({ summary, results }, null, 2) + "\n", "utf8");

console.log("\n── Kết quả theo chiều ─────────────────────────");
for (const [key, value] of Object.entries(byDimension)) {
  const pct = value.rate == null ? "n/a" : `${Math.round(value.rate * 100)}%`;
  console.log(`  ${key.padEnd(16)} ${String(value.passed).padStart(2)}/${value.total}  ${pct}`);
}
console.log(`\nTổng: ${summary.passed}/${summary.total} (${Math.round(summary.pass_rate * 100)}%)`);
console.log(`Case lớp ① fail: ${summary.layer1_failures.length ? summary.layer1_failures.join(", ") : "không có"}`);
console.log(`Đã ghi ${outputPath}`);

if (summary.failed > 0) process.exitCode = 1;

/* ── helpers ─────────────────────────────────────────────── */

async function runCase(testCase) {
  const body = {
    lessonId: dataset.lessonId,
    question: testCase.question,
    ...(testCase.pageNumber ? { pageNumber: testCase.pageNumber } : {}),
    ...(testCase.selectedText ? { selectedText: testCase.selectedText } : {}),
  };

  let actual;
  try {
    const response = await fetch(`${baseUrl}/api/tutor/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) {
      return fail(testCase, { kind: null }, [`HTTP ${response.status}: ${json.error || "?"}`]);
    }
    actual = json;
  } catch (error) {
    return fail(testCase, { kind: null }, [`lỗi mạng: ${error.message}`]);
  }

  const diagnostics = [];
  const want = testCase.expect;

  if (actual.kind !== want.kind) {
    diagnostics.push(`kind: mong ${want.kind}, nhận ${actual.kind}`);
  }

  // Chỉ soi trích dẫn với câu trả lời thật — các đường từ chối không có quote để đối chiếu.
  if (want.kind === "answer") {
    if (want.verified && actual.citation?.verified !== true) {
      diagnostics.push(
        `trích dẫn chưa đối chiếu được (citationVerified=${actual.citation?.citationVerified}, quoteVerified=${actual.citation?.quoteVerified})`
      );
    }
    if (Array.isArray(want.pages) && !want.pages.includes(actual.citation?.pageNumber)) {
      diagnostics.push(`trích trang ${actual.citation?.pageNumber}, mong ${want.pages.join(" hoặc ")}`);
    }
  }

  return {
    id: testCase.id,
    layer: testCase.layer,
    dimension: testCase.dimension,
    source: testCase.source,
    question: testCase.question,
    pass: diagnostics.length === 0,
    expected: want,
    actual: {
      kind: actual.kind,
      confidence: actual.confidence,
      citation: actual.citation,
      answer: (actual.answer || "").slice(0, 200),
      retrievedPages: actual.retrievedPages,
    },
    diagnostics,
  };
}

function fail(testCase, actual, diagnostics) {
  return {
    id: testCase.id,
    layer: testCase.layer,
    dimension: testCase.dimension,
    source: testCase.source,
    question: testCase.question,
    pass: false,
    expected: testCase.expect,
    actual,
    diagnostics,
  };
}

async function fetchHealth() {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Không gọi được ${baseUrl}/api/health — server đã chạy chưa?\n  ${error.message}`);
    process.exit(1);
  }
}

function readFlag(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
}
