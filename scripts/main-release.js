const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
packageJson.name = "vscode-front-matter";

fs.writeFileSync(path.join(path.resolve('.'), 'package.json'), JSON.stringify(packageJson, null, 2));