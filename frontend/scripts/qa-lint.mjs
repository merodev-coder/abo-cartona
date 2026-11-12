import { LegacyESLint } from 'eslint/use-at-your-own-risk';
import { writeFile } from 'node:fs/promises';
const eslint = new LegacyESLint();
const results = await eslint.lintFiles(['src']);
await writeFile('qa-lint.json', JSON.stringify(results));
const rules = {};
for (const result of results) for (const item of result.messages) if (item.severity === 2) rules[item.ruleId] = (rules[item.ruleId] || 0) + 1;
console.log(JSON.stringify({ errors: results.reduce((n, r) => n + r.errorCount, 0), warnings: results.reduce((n, r) => n + r.warningCount, 0), rules }, null, 2));
process.exitCode = results.some((r) => r.errorCount) ? 1 : 0;
