const fs = require('fs');
const path = require('path');
const glob = require('glob');

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
    let content = {};

    try {
      content = JSON.parse(fileContent);
    } catch (e) {
      // Ignore the error
    }

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


  // Package JSON
  const enPkgFile = fs.readFileSync(path.join(__dirname, '../package.nls.json'), 'utf8');
  const enPkgContent = JSON.parse(enPkgFile);
  const enPkgKeys = Object.keys(enPkgContent);

  const pkgFiles = glob.sync(path.join(__dirname, '../package.nls.*.json'));

  for (const file of pkgFiles) {
    const fileContent = fs.readFileSync(file, 'utf8');
    let content = {};

    try {
      content = JSON.parse(fileContent);
    } catch (e) {
      // Ignore the error
    }

    // Loop through the EN keys
    for (const key of enPkgKeys) {
      // If the key does not exist in the file, add it
      if (!content[key]) {
        content[key] = `🚧: ${enPkgContent[key]}`;
      }
    }

    // Write the file
    fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
  }
})();