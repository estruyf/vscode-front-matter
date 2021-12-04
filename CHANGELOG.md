# Change Log

## [5.7.0] - 2021-12-xx

### 🎨 Enhancements

- [#188](https://github.com/estruyf/vscode-front-matter/issues/188): Support for `.markdown` files added to the dashboard
- [#190](https://github.com/estruyf/vscode-front-matter/issues/190): Diagnostic output for the extension
- [#194](https://github.com/estruyf/vscode-front-matter/issues/194): WYSIWYG controls added for markdown files + configuration to enable/disable the functionality

### 🐞 Fixes

- [#191](https://github.com/estruyf/vscode-front-matter/issues/191): Fix beta settings page
- [#201](https://github.com/estruyf/vscode-front-matter/issues/201): Overflow issue with the media filename
- [#202](https://github.com/estruyf/vscode-front-matter/issues/202): Fix checkbox label color for light themes

## [5.6.0] - 2021-11-23

### 🎨 Enhancements

- Updated camera icon from VS Code to media icon
- Updated the media card actions to show it within a menu. This will give a better experience with custom scripts.
- [#97](https://github.com/estruyf/vscode-front-matter/issues/97): Custom Script support for media files and folders
- [#178](https://github.com/estruyf/vscode-front-matter/issues/178): Sorting added to the media dashboard
- [#179](https://github.com/estruyf/vscode-front-matter/issues/179): Updated the `open dashboard` icon to make it easier to spot it
- [#180](https://github.com/estruyf/vscode-front-matter/issues/180): Added `{filename}` as placeholder for media snippets
- [#181](https://github.com/estruyf/vscode-front-matter/issues/181): Support for custom taxonomy fields added

### 🐞 Fixes

- [#183](https://github.com/estruyf/vscode-front-matter/issues/183): Fix type error on the `frontMatter.content.sorting` setting

## [5.5.0] - 2021-11-15

As from this version onwards, the extension will be published to [open-vsx.org](https://open-vsx.org/).

### 🎨 Enhancements

- [#173](https://github.com/estruyf/vscode-front-matter/issues/173): Allow to specify your own sorting for the content dashboard
- [#174](https://github.com/estruyf/vscode-front-matter/issues/174): Added option to exclude sub-directories from page/markdown content retrieval 

## [5.4.0] - 2021-11-05

### 🎨 Enhancements

- [#166](https://github.com/estruyf/vscode-front-matter/issues/166): Added preview button to the panel base view
- [#167](https://github.com/estruyf/vscode-front-matter/issues/167): Allow to set the preview path per content type

## [5.3.1] - 2021-10-29

### 🐞 Fixes

- [#163](https://github.com/estruyf/vscode-front-matter/issues/163): Setting workspace state instead of global state for the media view

## [5.3.0] - 2021-10-28 - [Release Notes](https://beta.frontmatter.codes/updates/v5.3.0)

### 🎨 Enhancements

- [#158](https://github.com/estruyf/vscode-front-matter/issues/158): Add support for non-boolean draft/publish status fields
- [#159](https://github.com/estruyf/vscode-front-matter/issues/159): Enhancements to SEO checks: Slug check, keyword details, more article information

### 🐞 Fixes

- Value check when generating slug from title
- Fix for date time formatting with `DD` and `YYYY` tokens
- Fix in tag space replacing when object is passed

## [5.2.0] - 2021-10-19

### 🎨 Enhancements

- [#151](https://github.com/estruyf/vscode-front-matter/issues/151): Detect which site-generator or framework is used
- [#152](https://github.com/estruyf/vscode-front-matter/issues/152): Automatically set setting based on the used site-generator or framework
- [#154](https://github.com/estruyf/vscode-front-matter/issues/154): Bulk script support added
- [#155](https://github.com/estruyf/vscode-front-matter/issues/155): Fallback image added for the images shown in the editor panel

### 🐞 Fixes

- [#153](https://github.com/estruyf/vscode-front-matter/issues/153): Support old date formatting for date-fns
- [#156](https://github.com/estruyf/vscode-front-matter/issues/156): Fix for uploading media files into a new folder

## [5.1.1] - 2021-10-14

### 🐞 Fixes

- [#149](https://github.com/estruyf/vscode-front-matter/issues/149): Fix panel rendering when incorrect type for keywords is provided

## [5.1.0] - 2021-10-13

### 🎨 Enhancements

- [#141](https://github.com/estruyf/vscode-front-matter/issues/141): Allow content creation for page bundles or single files
- [#145](https://github.com/estruyf/vscode-front-matter/issues/145): Moved folder registration settings to `frontmatter.json` file
- [#147](https://github.com/estruyf/vscode-front-matter/issues/147): Error boundary added for metadata fields

### 🐞 Fixes

- Rendered more hooks than during the previous render in `FileList`
- [#142](https://github.com/estruyf/vscode-front-matter/issues/142): Fix for unknown tags where it throws an error
- [#143](https://github.com/estruyf/vscode-front-matter/issues/143): Fix for duplicate values in the file list
- [#144](https://github.com/estruyf/vscode-front-matter/issues/144): Fix for `toISOString` does not exist on object
- [#146](https://github.com/estruyf/vscode-front-matter/issues/146): Date parsing logic added with fallbacks

## [5.0.0] - 2021-10-07 - [Release Notes](https://beta.frontmatter.codes/updates/v5.0.0)

### ✨ New features

- [#113](https://github.com/estruyf/vscode-front-matter/issues/113): Integrating a local DB for media metadata (caption, alt)
- [#132](https://github.com/estruyf/vscode-front-matter/issues/132): Major changes to the media dashboard which allows you to navigate through all folders

### 🎨 Enhancements

- [#110](https://github.com/estruyf/vscode-front-matter/issues/110): Add support for workspaces with multiple folders
- [#117](https://github.com/estruyf/vscode-front-matter/issues/117): Allow to specify a singleline of text in the metadata fields
- [#119](https://github.com/estruyf/vscode-front-matter/issues/119): Multi-select support for choice fields
- [#121](https://github.com/estruyf/vscode-front-matter/issues/121): Choice fields support ID/title objects as well as a regular string
- [#122](https://github.com/estruyf/vscode-front-matter/issues/122): Update the filenames of your media
- [#124](https://github.com/estruyf/vscode-front-matter/issues/124): Add new `isPreviewImage` property to the content type field to specify custom preview images
- [#126](https://github.com/estruyf/vscode-front-matter/issues/126): Create new content from the available content types
- [#127](https://github.com/estruyf/vscode-front-matter/issues/127): Title bar action added to open the dashboard
- [#128](https://github.com/estruyf/vscode-front-matter/issues/128): Support for multi-select on image fields added
- [#131](https://github.com/estruyf/vscode-front-matter/issues/131): Folder creation support added on media dashboard
- [#134](https://github.com/estruyf/vscode-front-matter/issues/134): On startup, the extension checks if local settings can be promoted
- [#135](https://github.com/estruyf/vscode-front-matter/issues/135): `Hidden` property added for field configuration
- [#137](https://github.com/estruyf/vscode-front-matter/issues/137): Ask to move the `.templates` folder to the new `.frontmatter` folder

### 🐞 Fixes

- [#120](https://github.com/estruyf/vscode-front-matter/issues/120): Choice and number field not updating when set manually in front matter of the file
- [#133](https://github.com/estruyf/vscode-front-matter/issues/133): Fix for overriding default content type settings

## [4.0.1] - 2021-09-24

- [#114](https://github.com/estruyf/vscode-front-matter/issues/114): Fix for categories/tags provided as string in YAML
- [#115](https://github.com/estruyf/vscode-front-matter/issues/115): Fix for updating added categories/tags
- [#116](https://github.com/estruyf/vscode-front-matter/issues/116): Fix for not showing the `-1` limit on inputs

## [4.0.0] - 2021-09-22 - [Release Notes](https://beta.frontmatter.codes/updates/v4_0_0)

- [#101](https://github.com/estruyf/vscode-front-matter/issues/101): Date picker available on the metadata section
- [#102](https://github.com/estruyf/vscode-front-matter/issues/102): Support comma separated arrays in front matter
- [#103](https://github.com/estruyf/vscode-front-matter/issues/103): Added title and description field to the metadata section
- [#104](https://github.com/estruyf/vscode-front-matter/issues/104): Allow to set images in front matter from the metadata panel section
- [#105](https://github.com/estruyf/vscode-front-matter/issues/105): Content Type support with backwards compatibility
- [#106](https://github.com/estruyf/vscode-front-matter/issues/106): Introduction of team level settings for Front Matter
- [#107](https://github.com/estruyf/vscode-front-matter/issues/107): Number field support added in content type fields
- [#108](https://github.com/estruyf/vscode-front-matter/issues/108): Choice field support added in content type fields
- [#109](https://github.com/estruyf/vscode-front-matter/issues/109): JSON Config script added to automate the JSON schema
- [#111](https://github.com/estruyf/vscode-front-matter/issues/111): Insert media into the markdown contents
- [#112](https://github.com/estruyf/vscode-front-matter/issues/112): Add snippet support for media insertion

## [3.1.0] - 2021-09-10

- BETA version available at: [beta.frontmatter.codes](https://beta.frontmatter.codes)
- [#72](https://github.com/estruyf/vscode-front-matter/issues/72): Media view on the dashboard
- [#73](https://github.com/estruyf/vscode-front-matter/issues/73): List view option for the dashboard
- [#77](https://github.com/estruyf/vscode-front-matter/issues/77): Dashboard grouping pages functionality integrated
- [#81](https://github.com/estruyf/vscode-front-matter/issues/81): Optimizing the content folders to use a new setting to simplify configuration
- [#87](https://github.com/estruyf/vscode-front-matter/issues/87): Fix issue with autofocus and command palette
- [#88](https://github.com/estruyf/vscode-front-matter/issues/88): Fix issue with search sorting
- [#89](https://github.com/estruyf/vscode-front-matter/issues/89): Clear filter, sorting, and grouping button added
- [#90](https://github.com/estruyf/vscode-front-matter/issues/90): Refactoring to use Recoil state management
- [#91](https://github.com/estruyf/vscode-front-matter/issues/91): Support image previews from content folders
- [#98](https://github.com/estruyf/vscode-front-matter/issues/98): Add drag and drop support for media upload in a folder

## [3.0.2] - 2021-08-31

- [#82](https://github.com/estruyf/vscode-front-matter/issues/82): Hide the register and unregister commands from the command palette

## [3.0.1] - 2021-08-30

- [#79](https://github.com/estruyf/vscode-front-matter/issues/79): Fix scrollbar not visible on the welcome screen

## [3.0.0] - 2021-08-27

- [#61](https://github.com/estruyf/vscode-front-matter/issues/61): List of recently modified files
- [#64](https://github.com/estruyf/vscode-front-matter/issues/64): Publish toggle for easier publishing an article
- [#65](https://github.com/estruyf/vscode-front-matter/issues/65): Aggregate articles in draft
- [#66](https://github.com/estruyf/vscode-front-matter/issues/66): New dashboard webview on which you can manage all your content
- [#69](https://github.com/estruyf/vscode-front-matter/issues/69): Welcome screen for getting started

## [2.5.1] - 2020-08-23

- Fix typo in the `package.json` file for the preview command

## [2.5.0] - 2020-08-19  

- Moved the center layout button to the other actions section
- [#60](https://github.com/estruyf/vscode-front-matter/issues/60): Added the ability to open a site preview in VS Code 

## [2.4.1] - 2020-08-16

- Better editor highlighting functionality

## [2.4.0] - 2020-08-16

- [#21](https://github.com/estruyf/vscode-front-matter/issues/21): Folding provider for Front Matter implemented
- [#55](https://github.com/estruyf/vscode-front-matter/issues/55): Highlight Front Matter in Markdown files
- [#56](https://github.com/estruyf/vscode-front-matter/issues/56): Action to collapse all Front Matter panel sections at once
- [#57](https://github.com/estruyf/vscode-front-matter/issues/57): New action added to provide better writing settings (only for Markdown files)
- [#58](https://github.com/estruyf/vscode-front-matter/issues/58): Sections remember their previous state (folded/unfolded)
- [#59](https://github.com/estruyf/vscode-front-matter/issues/59): Center layout view toggle action added

## [2.3.0] - 2020-08-10

- Refactoring and showing other actions in the base view
- Show `BaseView` in Front Matter panel when switching to `welcome` tab
- [#31](https://github.com/estruyf/vscode-front-matter/issues/31): Automatically update the last modification date of the file when performing changes
- [#53](https://github.com/estruyf/vscode-front-matter/issues/53): Create current Markdown file as template

## [2.2.0] - 2020-08-06

- [#28](https://github.com/estruyf/vscode-front-matter/issues/28): Align the file its name with the article slug
- [#47](https://github.com/estruyf/vscode-front-matter/issues/47): Fix when table shows only value `0`
- [#48](https://github.com/estruyf/vscode-front-matter/issues/48): Added new folder registration message + notification helper
- [#49](https://github.com/estruyf/vscode-front-matter/issues/49): New initialize project command
- [#50](https://github.com/estruyf/vscode-front-matter/issues/50): Fix in the table rendering of rows
- [#51](https://github.com/estruyf/vscode-front-matter/issues/51): Panel actions base view enhanced to show project actions and information

## [2.1.0] - 2020-08-04

- [#44](https://github.com/estruyf/vscode-front-matter/issues/45): Added article creation command
- [#45](https://github.com/estruyf/vscode-front-matter/issues/45): WSL support added
- [#46](https://github.com/estruyf/vscode-front-matter/issues/46): Make the tag pickers render in full width

## [2.0.1] - 2020-07-27

- [#42](https://github.com/estruyf/vscode-front-matter/issues/42): Small enhancement to the table layout
- [#43](https://github.com/estruyf/vscode-front-matter/issues/43): Fix for collapsible sections and taxonomy picker

## [2.0.0] - 2020-07-23

- Redesigned sidebar panel
- Sidebar background styling match the VSCode defined sidebar color
- Added support for `mdx` files
- Added support for `enter` press in the combobox
- [#41](https://github.com/estruyf/vscode-front-matter/issues/41): Word count implementation + extra details
- [#40](https://github.com/estruyf/vscode-front-matter/issues/40): Added checks for the keyword usage in title, description, slug, and content

## [1.18.0] - 2020-07-20

- Updated README

## [1.17.1] - 2020-06-28

- [#34](https://github.com/estruyf/vscode-front-matter/issues/34): Fix that last modification date does not update the publication date
- [#38](https://github.com/estruyf/vscode-front-matter/issues/38): Update the last modification date on new page creation from the template

## [1.17.0] - 2020-06-14

- [#36](https://github.com/estruyf/vscode-front-matter/issues/36): Add the option to change the Front Matter its description field

## [1.16.1] - 2020-05-27

- Fix for Node.js v14.16.0

## [1.16.0] - 2020-05-04

- Add all front matter properties as an argument for custom scripts

## [1.15.1] - 2020-05-04

- Add the ability to specify a custom Node path

## [1.15.0] - 2020-05-04

- Added the ability to add your own custom scripts as panel actions.

## [1.14.0] - 2020-03-19

- New links added to the Front Matter panel to reveal the file and folder.

## [1.13.0] - 2020-02-26

- Implemented links to quickly open the extension settings + issue from the FrontMatter view panel
- Added button to update the modified time in the FrontMatter view panel

## [1.12.1] - 2020-02-13

- Fix Front Matter SVG

## [1.12.0] - 2020-01-26

- [#29](https://github.com/estruyf/vscode-front-matter/issues/29): Open file after creating it from the template

## [1.11.1] - 2020-12-10

- [#26](https://github.com/estruyf/vscode-front-matter/issues/26): Fix for arrow selection in the dropdown.

## [1.11.0] - 2020-12-10

- [#25](https://github.com/estruyf/vscode-front-matter/issues/25): Moved from Material UI Autocomplete to Downshift. This gives more flexibility, and allows to focus the inputs from a VSCode command.
- Changed the `Front Matter: Insert <tags | categories>` functionality to open in the panel, instead of using the VSCode dialogs.

## [1.10.0] - 2020-12-03

- FrontMatter panel implemented. This panel allows you to control all extension actions, but not only that. It makes adding tags and categories in a easier way to your page.

## [1.9.0] - 2020-11-25

- [#23](https://github.com/estruyf/vscode-front-matter/issues/23): Implemented the option to create and use templates for article creation (front matter will be updates as well).

## [1.8.0] - 2020-11-20

- [#22](https://github.com/estruyf/vscode-front-matter/issues/22): Allow to configure the SEO Title and Description lengths.

## [1.7.2] - 2020-10-30

- [#19](https://github.com/estruyf/vscode-front-matter/issues/19): fix for tag insertion when empty tag is used

## [1.7.1] - 2020-10-21

- Fix for title and description length check

## [1.7.0] - 2020-09-30

- [#18](https://github.com/estruyf/vscode-front-matter/issues/18): Added date and modified date field names settings to be able to change the extension its behavior

## [1.6.0] - 2020-09-23

- Syntax highlighting for Hugo shortcodes has been added

## [1.5.0] - 2020-09-10

- [#17](https://github.com/estruyf/vscode-front-matter/issues/17): Make front matter be indentation `tabSize` aware

## [1.4.0] - 2020-08-24

- Added set `lastmod` date command
- [#16](https://github.com/estruyf/vscode-front-matter/issues/16): Fixed hardcoded length value

## [1.3.0] - 2020-08-22

- Added SEO description warning when over 140 characters is used

## [1.2.0] - 2020-07-03

- Added SEO title warning when over 60 characters is used

## [1.1.1] - 2020-04-07

- `TOML` delimiter fix

## [1.1.0] - 2020-03-25

- `TOML` support added

## [1.0.0] - 2020-03-25

- First major release
- Fixed an issue with `null` tag/category values

## [0.0.10] - 2019-09-17

- Updated the logic to remove quotes from front matter property values

## [0.0.9] - 2019-09-17

- Added setting to specify if you want to enable/disable array indents in the front matter of your article
- Remove quotes on date strings

## [0.0.8] - 2019-09-04

- Added command to generate a clean article slug

## [0.0.7] - 2019-08-28

- Added command to remap tags or categories in all posts: `Front Matter: Remap tag/category in all articles`

## [0.0.6] - 2019-08-28

- Updated `package.json` file to include preview label
- Added the status bar item to quickly view and update the draft status of an article

## [0.0.5] - 2019-08-27

- Updated title, description and logo

## [0.0.4] - 2019-08-26

- Added set date command

## [0.0.3] - 2019-08-26

- Support added for `*.markdown` files

## [0.0.2] - 2019-08-26

- Updated extension to bundle the project output

## [0.0.1] - 2019-08-26

- Initial beta version
