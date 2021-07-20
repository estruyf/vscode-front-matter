# Change Log

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
