// Content script: records the arguments it receives (workspace, file, front matter JSON)
const record = require('./record');
const [wsPath, filePath, frontMatter] = process.argv.slice(2);
record(wsPath, { script: 'echo-args', filePath, frontMatter });
console.log(`Received: ${filePath}`);
