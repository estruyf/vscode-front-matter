// Retakes every picture the videos are cut from, in real VS Code, against the
// demo site in ../demo and nothing else.
//
//   node scripts/capture.mjs             everything
//   node scripts/capture.mjs shots       the stills only
//   node scripts/capture.mjs clips       the recorded beats only
//   node scripts/capture.mjs edit media  just those, by name
//
// Needs the packaged extension: `npm run vsix` first, and again after any change
// to the extension that should show up in the video.
//
// Stills land in public/shots/<name>.png at 2x. Recorded beats land in
// public/clips/<name>.mp4 at a constant 30 fps, with public/clips.json naming
// how long each one is — the compositions read that rather than carrying a table
// of frame numbers, so re-recording a beat does not mean re-cutting the piece
// around it.
//
// The stills share one VS Code. Every recorded beat gets a VS Code of its own,
// on a fresh copy of the site: a beat that edits a post would otherwise leave
// that edit in every shot after it.

import { execFileSync } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dashboard, hidePointer, openApp, panel, pointTo, pressMouse, releaseMouse, runCommand, settle,
  showPointer, VIEWPORT,
} from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(HERE, '../public');
const SHOTS_DIR = join(PUBLIC, 'shots');
const CLIPS_DIR = join(PUBLIC, 'clips');
const TMP = join(PUBLIC, '.frames');

export const CLIP_FPS = 30;

// ---- driving the app -----------------------------------------------------

const pause = (page, ms) => page.waitForTimeout(ms);

/** Glide the pointer to the middle of `target` — a locator in the workbench or
 *  inside a webview; either way its box comes back in window coordinates. */
async function moveTo(page, target, { steps = 26, dx = 0.5, dy = 0.5 } = {}) {
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (!box) {
    throw new Error('moveTo: target has no box');
  }
  await pointTo(page, box.x + box.width * dx, box.y + box.height * dy, { steps });
  return box;
}

/** Move, settle for a beat so the hover state reads, then click. */
async function clickOn(page, target, { before = 320, after = 500, ...move } = {}) {
  await moveTo(page, target, move);
  await pause(page, before);
  await pressMouse(page);
  await pause(page, 90);
  await releaseMouse(page);
  await pause(page, after);
}

/** Type at something near a human rate. */
async function typeText(page, text, { delay = 55 } = {}) {
  await page.keyboard.type(text, { delay });
}

/** Scroll whatever is under the pointer, in small wheel steps a hand would make. */
async function wheel(page, dy, { steps = 10 } = {}) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps);
    await pause(page, 30);
  }
}

/** Send the pointer somewhere nothing reacts to it: the middle of the title
 *  bar. */
async function park(page) {
  await pointTo(page, VIEWPORT.width / 2 + 180, 12, { steps: 6 });
  await pause(page, 260);
}

/** The dashboard on its Contents tab, the sidebar closed, nothing else open.
 *  Every shot starts here so one shot's leftovers never reach the next. */
async function reset(page) {
  await page.keyboard.press('Escape');
  await runCommand(page, 'File: Save All Files');
  await runCommand(page, 'View: Close All Editor Groups');
  await runCommand(page, 'View: Single Column Editor Layout');
  await runCommand(page, 'Front Matter: Open dashboard');
  // The palette offers only toggles for the side bars, so each is toggled only
  // when it is actually showing.
  if (await page.locator('.part.sidebar').isVisible()) {
    await runCommand(page, 'View: Toggle Primary Side Bar Visibility');
  }
  if (await page.locator('.part.auxiliarybar').isVisible()) {
    await runCommand(page, 'View: Toggle Secondary Side Bar Visibility');
  }
  const dash = await dashboard(page);
  await dash.locator('img').first().waitFor({ state: 'visible' });
  await park(page);
  await settle(page, 800);
  return dash;
}

/** A dashboard tab, by its label. */
const tab = (dash, name) => dash.getByRole('button', { name, exact: true }).or(dash.getByText(name, { exact: true })).first();

/** Open a post the way a user does from the dashboard, without recording it. */
async function openPost(page, title) {
  const dash = await reset(page);
  await dash.getByText(title, { exact: true }).first().click();
  const side = await panel(page);
  await side.locator('.metadata_field__input').first().waitFor({ state: 'visible' });
  await settle(page, 1500);
  return side;
}

// ---- stills --------------------------------------------------------------
//
// One per screen.

const SHOTS = {
  async contents(page) {
    await reset(page);
  },

  async drafts(page) {
    const dash = await reset(page);
    await dash.getByRole('button', { name: /In draft/ }).first().click();
    await settle(page, 800);
  },

  async editor(page) {
    await openPost(page, 'Why we moved our client sites to Astro');
  },

  async media(page) {
    const dash = await reset(page);
    await tab(dash, 'Media').click();
    await dash.getByText('images', { exact: true }).first().click();
    await dash.locator('img').first().waitFor({ state: 'visible' });
    await settle(page, 2500);
  },

  async snippets(page) {
    const dash = await reset(page);
    await tab(dash, 'Snippets').click();
    await settle(page, 1200);
  },

  async data(page) {
    const dash = await reset(page);
    await tab(dash, 'Data').click();
    await dash.getByText('Authors', { exact: true }).first().click();
    await settle(page, 800);
    // One entry open in the form, so the shot shows a filled-in record rather
    // than an empty "add new" form.
    await dash.getByText('Mara Lindqvist', { exact: true }).first().click();
    await settle(page, 1200);
  },

  async taxonomy(page) {
    const dash = await reset(page);
    await tab(dash, 'Taxonomies').click();
    await settle(page, 1500);
  },
};

// ---- recorded beats ------------------------------------------------------
//
// Three, no more: the moments where something has to *happen*. Everything else
// is a still with a caption.
//
// Each is `{ prepare, run }` and only `run` is recorded.

const CLIPS = {
  /** A draft, opened from the dashboard, given a description and published —
   *  in the panel, with the YAML in the editor following along. */
  edit: {
    prepare: reset,
    async run(page) {
      await pause(page, 600);
      const dash = await dashboard(page);
      await clickOn(page, dash.getByText('Typography scales, explained', { exact: true }).first(), { after: 1800 });
      const side = await panel(page);
      await side.locator('.metadata_field__textarea').first().waitFor({ state: 'visible' });
      await clickOn(page, side.locator('.metadata_field__textarea').first(), { after: 300 });
      await typeText(page, 'A modular scale in four lines of CSS, and how to pick its ratio.');
      await pause(page, 1400);
      // Down to the Draft switch, by wheel over the panel.
      await moveTo(page, side.locator('.metadata_field__label', { hasText: 'Author' }).first(), { steps: 14 });
      await wheel(page, 520);
      await pause(page, 500);
      const draft = side.locator('.metadata_field__label', { hasText: /^Draft$/ }).locator('xpath=following::label[contains(@class,"field__toggle")][1]');
      await clickOn(page, draft, { after: 2200 });
    },
  },

  /** A new post from the dashboard: pick the folder, name it, and the file opens
   *  with its front matter already filled in. */
  create: {
    prepare: reset,
    async run(page) {
      await pause(page, 600);
      const dash = await dashboard(page);
      await clickOn(page, dash.getByRole('button', { name: /Create content/ }).first(), { after: 900 });
      await clickOn(page, page.locator('.quick-input-list .monaco-list-row', { hasText: 'Journal' }).first(), { after: 900 });
      await typeText(page, 'Choosing a static site generator in 2026');
      await pause(page, 500);
      await page.keyboard.press('Enter');
      const side = await panel(page);
      await side.locator('.metadata_field__input').first().waitFor({ state: 'visible' });
      await pause(page, 2600);
    },
  },

  /** A snippet into the post: the sentence under the cursor becomes a callout. */
  snippet: {
    async prepare(page) {
      await openPost(page, 'Why we moved our client sites to Astro');
      // Put the selection on the paragraph the callout will wrap.
      await page.locator('.monaco-editor .view-lines').first().click();
      await page.keyboard.press('Control+G');
      await typeText(page, '26', { delay: 0 });
      await page.keyboard.press('Enter');
      // The whole paragraph, not the first wrapped line of it: Home/End follow
      // the soft wrap. Expand to the line, then give back its line break.
      await page.keyboard.press('Meta+L');
      await page.keyboard.press('Shift+ArrowLeft');
      await park(page);
      await settle(page, 600);
    },
    async run(page) {
      await pause(page, 600);
      await clickOn(page, page.locator('.editor-actions .action-label[aria-label*="snippet" i]').first(), { after: 1600 });
      const dash = await dashboard(page);
      // The card's own insert button: the title opens nothing, and a loose
      // match on "Insert" finds whichever card comes last.
      const card = dash.locator('li', { has: dash.getByText('Callout', { exact: true }) }).first();
      await moveTo(page, card, { steps: 18 });
      await pause(page, 400);
      await clickOn(page, card.locator('button[title="Insert snippet"]'), { after: 1400 });
      // The dialog comes up with the selected sentence already in the Text
      // field; Insert wraps it.
      await clickOn(page, dash.getByRole('button', { name: 'Insert', exact: true }), { after: 2600 });
    },
  },
};

// ---- the screencast ------------------------------------------------------

/** Record `clip.run` and write it out as constant-rate h264.
 *
 *  CDP emits a frame when the page paints and not otherwise, so what comes back
 *  is a variable-rate stream with a timestamp on each frame. Resampling it onto
 *  a fixed 30 fps grid here — rather than handing ffmpeg the timestamps — is
 *  what makes a frame number in the timeline mean a fixed number of
 *  milliseconds, which is the whole basis of the cut. */
async function record(page, name, clip) {
  await clip.prepare?.(page);

  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
    frames.push({ t: metadata.timestamp, data });
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await showPointer(page);
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 4096,
    maxHeight: 4096,
    everyNthFrame: 1,
  });
  await clip.run(page);
  await pause(page, 500);
  await cdp.send('Page.stopScreencast');
  await cdp.detach().catch(() => {});

  if (frames.length < 2) {
    throw new Error(`${name}: the page painted ${frames.length} times — nothing to cut`);
  }

  const src = join(TMP, name, 'src');
  const seq = join(TMP, name, 'seq');
  rmSync(join(TMP, name), { recursive: true, force: true });
  mkdirSync(src, { recursive: true });
  mkdirSync(seq, { recursive: true });

  frames.sort((a, b) => a.t - b.t);
  const paths = frames.map((frame, i) => {
    const path = join(src, `${String(i).padStart(5, '0')}.jpg`);
    writeFileSync(path, Buffer.from(frame.data, 'base64'));
    return path;
  });

  const t0 = frames[0].t;
  const count = Math.max(2, Math.round((frames[frames.length - 1].t - t0) * CLIP_FPS));
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const at = t0 + i / CLIP_FPS;
    while (cursor + 1 < frames.length && frames[cursor + 1].t <= at) {
      cursor++;
    }
    // Hard links rather than copies: most frames of a beat are repeats.
    linkSync(paths[cursor], join(seq, `${String(i).padStart(5, '0')}.jpg`));
  }

  mkdirSync(CLIPS_DIR, { recursive: true });
  const out = join(CLIPS_DIR, `${name}.mp4`);
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', String(CLIP_FPS),
    '-i', join(seq, '%05d.jpg'),
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-crf', '15', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    out,
  ], { stdio: 'inherit' });
  rmSync(join(TMP, name), { recursive: true, force: true });

  console.log(`  ${name}.mp4 — ${count} frames, ${(count / CLIP_FPS).toFixed(1)}s (${frames.length} painted)`);
  return { frames: count, fps: CLIP_FPS };
}

// ---- run -----------------------------------------------------------------

const argv = process.argv.slice(2);
const wants = (kind, name) => argv.length === 0 || argv.includes(kind) || argv.includes(name);

const shotNames = Object.keys(SHOTS).filter((n) => wants('shots', n));
if (shotNames.length) {
  console.log('shots');
  mkdirSync(SHOTS_DIR, { recursive: true });
  const { app, page } = await openApp({ pointer: true });
  for (const name of shotNames) {
    await showPointer(page);
    await SHOTS[name](page);
    // Nothing under the pointer: the row it was left on keeps its hover state
    // even after the dot is hidden.
    await park(page);
    await hidePointer(page);
    await settle(page, 400);
    await page.screenshot({ path: join(SHOTS_DIR, `${name}.png`) });
    console.log(`  ${name}.png`);
  }
  await app.close();
}

const clipNames = Object.keys(CLIPS).filter((n) => wants('clips', n));
if (clipNames.length) {
  console.log('clips');
  mkdirSync(TMP, { recursive: true });
  const manifestPath = join(PUBLIC, 'clips.json');
  // Merged rather than replaced, so re-recording one beat by name leaves the
  // lengths of the others alone.
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  for (const name of clipNames) {
    const { app, page } = await openApp({ pointer: true });
    try {
      manifest[name] = await record(page, name, CLIPS[name]);
    } finally {
      await app.close();
    }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  rmSync(TMP, { recursive: true, force: true });
}

if (existsSync(SHOTS_DIR)) {
  console.log(`\n${readdirSync(SHOTS_DIR).length} stills in public/shots`);
}
