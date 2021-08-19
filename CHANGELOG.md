# Change Log

## [2.5.0] - 2020-08-19

- Moved the center layout button the other actions section
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
