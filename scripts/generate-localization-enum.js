const fs = require('fs');
const path = require('path');
const jsoncParser = require('jsonc-parser');

const camlCase = (str) => {
  const words = str.split('.');
  const firstWord = words.shift();
  const rest = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return firstWord + rest.join('');
};

(async () => {
  // Get the EN file
  const enFile = fs.readFileSync(path.join(__dirname, '../l10n/bundle.l10n.json'), 'utf8');

  // Parse the EN file
  const en = jsoncParser.parse(enFile);

  const keys = Object.keys(en);

  // Create an enum file
  const enumFile = fs.createWriteStream(
    path.join(__dirname, '../src/localization/localization.enum.ts')
  );

  // Write the enum file header
  enumFile.write(`export enum LocalizationKey {\n`);

  // Write the enum values
  keys.forEach((key, index) => {
    enumFile.write(`  /**\n`);
    enumFile.write(`   * ${en[key]}\n`);
    enumFile.write(`   */\n`);
    enumFile.write(`  ${camlCase(key)} = '${key}'${index === keys.length - 1 ? '' : ','}\n`);
  });

  // Write the enum file footer
  enumFile.write(`}\n`);

  // Close the enum file
  enumFile.close();
})();
