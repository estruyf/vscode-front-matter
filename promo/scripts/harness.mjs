// Opens the real extension in real VS Code, against the demo site in
// ../demo/tidewater, and hands back the workbench page for the shot list to
// drive. Called only by capture.mjs.
//
// Everything that could differ between two runs is pinned or thrown away:
//
//   - VS Code itself is a pinned build, downloaded once into .cache/vscode, not
//     whatever is installed on the machine doing the capture.
//   - The extension is the packaged VSIX (`npm run vsix`), installed into an
//     empty extensions folder. That is what runs in production mode and loads
//     the webviews from dist/ — exactly what someone installing it from the
//     Marketplace gets. `--extensionDevelopmentPath` would load them from the
//     webpack dev server instead.
//   - The profile, the extensions folder and the workspace are fresh copies in
//     the temp dir on every run, so no state leaks from one capture to the next
//     and nothing a beat writes ever lands in demo/.
//   - Every file in the workspace gets the same mtime, DEMO_NOW, so nothing the
//     dashboard sorts or labels by modification date depends on when the
//     checkout happened.

import { _electron as electron } from 'playwright';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
export const DEMO_DIR = join(ROOT, 'demo/tidewater');
const CACHE = join(ROOT, '.cache');
export const VSIX = join(CACHE, 'front-matter.vsix');

/// The VS Code build every capture is taken in. Bump it deliberately: a new
/// build moves the workbench chrome around, and every crop is measured off it.
export const VSCODE_VERSION = process.env.PROMO_VSCODE ?? '1.139.1';

/// The window, in CSS pixels. Captured at 2x. Narrower than a real laptop on
/// purpose — the workbench lays out the same, and a narrower window makes 13px
/// editor text a larger share of a 1080p frame.
export const VIEWPORT = { width: 1280, height: 820 };

/// Every date in ../demo is written against this day, and every file's mtime is
/// set to it. The drafts are dated after it; everything published, before.
export const DEMO_NOW = new Date('2026-09-24T10:24:00Z');

/// The user settings of the throwaway profile. Everything here is something a
/// real user could have set; nothing reaches into the extension.
const USER_SETTINGS = {
  'workbench.colorTheme': 'Default Dark Modern',
  'workbench.startupEditor': 'none',
  'workbench.tips.enabled': false,
  'workbench.enableExperiments': false,
  'workbench.layoutControl.enabled': false,
  'workbench.secondarySideBar.defaultVisibility': 'hidden',
  'workbench.editor.empty.hint': 'hidden',
  'window.restoreWindows': 'none',
  'window.commandCenter': false,
  'window.title': '${rootName}',
  'telemetry.telemetryLevel': 'off',
  'update.mode': 'none',
  'extensions.autoUpdate': false,
  'extensions.autoCheckUpdates': false,
  'extensions.ignoreRecommendations': true,
  'security.workspace.trust.enabled': false,
  'chat.disableAIFeatures': true,
  'chat.commandCenter.enabled': false,
  'git.enabled': false,
  'editor.minimap.enabled': false,
  'editor.wordWrap': 'on',
  'editor.fontSize': 13,
  'editor.lineHeight': 21,
  'editor.renderWhitespace': 'none',
  'editor.stickyScroll.enabled': false,
  'editor.lightbulb.enabled': 'off',
  // A blinking caret makes every recorded frame differ from the last, and a
  // still can land on either phase.
  'editor.cursorBlinking': 'solid',
  'files.autoSave': 'off',
  'markdown.validate.enabled': false,
};

// ---- the pointer ---------------------------------------------------------
//
// CDP's screencast composites the page and not the cursor, so a recording of a
// click is a recording of something happening for no visible reason. This puts
// a dot back. It is the only thing in any frame that the app did not draw.
//
// Unlike a plain web app, most of what gets clicked here is inside a webview —
// an iframe in another process — and its mouse events never reach the
// workbench document. So the dot does not listen for mousemove; `pointTo` below
// sets it to the same coordinates it hands `page.mouse`, step for step, and it
// can no more drift from the click than listening could.

const POINTER = (accent) => {
  const make = (id, css) => {
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = css.join(';');
    document.body.append(el);
    return el;
  };
  const base = ['position:fixed', 'left:0', 'top:0', 'width:22px', 'height:22px', 'margin:-11px 0 0 -11px',
    'border-radius:50%', 'pointer-events:none', 'opacity:0'];
  const dot = make('__promo_pointer', [...base, 'z-index:2147483647',
    'background:rgba(255,255,255,0.35)', 'border:2px solid #fff', 'box-shadow:0 2px 10px rgba(0,0,0,0.55)',
    'transition:opacity .2s, transform .12s']);
  const ring = make('__promo_ring', [...base, 'z-index:2147483646', `border:3px solid ${accent}`]);
  let x = 0;
  let y = 0;
  window.__promo = {
    move(nx, ny) {
      x = nx;
      y = ny;
      dot.style.opacity = '1';
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${x}px, ${y}px)`;
    },
    down() {
      dot.style.transform = `translate(${x}px, ${y}px) scale(0.75)`;
      ring.style.transition = 'none';
      ring.style.opacity = '0.9';
      ring.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      requestAnimationFrame(() => {
        ring.style.transition = 'opacity .45s ease-out, transform .45s ease-out';
        ring.style.opacity = '0';
        ring.style.transform = `translate(${x}px, ${y}px) scale(2.6)`;
      });
    },
    up() {
      dot.style.transform = `translate(${x}px, ${y}px) scale(1)`;
    },
    show(v) {
      dot.style.display = v ? '' : 'none';
      ring.style.display = v ? '' : 'none';
    },
  };
};

const current = { x: 0, y: 0 };

/** Move the real mouse and the drawn dot together, in `steps` steps. */
export async function pointTo(page, x, y, { steps = 26 } = {}) {
  const from = { ...current };
  for (let i = 1; i <= steps; i++) {
    // Ease in and out, so a move reads as a hand rather than a conveyor.
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const px = from.x + (x - from.x) * e;
    const py = from.y + (y - from.y) * e;
    await page.mouse.move(px, py);
    await page.evaluate(([a, b]) => window.__promo?.move(a, b), [px, py]);
  }
  current.x = x;
  current.y = y;
}

export async function pressMouse(page) {
  await page.evaluate(() => window.__promo?.down());
  await page.mouse.down();
}

export async function releaseMouse(page) {
  await page.mouse.up();
  await page.evaluate(() => window.__promo?.up());
}

/** Hide the dot for the stills. */
export const hidePointer = (page) => page.evaluate(() => window.__promo?.show(false));
export const showPointer = (page) => page.evaluate(() => window.__promo?.show(true));

// ---- setting up ----------------------------------------------------------

function freshDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
  return path;
}

/** Stamp every file and folder with DEMO_NOW. */
function pinMtimes(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) pinMtimes(path);
    utimesSync(path, DEMO_NOW, DEMO_NOW);
  }
  utimesSync(dir, DEMO_NOW, DEMO_NOW);
}

/** The environment VS Code is launched with. When the capture is itself run
 *  from a VS Code terminal, the parent's VSCODE_* variables would make the child
 *  try to talk to the parent instead of starting on its own. */
function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('VSCODE_') || key === 'ELECTRON_RUN_AS_NODE' || key === 'ELECTRON_NO_ATTACH_CONSOLE') {
      delete env[key];
    }
  }
  return env;
}

/** Launch VS Code on a fresh copy of the demo site, ready to drive. */
export async function openApp({ pointer = false, accent = '#15c2cb', ready = true } = {}) {
  if (!existsSync(VSIX)) {
    throw new Error(`no ${VSIX} — run npm run vsix first`);
  }

  let executable = await downloadAndUnzipVSCode({ version: VSCODE_VERSION, cachePath: join(CACHE, 'vscode') });
  // Recent macOS builds name the binary `Code`; test-electron still guesses
  // `Electron`.
  if (!existsSync(executable) && existsSync(join(dirname(executable), 'Code'))) {
    executable = join(dirname(executable), 'Code');
  }

  // Short paths in the temp dir: VS Code puts IPC sockets under the profile, and
  // macOS caps a socket path at 104 bytes.
  const run = join(tmpdir(), 'fm-promo');
  const profile = freshDir(join(run, 'u'));
  const extensions = freshDir(join(run, 'x'));
  const workspace = join(freshDir(join(run, 'w')), 'tidewater');

  mkdirSync(join(profile, 'User'), { recursive: true });
  writeFileSync(join(profile, 'User/settings.json'), JSON.stringify(USER_SETTINGS, null, 2));

  const [cli, ...cliArgs] = resolveCliArgsFromVSCodeExecutablePath(executable);
  execFileSync(cli, [...cliArgs, '--user-data-dir', profile, '--extensions-dir', extensions,
    '--install-extension', VSIX, '--force'], { stdio: 'ignore', env: cleanEnv() });

  cpSync(DEMO_DIR, workspace, { recursive: true });
  pinMtimes(workspace);

  const app = await electron.launch({
    executablePath: executable,
    env: cleanEnv(),
    args: [
      workspace,
      `--user-data-dir=${profile}`,
      `--extensions-dir=${extensions}`,
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-workspace-trust',
      '--disable-telemetry',
      '--disable-updates',
      '--disable-crash-reporter',
      '--new-window',
      // The screencast composites at CSS resolution, so the surface is forced
      // to 2x here rather than trusting whatever display the window opens on.
      '--force-device-scale-factor=2',
      '--force-color-profile=srgb',
    ],
  });

  const page = await app.firstWindow();
  await page.waitForSelector('.monaco-workbench', { timeout: 120_000 });

  // The window, sized from the main process: the renderer cannot resize itself.
  await app.evaluate(({ BrowserWindow }, size) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.setContentSize(size.width, size.height);
    win.center();
  }, VIEWPORT);

  if (pointer) {
    await page.evaluate(POINTER, accent);
  }

  // The dashboard opens itself on a Front Matter workspace (openOnStart in the
  // demo's frontmatter.json). Its content cards are the sign that the extension
  // is up and has read the site.
  if (ready) {
    const dash = await dashboard(page);
    await dash.locator('img').first().waitFor({ state: 'visible', timeout: 120_000 });
    await settle(page, 1500);
    await clearNotifications(page);
  }
  await settle(page, 1500);

  return { app, page, workspace };
}

// ---- finding things ------------------------------------------------------

/// A webview is two iframes deep — VS Code's host frame and the document the
/// extension rendered inside it — and the host frames do not live in the editor
/// or the sidebar's DOM at all: they sit in an overlay laid over them. So the
/// dashboard and the panel are found by what they rendered, not where. Both
/// render an `#app`; only the dashboard's carries `data-webview-url`.
///
/// Looked up afresh on every call. A webview that is hidden and shown again can
/// come back as a new frame, and a stale handle fails silently.
async function findFrame(page, selector, timeout = 60_000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const hit = await frame.$(selector).catch(() => null);
      if (hit) return frame;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`no webview with ${selector}`);
}

export const dashboard = (page) => findFrame(page, '#app[data-webview-url]');
export const panel = (page) => findFrame(page, '#app:not([data-webview-url])');

/** Close every toast. A fresh profile always gets the extension's "updated to"
 *  notification, and VS Code has its own. */
export async function clearNotifications(page) {
  await runCommand(page, 'Notifications: Clear All Notifications');
}

/** Wait for the app to stop moving. */
export async function settle(page, ms = 500) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(ms);
}

/** Run a VS Code command through the palette. Only ever used while setting up a
 *  shot, never inside a recording: in a video it would read as a step the viewer
 *  has to perform. */
export async function runCommand(page, title) {
  await page.keyboard.press('Meta+Shift+P');
  const input = page.locator('.quick-input-widget input');
  await input.waitFor({ state: 'visible' });
  await input.fill(`>${title}`);
  // The list filters a beat after the input changes. Pressing Enter on the
  // first row before then runs whatever matched the previous text — which is
  // how a "close the sidebar" once opened the secondary one instead.
  const first = page.locator('.quick-input-list .monaco-list-row').first();
  await page.waitForFunction(
    ([sel, want]) => {
      const row = document.querySelector(sel);
      const label = row?.querySelector('.label-name')?.textContent?.trim() ?? '';
      return label.replace(/\s+/g, ' ') === want;
    },
    ['.quick-input-list .monaco-list-row', title],
    { timeout: 10_000 },
  ).catch(async (error) => {
    const seen = await page.locator('.quick-input-list .monaco-list-row .label-name').allTextContents();
    throw new Error(`runCommand: no "${title}" in the palette; it lists ${JSON.stringify(seen.slice(0, 6))}`, { cause: error });
  });
  await first.waitFor({ state: 'visible' });
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
}
