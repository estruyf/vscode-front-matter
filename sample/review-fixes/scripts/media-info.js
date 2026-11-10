// Media file script: records the media path it receives
const record = require('./record');
const [wsPath, mediaPath] = process.argv.slice(2);
record(wsPath, { script: 'media-info', mediaPath });
console.log(`Media: ${mediaPath}`);
