const fs = require('fs');

const coverageSummary = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));

let markdownReport = `
## Summary

| Metric      | Percentage |
| ----------- | ---------- |
| Statements  | ${coverageSummary.total.statements.pct}% |
| Branches    | ${coverageSummary.total.branches.pct}% |
| Functions   | ${coverageSummary.total.functions.pct}% |
| Lines       | ${coverageSummary.total.lines.pct}% |
\n`;


markdownReport += `
## Test Coverage Report

| File        | Statements | Branches | Functions | Lines |
| ----------- | ---------- | -------- | --------- | ----- |
`;

for (const [file, metrics] of Object.entries(coverageSummary)) {
  if (file !== 'total') {
    markdownReport += `| ${file.replace('home/runner/work/blog-front/blog-front/app/', '')} | ${metrics.statements.pct}% | ${metrics.branches.pct}% | ${metrics.functions.pct}% | ${metrics.lines.pct}% |\n`;
  }
}

fs.writeFileSync('coverage-report.md', markdownReport);
