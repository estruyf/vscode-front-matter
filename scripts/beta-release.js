const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

const packageJson = require('../package.json');
const version = packageJson.version.split('.');

packageJson.version = `${version[0]}.${version[1]}.${process.argv[process.argv.length - 1]}`;
packageJson.preview = true;
packageJson.name = 'vscode-front-matter-beta';
packageJson.displayName = `${packageJson.displayName} (BETA)`;
packageJson.description = `BETA Version of Front Matter. ${packageJson.description}`;
packageJson.icon = 'assets/frontmatter-beta.png';
packageJson.homepage = 'https://beta.frontmatter.codes';

console.log(packageJson.version);

core.summary.addHeading(`Version info`).addRaw(`Version: ${packageJson.version}`).write();

const scripts = packageJson.scripts;
for (const key in scripts) {
  if (key.startsWith(`prod:`)) {
    scripts[key] = scripts[key].replace('production', 'development');
  }
}

console.log(JSON.stringify(packageJson.scripts, null, 2));

fs.writeFileSync(
  path.join(path.resolve('.'), 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

let readme = fs.readFileSync(path.join(__dirname, '../README.beta.md'), 'utf8');
fs.writeFileSync(path.join(__dirname, '../README.md'), readme);

// Update the .vscodeignore file
const ignoreFilePath = path.join(path.resolve('.'), '.vscodeignore');
let vscodeignore = fs.readFileSync(ignoreFilePath, 'utf8');
vscodeignore = vscodeignore.replace(`**/*.map`, '');
fs.writeFileSync(ignoreFilePath, vscodeignore);
