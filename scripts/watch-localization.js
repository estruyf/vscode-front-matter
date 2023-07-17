const fs = require('fs');
const { exec } = require('node:child_process');
const { join } = require('path');

const localFile = '../l10n/bundle.l10n.json';

console.log(`Watching for file changes on ${localFile}`);

fs.watchFile(join(__dirname, localFile), (curr, prev) => {
  console.log(`update enum`)
  exec(`npm run localization:generate`)
});