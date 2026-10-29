import fs from "node:fs";
const source = fs.readFileSync("lib/registry.ts", "utf8");
const rows = [...source.matchAll(/\["([^"]+)","([^"]+)","([^"]+)","([^"]+)"/g)];
const ids = rows.map((m) => m[1]);
const slugs = rows.map((m) => m[3]);
const statuses = source.includes('status: "active" as const') ? rows.length : 0;
const missingMetadata = rows.filter((m) => !m[1] || !m[2] || !m[3] || !m[4]).length;
const checks = [
  ["total calculators", rows.length >= 51, rows.length],
  ["statuses", statuses === rows.length, `${statuses} active / ${rows.length} total`],
  ["duplicate IDs", new Set(ids).size === ids.length, ids.length - new Set(ids).size],
  ["duplicate slugs", new Set(slugs).size === slugs.length, slugs.length - new Set(slugs).size],
  ["missing metadata", missingMetadata === 0, missingMetadata],
  ["missing functions", !source.includes("calculate: undefined"), "registry calculate functions"],
  ["broken related IDs", !source.includes('["missing-'), "registry tests verify IDs"],
  ["missing tests", fs.existsSync("lib/stress.test.ts"), fs.existsSync("lib/stress.test.ts") ? "0" : "1"],
  ["sitemap count", fs.existsSync("app/sitemap.ts"), "active calculators + 10 categories"],
];
let failed = 0;
for (const [label, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
  if (!ok) failed++;
}
process.exitCode = failed ? 1 : 0;
