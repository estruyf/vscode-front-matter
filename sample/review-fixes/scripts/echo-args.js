// Content script: records the arguments it receives (workspace, file, front matter JSON)
const record = require('./record');
const [wsPath, filePath, frontMatter] = process.argv.slice(2);

let frontMatterParses = false;
try {
  JSON.parse(frontMatter);
  frontMatterParses = true;
} catch {}

record(wsPath, {
  script: 'echo-args',
  filePath,
  frontMatter,
  frontMatterParses,
  // #1070 keeps encoding ' as %27 on macOS/Linux, #1076 passes it as is
  singleQuotesEncoded: (frontMatter || '').includes('%27')
});
console.log(`Received: ${filePath}`);
