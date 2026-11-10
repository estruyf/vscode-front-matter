// Custom placeholder {{authorLine}}: receives the workspace, file path and title
const [, filePath, title] = process.argv.slice(2);
console.log(`Written by the team: ${title}`);
