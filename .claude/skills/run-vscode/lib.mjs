// Driver helpers for a VS Code window started by launch.sh (connects over CDP).
import { chromium } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const RUN_DIR = process.env.FM_RUN_DIR || '/tmp/fm-run';
export const WS = process.env.FM_WS || path.join(RUN_DIR, 'ws');
const PORT = process.env.FM_CDP_PORT || '9333';
const SHOT_DIR = path.join(RUN_DIR, 'shots');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Connect to the workbench page. Waits up to 60s for VS Code to come up.
 */
export async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
      const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes('workbench'));
      if (page) return { browser, page };
    } catch {}
    await sleep(1000);
  }
  throw new Error('workbench not found, is VS Code running (launch.sh)?');
}

/**
 * Playwright does not attach to webview iframes (out-of-process) that existed before it connected.
 * Reloading the window recreates them while connected. "Reload Webviews" is not enough: the panel
 * uses retainContextWhenHidden, so its iframe is kept.
 */
export async function reloadWindow(page) {
  await runCommand(page, 'Developer: Reload Window');
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await sleep(9000);
}

export async function shot(page, name) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const f = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: f });
  console.log('screenshot:', f);
  return f;
}

/**
 * Run a command from the command palette. Use the full title ("Front Matter: ..."); it refuses to
 * press Enter when the highlighted entry is another command (fuzzy matching picks look-alikes).
 * Several Front Matter commands are hidden from the palette (when: false), see SKILL.md.
 */
export async function runCommand(page, label) {
  await page.keyboard.press('Meta+Shift+P');
  await sleep(400);
  await page.keyboard.type(label, { delay: 10 });
  await sleep(800);
  const focused = await page
    .$eval('.quick-input-list .monaco-list-row.focused', (e) => e.getAttribute('aria-label') || e.innerText)
    .catch(() => '');
  if (!focused.toLowerCase().includes(label.toLowerCase())) {
    await page.keyboard.press('Escape');
    throw new Error(`Command "${label}" not selected, got "${focused}"`);
  }
  await page.keyboard.press('Enter');
  await sleep(800);
}

/**
 * Open a file with quick open (any unique part of the path works)
 */
export async function openFile(page, rel) {
  await page.keyboard.press('Meta+P');
  await sleep(400);
  await page.keyboard.type(rel, { delay: 10 });
  await sleep(700);
  await page.keyboard.press('Enter');
  await sleep(1200);
}

/**
 * Show the Front Matter panel. Its activity bar item is labelled "FM"; clicking it while it is
 * already active hides the side bar, so only click when it is not active.
 */
export async function showPanel(page) {
  const active = await page
    .$eval('.activitybar a[aria-label="FM"]', (e) => !!e.closest('.checked') || e.getAttribute('aria-pressed') === 'true' || e.getAttribute('aria-expanded') === 'true')
    .catch(() => false);
  if (!active) {
    await page.click('.activitybar a[aria-label="FM"]');
    await sleep(2500);
  }
}

/**
 * Find the webview frame (panel or dashboard) that contains the selector.
 * Panel: '.metadata_field'. Dashboard contents: 'input[placeholder*="Search"]'.
 * Media: 'input[placeholder*="Search in folder"]'.
 */
export async function webviewFrame(page, selector, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    for (const f of page.frames()) {
      if (!f.url().startsWith('vscode-webview://')) continue;
      try {
        if (await f.$(selector)) return f;
      } catch {}
    }
    await sleep(500);
  }
  return null;
}

/**
 * Locator for a panel field by its label. Inside: 'textarea' (string), 'input' (slug, number, tags),
 * '.ql-editor' (wysiwyg).
 * Type with locator.press()/pressSequentially(), NOT page.keyboard: page.keyboard goes to the
 * workbench (the text editor), not to the webview.
 */
export const panelField = (frame, label) => frame.locator('.metadata_field', { hasText: label }).first();

/**
 * Select all text of a webview input. VS Code handles Cmd+A in webviews through the host and sends
 * "select all" back asynchronously; typing right away gets the first character selected and replaced.
 */
export async function selectAll(locator) {
  await locator.click();
  await locator.press('Meta+A');
  await sleep(300);
}

/**
 * Text of the quick input (title | placeholder | first rows), or "(closed)"
 */
export async function quickInput(page) {
  return page
    .$eval('.quick-input-widget', (e) =>
      e.style.display === 'none'
        ? '(closed)'
        : [
            e.querySelector('.quick-input-title')?.innerText,
            e.querySelector('input')?.getAttribute('placeholder') || e.querySelector('input')?.getAttribute('aria-label'),
            [...e.querySelectorAll('.monaco-list-row')].slice(0, 4).map((r) => r.getAttribute('aria-label')).join(' / ')
          ]
            .filter(Boolean)
            .join(' | ')
    )
    .catch(() => '(no quick input)');
}

/**
 * Click an item of the Explorer context menu of a row (folder/file name), also inside the
 * "Front Matter" submenu. Needs "window.menuStyle": "custom" (set by launch.sh).
 */
export async function explorerContextAction(page, name, action) {
  const row = page.locator('.explorer-folders-view .monaco-list-row', { hasText: new RegExp(`^${name}$`) }).first();
  await row.click({ button: 'right' });
  await sleep(800);
  const items = () => page.$$eval('.context-view .action-label', (els) => els.map((e) => e.innerText.trim()).filter(Boolean));
  let labels = await items();
  if (!labels.includes(action) && labels.includes('Front Matter')) {
    await page.locator('.context-view .action-label', { hasText: /^Front Matter$/ }).first().hover();
    await sleep(1000);
    labels = await items();
  }
  if (!labels.includes(action)) {
    await page.keyboard.press('Escape');
    throw new Error(`"${action}" not in context menu: ${labels.join(', ')}`);
  }
  await page.locator('.context-view .action-label', { hasText: new RegExp(`^${action}$`) }).first().click();
  await sleep(1500);
}

export const read = (rel) => fs.readFileSync(path.join(WS, rel), 'utf8');

/**
 * Collect PASS/FAIL results and print a summary
 */
export function checker() {
  const results = [];
  const check = (name, ok, detail) => {
    results.push({ name, ok });
    console.log(ok ? 'PASS' : 'FAIL', name, detail ? `- ${detail}` : '');
  };
  check.summary = () => {
    const failed = results.filter((r) => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} passed`);
    return failed;
  };
  return check;
}
