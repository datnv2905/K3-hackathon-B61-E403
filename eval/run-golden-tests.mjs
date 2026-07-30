import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { routeIntent } from "../codebase/intent-router.js";

const rootDir = resolve(process.cwd());
const datasetPath = resolve(rootDir, process.argv[2] || "golden_test_set.json");
const resultsDir = resolve(rootDir, "eval", "results");

if (process.argv.includes("--help")) {
  console.log("Usage: npm run test:golden");
  console.log("       node eval/run-golden-tests.mjs golden_test_set.json");
  process.exit(0);
}

const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
const model = "deterministic-intent-router";
const startedAt = new Date().toISOString();
const results = [];

for (const testCase of dataset.cases) {
  let actual;
  try {
    actual = routeIntent(testCase.turns || [{ role: "user", content: testCase.query }]);
  } catch (error) {
    actual = { tool_calls: [], error: error.message || "Unexpected eval error" };
  }
  const comparison = compareExpected(testCase.expect, actual);
  results.push({
    id: testCase.id,
    phase: testCase.phase,
    failure_type: testCase.failure_type,
    pass: comparison.pass,
    expected: testCase.expect,
    actual,
    diagnostics: comparison.diagnostics,
  });
  const mark = comparison.pass ? "PASS" : "FAIL";
  console.log(`${mark} ${testCase.id}`);
}

const passed = results.filter((result) => result.pass).length;
const failed = results.length - passed;
const summary = {
  dataset_id: dataset.dataset_id,
  model,
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  total: results.length,
  passed,
  failed,
  pass_rate: results.length ? Number((passed / results.length).toFixed(4)) : 0,
};

await mkdir(resultsDir, { recursive: true });
const outputPath = join(resultsDir, `golden-run-${stampForFile(startedAt)}.json`);
await writeFile(outputPath, JSON.stringify({ summary, results }, null, 2) + "\n", "utf8");

console.log("");
console.log(`Summary: ${passed}/${results.length} passed (${Math.round(summary.pass_rate * 100)}%).`);
console.log(`Wrote ${outputPath}`);

if (failed > 0) process.exitCode = 1;

function compareExpected(expected, actual) {
  const diagnostics = [];
  if (actual.error) {
    diagnostics.push(`eval error: ${actual.error}`);
    return { pass: false, diagnostics };
  }

  const actualCalls = Array.isArray(actual.tool_calls) ? actual.tool_calls : [];

  if (expected.no_tool) {
    if (actualCalls.length === 0) return { pass: true, diagnostics };
    diagnostics.push(`expected no tool, got ${actualCalls.map((call) => call.name).join(", ")}`);
    return { pass: false, diagnostics };
  }

  const expectedCalls = Array.isArray(expected.tool_calls) ? expected.tool_calls : [];
  if (actualCalls.length !== expectedCalls.length) {
    diagnostics.push(`expected ${expectedCalls.length} tool call(s), got ${actualCalls.length}`);
    return { pass: false, diagnostics };
  }

  for (let index = 0; index < expectedCalls.length; index += 1) {
    const wanted = expectedCalls[index];
    const got = actualCalls[index] || {};
    if (wanted.name !== got.name) {
      diagnostics.push(`call ${index + 1}: expected ${wanted.name}, got ${got.name || "(none)"}`);
      continue;
    }

    const wantedArgs = wanted.args || {};
    const gotArgs = got.args || {};
    for (const [key, value] of Object.entries(wantedArgs)) {
      if (!sameValue(value, gotArgs[key])) {
        diagnostics.push(`call ${index + 1}: arg ${key} expected ${JSON.stringify(value)}, got ${JSON.stringify(gotArgs[key])}`);
      }
    }
  }

  return { pass: diagnostics.length === 0, diagnostics };
}

function sameValue(expected, actual) {
  if (typeof expected === "string" && typeof actual === "string") {
    return normalizeText(expected) === normalizeText(actual);
  }
  return JSON.stringify(expected) === JSON.stringify(actual);
}

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function stampForFile(value) {
  return value.replace(/[:.]/g, "-");
}
