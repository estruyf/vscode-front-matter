const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
packageJson.version += `.${process.argv[process.argv.length-1].substr(0, 7)}`;
packageJson.preview = true;
packageJson.name = `${packageJson.name}-beta`;
packageJson.displayName = `${packageJson.displayName} BETA`;
packageJson.description = `BETA Version of Front Matter. ${packageJson.description}`;
packageJson.icon = "assets/frontmatter-beta.png";

console.log(packageJson.version);

fs.writeFileSync(path.join(path.resolve('.'), 'package.json'), JSON.stringify(packageJson, null, 2));