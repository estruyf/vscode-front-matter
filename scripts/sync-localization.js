const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const transKey = process.env.TRANSLATION_API_KEY || "";
const apiUrl = process.env.TRANSLATION_API_URL || "";
const location = process.env.TRANSLATION_API_LOCATION || "";

const getTranslation = (translation) => {
  let value = undefined;

  if (translation && translation.translations && translation.translations.length > 0) {
    value = translation.translations[0].text;
  }

  return value;
}

const callTranslationService = async (body, locale) => {
  const response = await fetch(`${apiUrl}/translate?api-version=3.0&from=en&to=${locale}`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': transKey,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'X-ClientTraceId': uuidv4().toString(),
    },
    body
  });

  if (!response.ok) {
    return undefined;
  }

  return await response.json();
}

(async () => {
  // Get all the files from the l10n directory
  const files = fs.readdirSync(path.join(__dirname, '../l10n'));

  // Get the EN file
  const enFile = fs.readFileSync(path.join(__dirname, '../l10n/bundle.l10n.json'), 'utf8');
  const enContent = JSON.parse(enFile);
  const enKeys = Object.keys(enContent);

  console.log(`Starting l10n bundles`);
  for (const file of files) {
    if (file.endsWith(`bundle.l10n.json`)) {
      continue;
    }

    // Get the file content
    const fileContent = fs.readFileSync(path.join(__dirname, `../l10n/${file}`), 'utf8');
    let content = {};

    // Get the locale
    const fileName = path.basename(file);
    const fileSplit = fileName.split('.');
    const locale = fileSplit[fileSplit.length - 2];
    if (!locale) {
      continue;
    }
    console.log(`- Processing: ${locale}`);

    try {
      content = JSON.parse(fileContent);
    } catch (e) {
      // Ignore the error
    }

    const keysToTranslate = [];

    // Loop through the EN keys
    for (const key of enKeys) {
      // If the key does not exist in the file, add it
      if (!content[key] || content[key].startsWith(`🚧: `)) {
        keysToTranslate.push({
          name: key,
          value: enContent[key],
        });

        if (!apiUrl || !transKey || !location) {
          content[key] = `${enContent[key]}`;
        }
      }
    }

    if (apiUrl && transKey && location) {
      if (keysToTranslate.length > 0) {
        console.log(`  - Translating: ${keysToTranslate.length}`);
        const body = JSON.stringify(keysToTranslate.map(key => ({ text: key.value })));
        const data = await callTranslationService(body, locale);
        
        for (let i = 0; i < keysToTranslate.length; i++) {
          const keyToTranslate = keysToTranslate[i];
          const translation = getTranslation(data[i]);

          if (keyToTranslate.name && translation) {
            content[keyToTranslate.name] = translation;
          } else {
            content[keyToTranslate.name] = `${keyToTranslate.value}`;
          }
        }
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

  console.log(``);
  console.log(`Starting nls bundles`);
  for (const file of pkgFiles) {
    const fileContent = fs.readFileSync(file, 'utf8');
    let content = {};

    // Get the locale
    const fileName = path.basename(file);
    const fileSplit = fileName.split('.');
    const locale = fileSplit[fileSplit.length - 2];
    if (!locale) {
      continue;
    }
    console.log(`- Processing: ${locale}`);

    try {
      content = JSON.parse(fileContent);
    } catch (e) {
      // Ignore the error
    }

    const keysToTranslate = [];

    // Loop through the EN keys
    for (const key of enPkgKeys) {
      const contentValue = content[key];
      if (!contentValue || contentValue.startsWith(`🚧: `)) {
        keysToTranslate.push({
          name: key,
          value: enPkgContent[key],
        });

        if (!apiUrl || !transKey || !location) {
          content[key] = `🚧: ${enPkgContent[key]}`;
        }
      }
    }

    if (apiUrl && transKey && location) {
      if (keysToTranslate.length > 0) {
        console.log(`  - Translating: ${keysToTranslate.length}`);
        const body = JSON.stringify(keysToTranslate.map(key => ({ text: key.value })));
        const data = await callTranslationService(body, locale);
        
        for (let i = 0; i < keysToTranslate.length; i++) {
          const keyToTranslate = keysToTranslate[i];
          const translation = getTranslation(data[i]);

          if (keyToTranslate.name && translation) {
            content[keyToTranslate.name] = translation;
          } else {
            content[keyToTranslate.name] = `${keyToTranslate.value}`;
          }
        }
      }
    }

    // Write the file
    fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
  }
})();