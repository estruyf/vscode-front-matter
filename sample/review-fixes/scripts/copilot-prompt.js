// Content script that asks Copilot for text: the response comes back as "promptResponse=..."
const record = require('./record');
const [wsPath, filePath, , ...extra] = process.argv.slice(2);
const response = extra.find((arg) => arg.startsWith('promptResponse='));

if (!response) {
  console.log(JSON.stringify({
    fmAction: 'promptCopilot',
    fmPrompt: 'Reply with exactly this text and nothing else: it\'s " & touch fm-pwned & " $(touch fm-pwned) `touch fm-pwned`'
  }));
} else {
  record(wsPath, { script: 'copilot-prompt', filePath, response });
  console.log('Copilot response received');
}
