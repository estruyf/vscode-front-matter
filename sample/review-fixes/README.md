# Review fixes test project

A sample site to test the fixes from the code review, PRs #1068 – #1074, by hand in VS Code. Every check lists what to do and what you should see. The PR number tells you which branch the fix lives in.

## Setup

1. Combine all branches in a local test branch, unless they are already merged:

   ```bash
   git fetch origin
   git switch -c test/review-fixes origin/beta
   for b in perf/quick-speed-wins fix/settings-data-loss fix/helpers fix/commands-settings \
            fix/listeners-services fix/dashboard fix/panel; do
     git merge --no-edit origin/$b
   done
   ```

2. Start the extension: **Launch Extension** (F5), with `npm run watch:dashboard` and `npm run watch:panel` running. In the Extension Development Host, open the folder `sample/review-fixes`.

   Or launch it with the `run-vscode` skill: `.claude/skills/run-vscode/launch.sh . sample/review-fixes`.

3. Optional, but it helps:
   - Turn on **autosave**, so panel edits land on disk right away.
   - Open the **Output › Front Matter** channel.
   - Use the **Source Control** view to see exactly what changed.

4. Some commands have no menu entry. Add these keybindings (**Preferences: Open Keyboard Shortcuts (JSON)**):

   ```json
   { "key": "ctrl+alt+shift+r", "command": "frontMatter.remap" },
   { "key": "ctrl+alt+shift+t", "command": "frontMatter.insertTags" }
   ```

**Reset** after a test (from the repository root):

```bash
git checkout -- sample/review-fixes && git clean -fd -- sample/review-fixes
```

`script-output.json` is ignored by git. The test scripts write what they received into it, so delete it whenever you want a clean slate.

## What is in the project

| Path | Used for |
|---|---|
| `frontmatter.json` | Commented config: the comments must survive every settings update |
| `content/blog` | 30 pages (2 pages on the dashboard): `post-01` – `post-20`, `hello` / `hello-world`, `search-index`, `$(touch fm-pwned).md`, `injection-payloads.md` (shell payloads in the front matter), `wysiwyg-variety.md` (markdown that Quill would rewrite), `broken-front-matter.md`, `links.md`, `my post.md`, `string-tags.md` |
| `content/blog-archive` | A folder whose name starts with `blog` |
| `content/docs/*` | Wildcard content folder |
| `content/i18n/{en,nl}` | i18n content folder |
| `content/news` | Content type `news`: `slugTemplate: {{title}}-{{fileName}}`, a text date in `previewPath`, file prefix `{{filePrefix.index\|zeros:3}}` |
| `content/yearly` | File prefix `{{year}}/` |
| `guide` content type | Sub content with page bundles, for the page bundle question |
| `content/recipes` | Content type from the folder (`recipe`), taxonomy field named `labels`, comma separated values |
| `content/fields/demo.md` | Every panel field type: html/markdown wysiwyg, decimal number, slug, multi choice, datetime, list, relationship, tags, nested fields with a hidden default, block field |
| `content/to-register` | A folder that is not registered yet |
| `.frontmatter/templates` | `article.md` (`draft: true`, number, empty value, `{{authorLine}}` script placeholder), `placeholder.md` (only text values and `{{authorLine}}`), `post.md` and `blog-post.md` |
| `data/team` | Data folder with file creation enabled and no `fileType` |
| `public/images` | `public-logo.png` (static folder name in the file name), `hero.png`, `$(touch fm-pwned).png`, `sub/inside-subfolder.png` |
| `scripts` | Custom scripts that record their arguments in `script-output.json`: Echo args, Ask a question, Bulk echo, Media info, Python echo (`python3 -u`), Copilot prompt, Windows npx check |
| `src/app.js` | A non-content file to focus while editing (not `.ts`, so the repo's TypeScript build ignores it) |
| `extras/split-config` | A content type to copy into `.frontmatter/config` for the split config test |

---

## #1068 – Performance

- [ ] **Unrelated settings.** Change an unrelated VS Code setting (for example `editor.fontSize`). The dashboard and panel don't refresh, and the Front Matter output shows no settings reload. Changing a `frontMatter.*` setting still refreshes them.
- [ ] **Non-content files.** With the dashboard open, copy `public/images/hero.png` into `content/blog`. The dashboard doesn't re-parse all pages (no parsing status bar item, no loading state). Delete the image again.
- [ ] **Media refresh.** In the media dashboard, refresh, then upload or paste an image. The list refreshes once.
- [ ] **Panel scrolling.** Scroll the panel on `content/fields/demo.md`. It scrolls smoothly, and after inserting media from the panel, it returns to the same scroll position.
- [ ] **Media loading.** In the media dashboard, images load lazily, and videos only load their metadata.

## #1069 – Settings and tags

- [ ] **Create template keeps the project settings.** Open `content/blog/post-01.md`. In the panel, choose **Other actions › Create template**, name it `my-template`, and answer **yes** to keep the contents.
  - `.frontmatter/templates/my-template.md` exists.
  - `frontmatter.json` is unchanged: all 4 content types, `framework.id: "other"`, and the comments.
- [ ] **Cancelling remap keeps the tag.** Press `ctrl+alt+shift+r`, choose **Tag**, then **alpha**. Press **Esc** on the new-value box, then **Esc** on "Delete alpha tags?". No file changes.
- [ ] **Comments are kept.** After any action that writes `frontMatter.json` (for example registering a folder in #1071), all comments are still there. Only the changed setting is reformatted.

## #1070 – Scripts, placeholders, parser, media library

Security (macOS/Linux; on Windows also check the limitation in the PR):

- [ ] **Crafted file name.** Open `content/blog/$(touch fm-pwned).md` and run **Echo args** from the panel's custom actions.
  - No `fm-pwned` file appears anywhere in the project.
  - `script-output.json` shows the literal file path.
- [ ] **Answers.** Run **Ask a question** on any post and accept the default answer (quotes, `$(touch fm-pwned)` and backticks).
  - No `fm-pwned` file appears.
  - The recorded answer is the exact text, as `message=…`.
- [ ] **Placeholder script.** Create content from the `article` template (dashboard **Create content › template**, or **New article from template**) with the title `Don't panic`. The front matter gets `author: "Written by the team: Don't panic"`, not `faultyCustomPlaceholder`.

Placeholders and file names:

- [ ] **Template values.** The same `article` template, with `draft: true`, `weight: 1` and an empty `image:`, creates the file without an error.
- [ ] **File prefix index.** Do the Smart Rename part first: the index counts the other files in the folder.
  1. Open `content/news/002-second-news.md` and click **Smart rename** in the panel. You get "The filename is already in sync with the front matter", which means the `002-` prefix was computed without the old "FileNotADirectory" error.
  2. Change the **Title** to `Second news updated` and click **Smart rename** again. The file is renamed to `002-second-news-updated.md`, keeping index `002`.
  3. Choose **Create content › Create by content type**, then **news**, and enter a title. The new file name starts with the next index (`003-…`).
- [ ] **Slug template.** Open `content/news/002-second-news.md` and regenerate the slug (the button next to the slug field). The slug contains the title and the file name, with no literal `{{fileName}}`.
- [ ] **Text date.** On the dashboard, preview **First news** (`eventDate: 15-03-2024`, used in `previewPath`). The preview opens without a "RangeError: Invalid time value".
- [ ] **Prefix ending in `/`.** Choose **Create content › Create by content type**, then **yearly**, then **recipe** (no page bundles), and enter the title `Year test`. It is created as `content/yearly/<year>/year-test.md`; before the fix it failed with `<year>/-year-test.md`. With `default` (page bundles) you get `content/yearly/<year>/year-test/index.md`, which already worked before the fix.

Content health, taxonomy and parsing:

- [ ] **Links.** The internal link check is experimental: add `"frontMatter.experimental": true` to `frontmatter.json` (remove it afterwards). Open `content/blog/links.md` and look at **Content health** in the panel. Only `does-not-exist.md` is reported as broken. The `%20` link, `mailto:` and `tel:` are not.
- [ ] **Taxonomy rename.** In the Taxonomies dashboard, rename the tag `breakfast` to `brunch`. Both `content/recipes/pancakes.md` (comma separated string) and `waffles.md` (list) are updated in their `labels` field.
- [ ] **Diagnostics.** Open `content/blog/post-01.md`, then refresh the dashboard (it also parses `broken-front-matter.md`).
  - `post-01.md` gets no "front matter error" squiggle.
  - Opening `broken-front-matter.md` shows its error on that file.
- [ ] **Key order.** With the dashboard open, edit a few fields of `post-01.md` in the panel. The front matter keeps its key order and quoting.

Scripts and media library:

- [ ] **Media script.** In the media dashboard, open `images`, then run **Media info** from the menu of `public-logo.png`.
  - The progress notification closes.
  - `script-output.json` records the media path.
- [ ] **Bulk script.** Bulk scripts run on all content and are listed in the dashboard's **Create content** dropdown (the chevron, ⚡ icon), not in the selection's Scripts menu. Run **Bulk echo** from there.
  - The progress notification closes when it has finished.
  - `script-output.json` has an entry for every page.
- [ ] **Media metadata.** In the media dashboard, edit the metadata of `hero.png` (title `Hero`). Refresh the media view 3 times, then rename `hero.png` in the Explorer. `.frontmatter/database/mediaDb.json` has one entry with the new path, and the title is kept.
- [ ] **Windows only.** Paths with an uppercase drive letter (an absolute `C:\…` media folder or script output) match the content folders.

## #1071 – Page folders, content types, commands

- [ ] **Register and unregister.** In the Explorer, right-click `content/to-register` and choose **Front Matter › Register folder**.
  - `frontmatter.json` gets one new entry.
  - The `docs/*` wildcard and the `i18n` entry are unchanged (not expanded into `docs/getting-started`, `docs/guides` or `content/i18n/en`).
  - The comments are kept.

  Then choose **Unregister folder**: the entry is removed again, and the other entries are unchanged.
- [ ] **Folder boundaries.** On the dashboard, choose **Showing › blog**. `Old archived post` (from `blog-archive`) is not included. The panel's **Recently modified** also lists `blog-archive` separately.
- [ ] **Page bundle answer.** The page bundle question is only asked for sub content, so this uses the `guide` content type (`allowAsSubContent`, `pageBundle: true`).
  1. Choose **Create content › Create by content type**, pick **blog**, then **guide**.
  2. Answer **Yes** to creating it as sub content, and select `content/blog` in the folder dialog.
  3. Answer **No** to the page bundle question, then enter a title.
  4. Repeat. The page bundle question is asked again; before the fix, the first "No" stuck for the session.
- [ ] **Add missing fields.** Add `extra: test` to the front matter of `post-01.md` and use **Add missing fields** from the panel's content type warning.
  - The default content type gets an `extra` field.
  - `seoGroup` is still a `fieldCollection` reference, not inlined `seoTitle` / `seoDescription` fields.
- [ ] **Split config** (opt-in). Copy `extras/split-config/recipe.json` to `.frontmatter/config/taxonomy/contentTypes/recipe.json` and reload the window. Run **Generate content type from current file** on `content/recipes/pancakes.md` (answer **no** to overriding the default, enter any name).
  - You get the "Cannot update setting … because you've extended or split the configuration" warning.
  - No "has been generated" message appears.
  - `frontmatter.json` and `pancakes.md` are unchanged; the page doesn't get the unsaved content type.

  Delete the copied file afterwards.
- [ ] **Open on website.** Close all editors. On the dashboard, use **Open on website** on `Search index`. It opens `https://example.com/blog/search-index`, without an error and without the slug of another file.
- [ ] **Preview slug.** **Preview content** on `search-index.md`. The URL ends in `search-index`, not `search-`.
- [ ] **Create tag.** Open `content/recipes/waffles.md`, run **Create tag** with `fresh`, and add it to the page. `labels` gets `fresh`, and no `tag:` key is added.
- [ ] **Export taxonomy.** In the Taxonomies dashboard, export the tags to the settings. `foo` (from `string-tags.md`) is exported as one tag, not `f`, `o`.
- [ ] **Bold without a selection.** In the body of `post-01.md`, put the cursor in the middle of a word and click **Bold** in the editor toolbar. `****` is inserted at the cursor, and the cursor sits between the stars.
- [ ] **Template choice.** Create content from the template `post`. The new file has the title `From the post template` (not `From the blog-post template`).
- [ ] **Last modified after a settings change.** Change a `frontMatter.*` setting in `frontmatter.json`, then edit and save `post-02.md` right away. `lastmod` is updated.
- [ ] **Deleting other files.** Delete `src/app.js`. The output log shows no config reload. Restore it afterwards.
- [ ] **Validation follows config changes.** Set `"required": false` on the default content type's `title` in `frontmatter.json`. Validation of a page with an empty title updates without reloading the window.

## #1072 – Dashboard pages, search, parser

- [ ] **Deleted pages.** With the dashboard open, delete `content/blog/post-20.md` in the Explorer.
  - The card disappears.
  - Restore it (Undo in the Explorer, or `git checkout`) and edit it: the card comes back and updates.
- [ ] **Search after a delete.** After deleting a page, search for `Post 1`: the results are correct (no wrong or empty cards). Run **Clear cache** and search again: you still get results.
- [ ] **Card title only.** Add `"frontMatter.dashboard.content.card.fields.title": "author"` (no description field) and search. Search keeps working.
- [ ] **Git missing.** Add `"git.path": "/does/not/exist"` and `"frontMatter.git.enabled": true` to `.vscode/settings.json`. The dashboard still loads.
- [ ] **Content type slug template.** Use **Open on website** on `Second news`. The URL uses the `news` slug template (title and file name), not the global one.
- [ ] **Windows only.** Creating, changing and deleting files outside VS Code updates the dashboard.

## #1073 – Dashboard

- [ ] **Search with a folder filter.** Choose **Showing › archive**, then search `frontmatterzebra`. Only `Old archived post` is shown.
- [ ] **Search from page 2.** Go to page 2, then search `Old`. The result is shown, not an empty grid.
- [ ] **Taxonomy tagging.** In Taxonomies, open the tag `alpha` to tag pages.
  - Uncheck two pages, re-check the first, then Apply: only the second page loses `alpha`.
  - Typing in the filter hides the non-matching rows, without checking them.
- [ ] **Default filters.** Add `"frontMatter.dashboard.content.defaults": { "filters": { "tags": "beta" } }` and open the dashboard. The `beta` filter is applied. It is also applied when you open the dashboard on Media first and then switch to Contents.
- [ ] **Custom filter values.** Pick **Author › Alice**, then reset that filter. The author dropdown keeps updating, for example after editing an author.
- [ ] **Data view:**
  - **Switching files.** Switch quickly between `alice` and `bob`, then edit and save. The edit lands in the selected file.
  - **Form state.** Type in the data form and wait. The form is not reset while you type, and it clears after **Add**.
  - **New files.** Creating the data file `alice` is refused. Creating `carol` creates `data/team/carol.json` with `{}`.
- [ ] **Media path.** In the media dashboard, use **Copy media path** on `images/public-logo.png`. You get `/images/public-logo.png`, not `-logo.png`. Pasting the image into a markdown file inserts the same path.
- [ ] **Media snippet.** In `post-01.md`, use **Insert media**, pick `hero.png`, and insert it with **Media figure**. The snippet lands at the cursor in `post-01.md`. Repeat from `post-02.md`: it lands in `post-02.md`, not in `post-01.md`.
- [ ] **Media script in a subfolder.** In the media dashboard, open `images/sub` and run **Media info** on `inside-subfolder.png`. The view stays in `sub`.
- [ ] **Bulk scripts.** With the dashboard open, add another `"bulk": true` script to `frontmatter.json`. It shows up in the **Create content** dropdown (the chevron, ⚡ icon) without reloading the window. Bulk scripts are never listed in the selection's Scripts menu.
- [ ] **Preview URL.** In the preview, type in the URL bar. Typing stays smooth (no localization requests on every keystroke).

## #1074 – Panel

Use `content/blog/post-01.md` and `content/fields/demo.md`. Type fast.

Field editing:

- [ ] **Opening is safe.** Opening `demo.md` and `post-01.md` (markdown wysiwyg fields) doesn't change either file (Source Control stays clean).
- [ ] **Text field.** Type fast in **Title**. Every character is saved.
- [ ] **Wysiwyg.**
  - **Markdown:** type, pause about a second, then type again. Both parts are saved.
  - **HTML** (`Body (html)` in `demo.md`): typing works the same way.
- [ ] **Slug field.** Type fast. No characters are lost and the cursor doesn't jump.
- [ ] **Number field.** Type `1.05` in **Price** or **Weight**. It stays `1.05`, and the file gets `1.05`.
- [ ] **Choice and datetime.** Toggle several **Colors** quickly, and pick a new **Event** date. The picked values don't flip back.
- [ ] **Overlapping updates.** Type in **Title**, then click a **Color** right away. Both changes are saved.

Switching files:

- [ ] **Switching to a non-content file.** With `post-01.md` open in the panel, open `src/app.js`. The panel switches to the general view right away. It no longer shows the front matter of `post-01.md` again for a second before switching. Switching back to `post-01.md` shows its fields again.
- [ ] **Type, then switch.** Type in **Description**, then open another file right away. The last characters are saved into `post-01.md`.
- [ ] **Unsaved changes in a background tab.** Without autosave, change `post-01.md` in the editor (unsaved), focus another tab, and edit a panel field. The unsaved change is kept, and you get no "file is newer" conflict when saving.

Nested fields and blocks:

- [ ] **Clearing nested fields.** Clear **Meta title** (`seo.meta.title`). The `meta` object is removed and `seo.canonical` stays. Clearing the page **Title** keeps `title: ""`.
- [ ] **Hidden default.** Open `demo.md`. The hidden `meta.source` stays `manual`; it is not overwritten with the default `panel`.
- [ ] **Block fields.** In `demo.md` **Highlights**, edit `First highlight` and type in its title, then immediately open `Second highlight`.
  - The text stays in the first record.
  - Tags added to the second record go to the second record.
  - Two quick sub-field changes are both saved.

Other fields and commands:

- [ ] **Tag order.** Add the tag `beta` in `post-01.md`. The order becomes `zeta, alpha, beta` (not sorted).
- [ ] **List field.** Delete the `steps` list in the editor, then add a step in the panel. The old steps don't come back.
- [ ] **Relationship field.** Type `HELLO`: both `hello` and `hello-world` are found. Select `hello`: `hello-world` is still listed.
- [ ] **Set content type.** On `demo.md`, run **Set the content type to use for the current file** and choose `default`. The panel switches to the default fields right away.
- [ ] **Insert tags.** `ctrl+alt+shift+t` (**Insert tags**) focuses the tags field in the panel.
- [ ] **Slug generation.** Regenerate the slug in `content/news/001-first-news.md`. It uses the `news` slug template.
- [ ] **Health results.** Switch quickly between `links.md` and `post-01.md`. The content health of one file is never shown for the other.
- [ ] **Hanging requests.** Relationship field on an i18n page without a locale, Copilot buttons without a GitHub session: no endless spinners.
- [ ] **Reveal project folder.** It opens Finder or Explorer (also for a workspace path with spaces).

## #1076 – Custom scripts without a shell

#1076 fixes the same command injection as #1070 (already merged), in a different way, and it conflicts with `beta`. Test it on its own branch:

```bash
git fetch origin
git switch -c test/1076 origin/fix/custom-script-command-injection
git merge --no-edit origin/chore/review-fixes-sample
```

This branch was made before #1070 was merged, so content creation from the `article` template fails on its `draft: true` value (a separate bug fixed in #1070). Use the `placeholder` template instead.

In every check, no `fm-pwned` file may appear anywhere in the project, and `script-output.json` shows exactly what the script received.

- [ ] **Front matter payloads.** Open `content/blog/injection-payloads.md` and run **Echo args**. In the last entry of `script-output.json`:
  - `frontMatterParses` is `true`;
  - `description` and `author` arrive exactly as in the file (`"`, `&`, `;`, `$(…)`, backticks);
  - `singleQuotesEncoded` is `false`. This is a behaviour difference: on `beta` (#1070) it is `true`, because `'` is still sent as `%27`.
- [ ] **File name.** Open `content/blog/$(touch fm-pwned).md` and run **Echo args**. `filePath` ends in `$(touch fm-pwned).md`.
- [ ] **Bulk mode.** Run **Bulk echo** from the **Create content** dropdown (⚡). It runs for every page, including the two above.
- [ ] **Command with an argument.** Run **Python echo** (`"command": "python3 -u"`). `interpreterOptions` is `["-u"]`.
- [ ] **Answers.** Run **Ask a question** and accept the default answer. It is recorded as `message=it's "quoted" $(touch fm-pwned) \`ls\``.
- [ ] **Copilot output** (needs GitHub Copilot). Run **Copilot prompt**. The response is recorded as `promptResponse=…` with the quotes and `$(…)` intact.
- [ ] **Placeholder script.** Choose **Create content › Create by template**, then **blog**, then **placeholder**, and enter the title `Rock & Roll's "best" $(touch fm-pwned)`. The new page gets `author: "Written by the team: Rock & Roll's \"best\" $(touch fm-pwned)"`.
- [ ] **Media script.** In **Media › images**, run **Media info** on `$(touch fm-pwned).png`. `mediaPath` ends in `$(touch fm-pwned).png`.
- [ ] **Reveal project folder.** In the panel's **Other actions**, click **Reveal project folder**. Finder opens the sample folder.
- [ ] **Windows only:**
  - **Windows npx check** shows the new error that `.cmd`/`.bat` commands like `npx` are not supported.
  - A PowerShell script receives plain JSON.
  - `injection-payloads.md` (`"` and `&`) works as above.
- [ ] **Breaking by design:** a `command` with `~` or `$HOME` is no longer expanded.

The same checks pass on `beta` with #1070, except for the `%27` difference and the Windows `.cmd` message (#1070 shows a plain "command failed").

## #1077 – Wysiwyg markdown not rewritten on open

#1077 is the same fix as the wysiwyg part of #1074 (already merged) and conflicts with `beta`. Test it on its own branch:

```bash
git fetch origin
git switch -c test/1077 origin/fix/wysiwyg-markdown-reformat
git merge --no-edit origin/chore/review-fixes-sample
```

This branch was made before #1074 was merged, so pages with hidden fields that have a default (`content/fields/demo.md`) are still saved on open by that older bug. Use the pages in `content/blog`.

- [ ] **Opening.** Open `content/blog/wysiwyg-variety.md` (`|-`, `-` bullets, `_italic_`, `__bold__`, an ordered list and a link). The file is unchanged.
- [ ] **Switching files.** Switch to `post-01.md`. Both files are unchanged.
- [ ] **Switching via a non-content file.** Switch to `src/app.js` and back to `wysiwyg-variety.md`. The file is unchanged.
- [ ] **Typing and toolbar.** Type in **Summary**, and use **Bold** in its toolbar. Both are saved. Once you edit the field, the whole value is re-serialized (`|`, `*` bullets, `*italic*`, `**bold**`). That is expected and not part of the fix.

The same checks pass on `beta` (#1074).
