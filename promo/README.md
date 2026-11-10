# The promo videos

Two cuts of Front Matter CMS, made with [Remotion](https://www.remotion.dev) —
React rendered to frames, so the timeline is a table of frame numbers in a
`.tsx` file and changing the pace is changing a number and re-rendering.

| Composition | | |
| --- | --- | --- |
| `Promo` | 30s | The pitch: the dashboard, editing a post in the panel, media |
| `Tour` | 90s | Every screen: contents, drafts, editing, content health, creating a post, media, snippets, data, taxonomies |

Nothing here is part of the extension. It has its own `package.json`, the root
`tsconfig.json` excludes it, and `.vscodeignore` keeps it out of the VSIX.

## Building them

```bash
npm install
npx playwright install chromium   # only for `npm run covers`

npm run vsix             # package the extension from the repo root into .cache/
npm run capture          # every still and every recorded beat, retaken
npm start                # the Remotion studio, with a scrubbable timeline
npm run render           # out/promo.mp4
npm run render:tour      # out/tour.mp4
npm run web              # out/web/: the copies the site and the README use
```

`npm run capture shots` and `npm run capture clips` do half each; naming a shot
or a beat (`npm run capture edit media`) does just that one.

A capture opens a VS Code window on your screen and drives it. Leave the mouse
alone until it closes.

## Where the pictures come from

Everything on screen is the real extension, running in real VS Code, driven by
Playwright. Nothing is a mock-up.

`scripts/harness.mjs` downloads a pinned VS Code build (`VSCODE_VERSION`) into
`.cache/vscode`, installs the packaged VSIX into an empty extensions folder, and
opens a fresh copy of `demo/tidewater` with a throwaway profile — so every run
starts from the same state and nothing a beat writes ever reaches `demo/`. The
VSIX runs in production mode, which is what loads the webviews from `dist/`;
`--extensionDevelopmentPath` would load them from the webpack dev server.

`demo/tidewater` is a made-up studio's Astro site. The people, posts and
pictures in it are invented; `npm run covers` redraws the images (abstract, and
seeded, so a redraw gives the same pixels). Every date in it is written against
Thursday 24 September 2026, and every file's modification time is set to that
day before VS Code opens it.

Two settings in the demo's `frontmatter.json` are there for the video, and both
are ones a real site could have:

- `frontMatter.snippets.wrapper.enabled: false` — so an inserted snippet is
  just the component, without the `FM:Snippet` comments that let Front Matter
  re-open it later.
- `frontMatter.content.defaultSorting: PublishedDesc` — newest first, so the
  dashboard opens on the drafts and the latest posts.

**Stills** — `public/shots/*.png`, one per screen, at 2x (2560x1640 for a
1280x820 window). The pointer is parked in the title bar before each one:
hiding the dot is not enough, because the card it was left on keeps its hover
state.

**Recorded beats** — `public/clips/*.mp4`, at a constant 30 fps. Each is
`{ prepare, run }` and only `run` is recorded. Each beat gets a VS Code of its
own, so the draft the `edit` beat publishes is still a draft in every other
shot. `public/clips.json` records how long each one is and the compositions
read it.

Things about driving VS Code that are worth knowing before changing any of it:

- **Webviews are not inside the editor or the sidebar in the DOM.** They sit in
  an overlay laid over them. The dashboard and the panel are found by what they
  rendered — both render `#app`, only the dashboard's has `data-webview-url` —
  and looked up afresh every time, because a webview that is hidden and shown
  can come back as a new frame.
- **The pointer is drawn.** CDP's screencast leaves the cursor out, and mouse
  events inside a webview never reach the workbench document, so the dot cannot
  follow `mousemove`. `pointTo` moves the real mouse and the dot to the same
  coordinates, step for step. It is the only thing in any frame that VS Code did
  not draw.
- **The command palette filters a beat after you type.** `runCommand` waits
  until the top row is the exact command before pressing Enter; before that it
  once opened the secondary side bar instead of closing the primary one. The
  side bars only have *toggle* commands, so reset toggles them only when they
  are showing.
- **One date is not pinned.** A post made in the `create` beat is dated the day
  the capture ran — VS Code's extension host has its own clock. No caption
  mentions it.

## How a shot is put together

Each recorded beat **holds** on its first frame while the caption is read,
**plays** at full speed, and holds where it comes to rest — see `Clip` in
[`src/components/Shot.tsx`](src/components/Shot.tsx). Nothing is sped up; a beat
that runs long gets its pauses shortened in `capture.mjs` and is re-recorded.

The shots both cuts use are in [`src/shots.tsx`](src/shots.tsx), with the two
crops:

- `DESK` — the whole window.
- `LEFT` — the left 1908px: the panel and the start of every editor line. Its
  right edge sits in the gutter between the third and fourth dashboard card.
  VS Code's quick input and its toasts cross it, which is why the `create` and
  `snippet` beats use `DESK`.

[`src/cut.tsx`](src/cut.tsx) lays scenes end to end and gives the outro what is
left; it throws if a longer re-capture leaves the outro under four seconds.

## Re-cutting after the UI changes

`npm run vsix && npm run capture` replaces every frame. Three things it does not
fix:

- **Crops.** If the dashboard's card grid moves, `LEFT` may no longer end in a
  gutter. Re-measure against `public/shots/contents.png`.
- **Caption switch frames inside a beat.** They are the `at:` values in
  `src/shots.tsx`, with a note above them of where each thing happens in its
  clip. A caption that says "it comes back wrapped" over a dialog nobody has
  confirmed yet is the failure. Check with
  `npx remotion still src/index.ts Tour out/check.png --frame=N`.
- **The VS Code build.** Bumping `VSCODE_VERSION` moves the workbench chrome;
  treat it like a UI change.
