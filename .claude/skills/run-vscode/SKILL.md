---
name: run-vscode
description: Launch Front Matter CMS in a real, isolated VS Code window on macOS and drive it (panel, dashboard, commands, explorer menus) with Playwright over CDP. Use when asked to run, test, screenshot, or verify a change in VS Code, or to check the panel or dashboard behaviour end to end.
---

Runs the extension from a checkout in development mode in a separate VS Code instance (own profile and extensions dir, so the user's VS Code windows and settings are not touched), opens a sample workspace, and exposes a CDP port. Scripts in this folder connect with `playwright-core` and drive the workbench and the webviews. All paths below are relative to this skill folder (`.claude/skills/run-vscode/`).

## Run

```bash
./launch.sh                     # build the repo's extension, start the webview dev servers, open VS Code
node smoke.mjs                  # panel + dashboard smoke test, prints PASS/FAIL, restores the file
./stop.sh                       # close the test VS Code (only the CDP instance) and the dev servers
```

- `launch.sh [extension-dir] [workspace-dir]`: run another checkout (ex. a worktree that merges several branches) or open another workspace. Defaults: this repo, and `$FM_RUN_DIR/ws` created by `make-workspace.sh`.
- `FM_RUN_DIR` (default `/tmp/fm-run`): profile, logs (`vscode.log`, `*-server.log`), screenshots (`shots/`). Must stay short, see Gotchas.
- `make-workspace.sh <dir>`: git-tracked sample site, so `git status`/`git diff` in the workspace shows what the extension changed. It has:
  - content folders `blog` (25 posts plus `$(touch fm-pwned).md`), `blog-archive`, and the wildcard `docs/*`;
  - a default content type with string, markdown wysiwyg, slug, decimal number, tags and nested `seo.meta.title` / `seo.canonical` fields (with `clearEmpty`), plus `custom-type`;
  - a commented `frontmatter.json`, an "Echo args" custom script that writes its arguments to `script-args.json`, `src/app.ts`, `public/images/public-logo.png` and an `article.md` template.
- Re-create the workspace for a clean state, or restore it with `git checkout -- .` / `git clean -fd` inside it.

## Writing a scenario

Copy `smoke.mjs`; `lib.mjs` has the helpers:

| helper | what it does |
|---|---|
| `connect()` | attach to the workbench page (waits for VS Code) |
| `reloadWindow(page)` | Developer: Reload Window, call it first in every script (see Gotchas) |
| `runCommand(page, 'Front Matter: …')` | command palette; throws when another command is highlighted |
| `openFile(page, 'content/blog/post-1.md')` | quick open |
| `showPanel(page)` | show the Front Matter panel without toggling it closed |
| `webviewFrame(page, selector)` | frame of the panel (`.metadata_field`) or dashboard (`input[placeholder*="Search"]`, media: `input[placeholder*="Search in folder"]`) |
| `panelField(frame, 'Title')` | field by label; inside: `textarea` (string), `input` (slug, number, tags), `.ql-editor` (wysiwyg) |
| `selectAll(locator)` | click + Cmd+A in a webview input, waiting for VS Code's async select all |
| `explorerContextAction(page, 'news', 'Register folder')` | Explorer context menu item, also in the "Front Matter" submenu |
| `quickInput(page)` | title, placeholder and first rows of the open quick pick/input |
| `shot(page, name)` | screenshot to `$FM_RUN_DIR/shots/<name>.png`; look at it |
| `read('rel/path')`, `checker()` | read a workspace file; collect PASS/FAIL |

Autosave is on (300 ms), so wait ~3 s after an edit and check the file on disk.

Dashboard notes:
- The folder filter is the "Showing" menu, with `[role="menuitem"]` items.
- The tab counter is the "All articles N" button.
- Count cards by their "Open custom actions" buttons.
- Pagination buttons are labelled `1`, `2`, `Next`.

Media cards have a "Menu" button with "Copy media path" (read it with `pbpaste`, and save and restore the user's clipboard around it).

## Gotchas

- **`listen EINVAL … main.sock`, VS Code exits:** the IPC socket lives in `--user-data-dir` and macOS caps socket paths at 103 chars. Keep `FM_RUN_DIR` short, or symlink a long folder to a short path.
- **Blank panel/dashboard:** in development mode the webviews load from `localhost:9000` (dashboard) and `9001` (panel), the `watch:dashboard` / `watch:panel` dev servers. `launch.sh` starts them; check `*-server.log`.
- **Webview frames not found after connecting:** they are out-of-process iframes, and Playwright only attaches to ones created after it connected. Run `reloadWindow()` at the start of each script. "Developer: Reload Webviews" does not recreate the panel (`retainContextWhenHidden`).
- **Typing ends up in the text editor:** `page.keyboard` sends keys to the workbench, not the focused webview. `Meta+A` + typing then replaces the whole markdown document. Always type with `locator.press()` / `locator.pressSequentially()` on a webview locator. `page.keyboard` is fine for the command palette and quick picks.
- **First character lost after `Meta+A`:** VS Code handles Cmd+A in webviews through the host and sends "select all" back asynchronously, so the first typed character gets selected and replaced. Use `selectAll(locator)` (waits 300 ms), not a bare `press('Meta+A')` followed by typing. This is a driver artifact, not a Front Matter bug.
- **Commands hidden from the palette** (`"when": "false"`):
  - "Create template from current file": the panel button "Create template".
  - "Register/Unregister folder": the Explorer context menu, "Front Matter" submenu.
  - "Remap or remove tag/category": no menu at all. `launch.sh` binds it to `ctrl+alt+shift+r`.
  - The palette fuzzy-matches look-alikes (ex. "Create category"), which is why `runCommand` checks the highlighted entry.
- **Native context menus can't be clicked:** `launch.sh` sets `"window.menuStyle": "custom"`.
- **Clicking the "FM" activity bar item while it is active hides the side bar:** use `showPanel()`.
- **Expected changes, not bugs:**
  - On activation, `frontMatter.taxonomy.tags` moves from `frontmatter.json` into `.frontmatter/database/taxonomyDb.json`, and `.frontmatter/database/` is created.
  - When the extension updates a setting, that one setting's value is reformatted (comments and the rest of the file are kept).
- **Never kill "Code" by name:** the user's own VS Code runs as the same binary. `stop.sh` only targets the `--remote-debugging-port` instance.

## Troubleshooting

- **"Port 9333 is in use":** a test instance is still running → `./stop.sh`.
- **`workbench not found`:** see `$FM_RUN_DIR/vscode.log`.
- **Extension changes not picked up:** re-run `npm run dev:build:ext` in the extension folder, then `reloadWindow()`. Webview changes are rebuilt by the dev servers automatically.
- **Not covered:** Windows (`launch.sh` and the clipboard/menu helpers are macOS only).
