const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const files = glob.sync('src/**/*.ts*');
console.log('Total files:', files.length);

const enumFile = fs.createWriteStream(path.join(__dirname, '../localization.log'));

// for (const file of files) {
//   // Get the file and its contents
//   const fileContent = fs.readFileSync(path.join(__dirname, "../", file), 'utf8');

//   const regex = />[A-Za-z]{1,}/g;

//   const matches = fileContent.match(regex);

//   if (matches && matches.length > 0) {
//     enumFile.write(`File: ${path.join(__dirname, "../", file)}\n`);
//     enumFile.write(`Matches: ${matches.toString()}\n`);
//     enumFile.write(`\n`);
//   }
// }

for (const file of files) {
  const fileContent = fs.readFileSync(path.join(__dirname, "../", file), 'utf8');

  const $ = cheerio.load(fileContent, {
    recognizeSelfClosing: true,
    xmlMode: true,
  });

  const matches = [];

  $('*').each(function () {
    const node = $(this);

    let text = node.contents().first().text();
    text = text.trim();

    if (text &&
      !text.startsWith('{') &&
      !text.includes(`{`) &&
      !text.includes(`}`) &&
      !text.includes(`(`) &&
      !text.includes(`)`) &&
      text.split('\n').length === 1) {
      matches.push(`Text: ${text}\n`);
    }
  });

  if (matches && matches.length > 0) {
    enumFile.write(`File: ${path.join(__dirname, "../", file)}\n`);
    enumFile.write(`${matches.join('')}\n`);
    enumFile.write(`\n`);
  }
}

enumFile.close();