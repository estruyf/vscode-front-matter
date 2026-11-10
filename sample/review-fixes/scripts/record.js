// Appends what a script received to <workspace>/script-output.json
const fs = require('fs');
const path = require('path');

module.exports = (wsPath, entry) => {
  const file = path.join(wsPath, 'script-output.json');
  let runs = [];
  try {
    runs = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  runs.push({ time: new Date().toISOString(), ...entry });
  fs.writeFileSync(file, JSON.stringify(runs, null, 2));
};
