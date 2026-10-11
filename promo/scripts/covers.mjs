// Draws the demo site's images — the post covers and the author avatars — into
// demo/tidewater/public/images. They are committed; this is here so they can be
// redrawn, not something the capture runs.
//
//   node scripts/covers.mjs
//
// Abstract on purpose: a stock photo carries somebody's licence and somebody's
// face into a video that is hard to take back. Every picture is seeded by its
// file name, so a redraw gives the same pixels.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../demo/tidewater/public/images');

const COVERS = [
  'astro-move', 'colour-tokens', 'homepage-budget', 'alt-text', 'checklist', 'type-specimen',
  'museum', 'image-formats', 'empty-states', 'migration-map', 'markdown-model', 'offsite',
  'preview-deploys', 'type-scale', 'audit', 'studio-desk', 'harbour-office',
  'handbook-voice', 'handbook-images', 'handbook-publish',
];
const AVATARS = { mara: 'ML', jonas: 'JP', aiko: 'AT', sam: 'SO' };

const PALETTES = [
  ['#0f3b4c', '#1f6f78', '#f2c14e', '#f7ede2'],
  ['#1b2a41', '#324a5f', '#e4572e', '#f3e9dc'],
  ['#12355b', '#4f7cac', '#c0e0de', '#f5f1e8'],
  ['#2d3142', '#4f5d75', '#ef8354', '#f4f1ea'],
  ['#0b4f6c', '#01baef', '#fbfbff', '#20bf55'],
  ['#264653', '#2a9d8f', '#e9c46a', '#f4a261'],
  ['#3d315b', '#444b6e', '#708b75', '#f2e8cf'],
  ['#1d3557', '#457b9d', '#a8dadc', '#f1faee'],
];

function page(seed, kind, label) {
  return `<!doctype html><html><head><style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden}
  canvas{display:block}
  </style></head><body><canvas id="c"></canvas><script>(() => {
  let s = ${seed};
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const P = ${JSON.stringify(PALETTES)}[${seed} % ${PALETTES.length}];
  const c = document.getElementById('c');
  const W = c.width = innerWidth, H = c.height = innerHeight;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, P[0]); bg.addColorStop(1, P[1]);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  if (${JSON.stringify(kind)} === 'cover') {
    // a sun or a moon
    g.globalAlpha = 0.95; g.fillStyle = P[2];
    g.beginPath(); g.arc(W * (0.2 + r() * 0.6), H * (0.2 + r() * 0.25), H * (0.12 + r() * 0.1), 0, 7); g.fill();
    // bands of water, back to front
    for (let i = 0; i < 6; i++) {
      const y0 = H * (0.42 + i * 0.1);
      const amp = H * (0.02 + r() * 0.04), freq = 1.5 + r() * 2.5, ph = r() * 6;
      g.globalAlpha = 0.28 + i * 0.11;
      g.fillStyle = i % 2 ? P[3] : P[1];
      if (i === 5) g.fillStyle = P[0];
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / W * Math.PI * freq + ph) * amp);
      g.lineTo(W, H); g.closePath(); g.fill();
    }
    // a few boats of pure geometry
    g.globalAlpha = 0.9; g.fillStyle = P[3];
    for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
      const x = W * r(), y = H * (0.5 + r() * 0.2), k = H * (0.03 + r() * 0.03);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + k, y - k * 2.2); g.lineTo(x + k, y); g.closePath(); g.fill();
    }
  } else {
    g.fillStyle = P[3]; g.globalAlpha = 0.95;
    g.font = '600 ' + (H * 0.38) + 'px -apple-system, system-ui, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(${JSON.stringify(label)}, W / 2, H / 2 + H * 0.02);
  }
  // grain, so gradients do not band after a video encode
  const d = g.getImageData(0, 0, W, H);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (r() - 0.5) * 14;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  g.putImageData(d, 0, 0);
  })();</script></body></html>`;
}

const hash = (name) => [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

mkdirSync(join(OUT, 'avatars'), { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
for (const name of COVERS) {
  await tab.setContent(page(hash(name), 'cover', ''));
  await tab.screenshot({ path: join(OUT, `${name}.jpg`), type: 'jpeg', quality: 82 });
}
await tab.setViewportSize({ width: 256, height: 256 });
for (const [name, initials] of Object.entries(AVATARS)) {
  await tab.setContent(page(hash(name), 'avatar', initials));
  await tab.screenshot({ path: join(OUT, 'avatars', `${name}.jpg`), type: 'jpeg', quality: 85 });
}
await browser.close();
console.log(`${COVERS.length} covers, ${Object.keys(AVATARS).length} avatars in ${OUT}`);
