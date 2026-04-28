const fs = require('node:fs');

const path = process.argv[2];
if (!path) {
  console.error('Missing commit message file path.');
  process.exit(1);
}

const firstLine = (fs.readFileSync(path, 'utf8').split(/\r?\n/)[0] ?? '').trimEnd();
const re = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,}$/;

if (!re.test(firstLine)) {
  console.error('Invalid commit message format.');
  console.error('Expected: type(scope)?: description');
  console.error('Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
  process.exit(1);
}
