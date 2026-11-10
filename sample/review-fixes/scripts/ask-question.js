// Content script with a question: the answer comes back as an extra "message=..." argument
const record = require('./record');
const [wsPath, filePath, , ...answers] = process.argv.slice(2);

if (answers.length === 0) {
  console.log(JSON.stringify({
    questions: [{ name: 'message', message: 'Type an answer with quotes, $(...) or backticks', default: 'it\'s "quoted" $(touch fm-pwned) `ls`' }]
  }));
} else {
  record(wsPath, { script: 'ask-question', filePath, answers });
  console.log(`Answer received: ${answers.join(' ')}`);
}
