// Smoke test on the sample workspace (make-workspace.sh): panel field edits and dashboard search.
// Restores the edited file with git afterwards.
import { execSync } from 'node:child_process';
import { connect, reloadWindow, openFile, showPanel, webviewFrame, panelField, selectAll, runCommand, shot, sleep, read, checker, WS } from './lib.mjs';

const check = checker();
const { page } = await connect();
await reloadWindow(page);

// Panel
await openFile(page, 'content/blog/post-1.md');
await showPanel(page);
const panel = await webviewFrame(page, '.metadata_field');
check('panel renders the metadata fields', !!panel);
const fm = () => read('content/blog/post-1.md').split('---')[1] || '';

await sleep(2500);
check('opening a file with a markdown wysiwyg field leaves it unchanged', execSync('git status --short -- content', { cwd: WS }).toString().trim() === '');

const title = panelField(panel, 'Title').locator('textarea');
await selectAll(title);
await title.pressSequentially('Hello quick typing test', { delay: 15 });
await sleep(3000);
check('fast typing in a text field is saved completely', /\ntitle: Hello quick typing test\n/.test(fm()), fm().match(/title: .*/)?.[0]);

const weight = panelField(panel, 'Weight').locator('input');
await selectAll(weight);
await weight.pressSequentially('1.05', { delay: 60 });
await sleep(2500);
check('number field keeps 1.05', /weight: 1\.05\n/.test(fm()) && (await weight.inputValue()) === '1.05', fm().match(/weight: .*/)?.[0]);
await shot(page, 'smoke-panel');

// Dashboard
await runCommand(page, 'Front Matter: Open dashboard');
const dash = await webviewFrame(page, 'input[placeholder*="Search"]');
check('dashboard renders', !!dash);
await sleep(2500);
const search = dash.locator('input[placeholder*="Search"]');
await search.click();
await search.pressSequentially('Old one', { delay: 20 });
await sleep(3000);
const cards = await dash.$$eval('button', (els) => els.filter((e) => e.innerText.trim() === 'Open custom actions').length);
check('dashboard search finds the page', cards === 1, `cards=${cards}`);
await shot(page, 'smoke-dashboard');
await selectAll(search);
await search.press('Backspace');

execSync('git checkout -q -- content', { cwd: WS });
process.exit(check.summary() ? 1 : 0);
