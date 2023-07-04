const fs = require('fs');
const path = require('path');

(async () => {
  // Get all the files from the l10n directory
  const files = fs.readdirSync(path.join(__dirname, '../l10n'));

  // Get the EN file
  const enFile = fs.readFileSync(path.join(__dirname, '../l10n/bundle.l10n.json'), 'utf8');
  const enContent = JSON.parse(enFile);
  const enKeys = Object.keys(enContent);

  for (const file of files) {
    if (file.endsWith(`bundle.l10n.json`)) {
      continue;
    }

    // Get the file content
    const fileContent = fs.readFileSync(path.join(__dirname, `../l10n/${file}`), 'utf8');
    const content = JSON.parse(fileContent);

    // Loop through the EN keys
    for (const key of enKeys) {
      // If the key does not exist in the file, add it
      if (!content[key]) {
        content[key] = `🚧: ${enContent[key]}`;
      }
    }

    // Write the file
    fs.writeFileSync(path.join(__dirname, `../l10n/${file}`), JSON.stringify(content, null, 2), 'utf8');
  }
})();