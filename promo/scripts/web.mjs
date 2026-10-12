// Re-encodes the two renders for the places they are served from, into
// out/web/:
//
//   npm run web
//
//   promo.mp4      the 30s cut for frontmatter.codes — 1080p, silent, faststart
//   tour.mp4       the 90s cut, at 720p: it plays into a box that is never wider
//                  than half the page
//   poster.jpg     the promo's poster frame
//   readme.gif     the edit beat on its own, looping, for the README and the
//                  Marketplace page — neither plays video inline, both play a GIF
//
// The renders in out/ are the masters (CRF 17) — upload those anywhere that
// re-encodes for you. These copies are sized for a first visit.

import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../out');
const WEB = join(OUT, 'web');
const CLIPS = resolve(HERE, '../public/clips');

mkdirSync(WEB, { recursive: true });

const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const mb = (path) => `${(statSync(path).size / 1024 / 1024).toFixed(1)} MB`;

const encode = (from, to, scale) => {
  ffmpeg([
    '-i', join(OUT, from),
    ...(scale ? ['-vf', `scale=${scale}:flags=lanczos`] : []),
    '-c:v', 'libx264', '-crf', '25', '-preset', 'slow',
    '-profile:v', 'high', '-level', '4.0',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an',
    join(WEB, to),
  ]);
  console.log(`out/web/${to} — ${mb(join(WEB, to))}`);
};

encode('promo.mp4', 'promo.mp4', null);
encode('tour.mp4', 'tour.mp4', '1280:720');

// The poster: the dashboard under its caption, fully on screen — not the title
// card, which is a picture of the logo the page above it already shows.
ffmpeg([
  '-i', join(OUT, 'promo.mp4'),
  '-vf', "select='eq(n\\,160)'", '-frames:v', '1',
  '-q:v', '3',
  join(WEB, 'poster.jpg'),
]);
console.log(`out/web/poster.jpg — ${mb(join(WEB, 'poster.jpg'))}`);

// The README loop: the raw edit beat, no captions — the README's own text is
// the caption. The left 1908px (the same crop the promo uses) at 960 wide,
// 12 fps, one palette for the whole clip so the dark UI does not dither.
ffmpeg([
  '-i', join(CLIPS, 'edit.mp4'),
  '-vf', [
    'fps=12',
    'crop=1908:1640:0:0',
    'scale=960:-1:flags=lanczos',
    'split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
  ].join(','),
  '-loop', '0',
  join(WEB, 'readme.gif'),
]);
console.log(`out/web/readme.gif — ${mb(join(WEB, 'readme.gif'))}`);
