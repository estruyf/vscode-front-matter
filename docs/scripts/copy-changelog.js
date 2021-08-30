const fs = require('fs');
const path = require('path');

(() => {
  const changelogPath = path.resolve(__dirname, '../../CHANGELOG.md');
  fs.copyFileSync(changelogPath, path.resolve(__dirname, '../content/changelog/CHANGELOG.md'));
})();