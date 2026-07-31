// Chạy golden set cho smart suggestion qua đúng endpoint thật (POST /api/admin/suggestions).
//
// Mỗi case tự nạp một bộ event cố định vào codebase/var/events.jsonl trước khi gọi,
// nên kết quả tái lập được thay vì phụ thuộc dữ liệu đang có trên máy. File gốc được
// backup và khôi phục khi xong — kể cả khi runner lỗi giữa chừng.
//
//   node eval/run-suggestion-eval.mjs --port 3000
//
// Chiều đáng giá nhất ở đây là "không bịa số": trích mọi con số trong insight và
// recommendation rồi đối chiếu với tập số server thực sự đưa vào prompt. Giảng viên
// sẽ hành động dựa trên các con số này, nên một con số tự nghĩ ra là lỗi nặng.

import { mkdir, readFile, writeFile, copyFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const args = process.argv.slice(2);
const baseUrl = readFlag("--base") || `http://localhost:${readFlag("--port") || 3000}`;
const datasetPath = resolve(rootDir, readFlag("--dataset") || "eval/golden-set-suggestion.json");
const resultsDir = resolve(rootDir, "eval", "results");
const eventsPath = join(rootDir, "codebase", "var", "events.jsonl");
const backupPath = `${eventsPath}.eval-backup`;

const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
const health = await fetchHealth();

console.log(`Base URL : ${baseUrl}`);
console.log(`Provider : ${health.provider} (${health.model})`);
console.log(`Dataset  : ${dataset.dataset_id} — ${dataset.cases.length} case\n`);

const hadEvents = await exists(eventsPath);
if (hadEvents) await copyFile(eventsPath, backupPath);

const startedAt = new Date().toISOString();
const results = [];

try {
  for (const testCase of dataset.cases) {
    const result = await runCase(testCase);
    results.push(result);
    console.log(
      `${result.pass ? "PASS" : "FAIL"} ${testCase.id} [${testCase.dimension}] ` +
        `HTTP ${result.actual.status}${result.pass ? "" : "  <- " + result.diagnostics.join("; ")}`
    );
  }
} finally {
  // Khôi phục dù có lỗi hay không — không được để log demo của nhóm bị bộ test ghi đè.
  if (hadEvents) await copyFile(backupPath, eventsPath);
  else await writeFile(eventsPath, "", "utf8");
  console.log(`\n${hadEvents ? "Đã khôi phục" : "Đã dọn"} codebase/var/events.jsonl`);
}

const byDimension = {};
for (const key of Object.keys(dataset.dimensions)) {
  const subset = results.filter((r) => r.dimension === key);
  const passed = subset.filter((r) => r.pass).length;
  byDimension[key] = { total: subset.length, passed, rate: subset.length ? Number((passed / subset.length).toFixed(4)) : null };
}

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
};

await mkdir(resultsDir, { recursive: true });
const outputPath = join(resultsDir, `suggestion-eval-${startedAt.replace(/[:.]/g, "-")}.json`);
await writeFile(outputPath, JSON.stringify({ summary, results }, null, 2) + "\n", "utf8");

console.log("\n── Kết quả theo chiều ─────────────────────────");
for (const [key, value] of Object.entries(byDimension)) {
  const pct = value.rate == null ? "n/a" : `${Math.round(value.rate * 100)}%`;
  console.log(`  ${key.padEnd(22)} ${String(value.passed).padStart(2)}/${value.total}  ${pct}`);
}
console.log(`\nTổng: ${summary.passed}/${summary.total} (${Math.round(summary.pass_rate * 100)}%)`);
console.log(`Đã ghi ${outputPath}`);

if (summary.failed > 0) process.exitCode = 1;

/* ── helpers ─────────────────────────────────────────────── */

async function runCase(testCase) {
  await seedEvents(testCase.events || []);

  let status = 0;
  let body = {};
  try {
    const response = await fetch(`${baseUrl}/api/admin/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: dataset.lessonId, pageNumber: testCase.pageNumber }),
    });
    status = response.status;
    body = await response.json().catch(() => ({}));
  } catch (error) {
    return fail(testCase, { status: 0 }, [`lỗi mạng: ${error.message}`]);
  }

  const diagnostics = [];
  const want = testCase.expect;

  if (status !== want.status) diagnostics.push(`HTTP: mong ${want.status}, nhận ${status}`);

  if (status === 200) {
    if (want.pageNumber != null && body.pageNumber !== want.pageNumber) {
      diagnostics.push(`pageNumber: mong ${want.pageNumber}, nhận ${body.pageNumber}`);
    }
    if (want.affectedLearners != null && body.evidence?.affectedLearners !== want.affectedLearners) {
      diagnostics.push(
        `affectedLearners: mong ${want.affectedLearners} (đếm NGƯỜI), nhận ${body.evidence?.affectedLearners}`
      );
    }
    if (want.affectedRateAtMost != null && (body.evidence?.affectedRate ?? 0) > want.affectedRateAtMost) {
      diagnostics.push(`affectedRate ${body.evidence?.affectedRate} vượt trần ${want.affectedRateAtMost}`);
    }
    for (const field of ["issueType", "insight", "recommendation"]) {
      if (!String(body[field] || "").trim()) diagnostics.push(`thiếu "${field}"`);
    }
    if (want.noFabricatedNumbers) {
      const invented = findInventedNumbers(body);
      if (invented.length) diagnostics.push(`số không có trong dữ liệu đầu vào: ${invented.join(", ")}`);
    }
  }

  return {
    id: testCase.id,
    dimension: testCase.dimension,
    pageNumber: testCase.pageNumber,
    pass: diagnostics.length === 0,
    expected: want,
    actual: {
      status,
      pageNumber: body.pageNumber,
      issueType: body.issueType,
      insight: body.insight,
      recommendation: body.recommendation,
      evidence: body.evidence,
      error: body.error,
    },
    diagnostics,
  };
}

// Mọi con số trong insight/recommendation phải truy được về dữ liệu server đưa vào.
// Bỏ qua số trang (model hay nhắc "trang N") và các số 0-1 vì chúng là từ nối tự nhiên
// trong tiếng Việt ("một vài", "hai điểm") chứ không phải trích dẫn số liệu.
function findInventedNumbers(body) {
  const e = body.evidence || {};
  const allowed = new Set();
  const add = (n) => {
    if (n == null || Number.isNaN(n)) return;
    allowed.add(String(n));
    allowed.add(String(Math.round(n)));
  };

  add(body.pageNumber);
  add(e.affectedLearners);
  add(e.wrongRate * 100);
  add(e.affectedRate * 100);
  add((1 - e.wrongRate) * 100);
  (e.topQuestions || []).forEach(() => {});
  add((e.topQuestions || []).length);

  const text = `${body.insight || ""} ${body.recommendation || ""}`;
  const found = text.match(/\d+(?:[.,]\d+)?/g) || [];

  return [...new Set(found)].filter((raw) => {
    const value = Number(raw.replace(",", "."));
    if (value <= 1) return false;
    if (allowed.has(raw) || allowed.has(String(value)) || allowed.has(String(Math.round(value)))) return false;
    // Chấp nhận lệch 1 đơn vị do làm tròn phần trăm (66.67% -> "67" hoặc "66").
    for (const ok of allowed) {
      if (Math.abs(Number(ok) - value) <= 1) return false;
    }
    return true;
  });
}

async function seedEvents(events) {
  const lines = events.map((event) =>
    JSON.stringify({
      lessonId: dataset.lessonId,
      at: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      ...event,
    })
  );
  await mkdir(join(rootDir, "codebase", "var"), { recursive: true });
  await writeFile(eventsPath, lines.length ? lines.join("\n") + "\n" : "", "utf8");
}

function fail(testCase, actual, diagnostics) {
  return {
    id: testCase.id,
    dimension: testCase.dimension,
    pageNumber: testCase.pageNumber,
    pass: false,
    expected: testCase.expect,
    actual,
    diagnostics,
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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
