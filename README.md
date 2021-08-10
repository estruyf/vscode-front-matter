<h1 align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter">
    <img alt="Front Matter" src="./assets/front-matter.png">
  </a>
</h1>

<h2 align="center">Front Matter is an essential Visual Studio Code extension when you want to manage the markdown pages of your static sites.</h2>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter" title="Check it out on the Visual Studio Marketplace">
    <img src="https://vsmarketplacebadge.apphb.com/version/eliostruyf.vscode-front-matter.svg" alt="Visual Studio Marketplace" style="display: inline-block" />
  </a>

  <img src="https://vsmarketplacebadge.apphb.com/installs/eliostruyf.vscode-front-matter.svg" alt="Number of installs"  style="display: inline-block;margin-left:10px" />
  
  <img src="https://vsmarketplacebadge.apphb.com/rating/eliostruyf.vscode-front-matter.svg" alt="Ratings" style="display: inline-block;margin-left:10px" />

  <a href="https://www.buymeacoffee.com/zMeFRy9" title="Buy me a coffee" style="margin-left:10px">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-€%203-blue?logo=buy-me-a-coffee&style=flat" alt="Buy me a coffee" style="display: inline-block" />
  </a>
</p>

This VSCode extension simplifies working with your markdown articles' front matter when using a static site generator like Hugo, Jekyll, Hexo, NextJs, Gatsby, and many more... For example, you can keep a list of used tags, categories and add/remove them from your article with the extension.

The extension will automatically verify if your title and description are SEO compliant. If this would not be the case, it will give you a warning.

> If you see something missing in your article creation flow, please feel free to reach out.

**Version 2**

In version v2.0.0 we released the newly redesigned sidebar panel with improved SEO support. This extension makes it the only extension to manage your Markdown pages for your static sites in Visual Studio Code.

<h2 id="table-of-contents">Table of Contents</h2>

<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#the-panel">The panel</a></li>
    <li><a href="#custom-actions">Custom actions</a></li>
    <li><a href="#creating-articles-from-templates">Create articles from templates</a></li>
    <li><a href="#syntax-highlighting-for-hugo-shortcodes">Syntax highlighting for Hugo Shortcodes</a></li>
    <li><a href="#available-commands">Available commands</a></li>
    <li><a href="#extension-settings">Extension settings</a></li>
    <li><a href="#feedback--issues--ideas">Feedback / issues / ideas</a></li>
  </ol>
</details>

## The panel

The Front Matter panel allows you to perform most of the extension actions by just a click on the button and it shows the SEO statuses of your title, description, and more.

Initially, this panel has been created to make it easier to add tags and categories to your articles as the current VSCode multi-select is not optimal to use.

To leverage most of the capabilities of the extension. SEO information and everyday actions like slug optimization, updating the date, and publish/drafting the article.

When you open the panel and the current file is not a Markdown file, it will contain the following sections:

<p align="center">
  <img src="./assets/v2.3.0/baseview.png" alt="Base view" style="display: inline-block" />
</p>

> **Info**: both **Global Settings** and **Other Actions** sections are shown for the base view as when a Markdown file is openend.

When you open the Front Matter panel on a Markdown file, you get to see the following sections:

**Global Settings**

<p align="center">
  <img src="./assets/v2.3.0/global-settings.png" alt="Global settings" style="display: inline-block" />
</p>

**SEO Status**

<p align="center">
  <img src="./assets/v2.0.0/seo.png" alt="SEO article status" style="display: inline-block" />
</p>

**Actions**

<p align="center">
  <img src="./assets/v2.0.0/actions.png" alt="Actions" style="display: inline-block" />
</p>

**Metadata: Keywords, Tags, Categories**

<p align="center">
  <img src="./assets/v2.0.0/metadata.png" alt="Article metadata" style="display: inline-block" />
</p>

> **Info**: By default, the tags/categories picker allows you to insert existing and none tags/categories. When you enter a none existing tag/category, the panel shows an add `+` icon in front of that button. This functionality allows you to store this tag/category in your settings. If you want to disable this feature, you can do that by setting the `frontMatter.panel.freeform` setting to `false`.

**Other actions**

<p align="center">
  <img src="./assets/v2.3.0/other-actions.png" alt="Other actions" style="display: inline-block" />
</p>

## Custom actions

Since version `1.15.0`, the extension allows you to create your own custom actions, by running Node.js scripts from your project. In order to use this functionality, you will need to configure the [`frontMatter.custom.scripts`](#frontmattercustomscripts) setting for your project.

Once a custom action has been configured, it will appear on the Front Matter panel.

<p align="center">
  <img src="./assets/v2.0.0/custom-action.png" alt="Custom action" style="display: inline-block" />
</p>

The current workspace-, file-path, and front matter data will be passed as an argument. In your script fetch these arguments as follows:

```javascript
const arguments = process.argv;

if (arguments && arguments.length > 0) {
  const workspaceArg = arguments[2]; // The workspace path
  const fileArg = arguments[3]; // The file path
  const frontMatterArg = arguments[4]; // Front matter data

  console.log(`The content returned for your notification.`);
}
```

> A sample file can be found here: [script-sample.js](./sample/script-sample.js)

The output of the script will be passed as a notification, and it allows you to copy the output.

<p align="center">
  <img src="./assets/custom-action-notification.png" alt="Custom action notification" style="display: inline-block" />
</p>

## Creating articles from templates

By default, the extension looks for files stored in a `.templates` folder that should be located in your website project's root.

> **Info**: You can overwrite the path by specifying it with the `frontMatter.templates.folder` setting.

When adding files in the folder, you'll be able to run the `Front Matter: New article from template` from a command or explorer menu. It will present you with the article template options once you pick one and specify the title. It creates the file and updates its front matter.

> **Info**: By default, the extension will create articles with a `yyyy-MM-dd` prefix. If you do not want that or change the date format, you can update the `frontMatter.templates.prefix` setting.

## Syntax highlighting for Hugo Shortcodes

<p align="center">
  <img src="./assets/syntax-highlighting.png" alt="Shortcode syntax highlighting" style="display: inline-block" />
</p>

## Available commands

**Front Matter: Initialize project**

This command will initialize the project with a template folder and an article template. It makes it easier to get you started with the extension and creating your content.

**Front Matter: Create a template from current file**

This command allows you to create a new template from the current open Markdown file. It will ask you for the name of the template and if you want to keep the current file its content in the template.

> **Info**: The create as template action is also available from the `other actions` section in the Front Matter panel.

**Front Matter: New article from template**

With this command, you can easily create content in your project within the registered folders and provided templates.

You can register and unregister folders by right-clicking on the folder in your VSCode explorer panel.

<p align="center">
  <img src="./assets/v2.1.0/register-folder.png" alt="Register/unregister a folder" style="display: inline-block" />
</p>

Once you registered a folder and a template has been defined ([how to create a template](#creating-articles-from-templates)), you can make use of this command. 

> **Info**: The benefit of this command is that you do not need to search the folder in which you want to create a new article/page/... The extension will do it automatically for you.

**Front Matter: Create <tag | category>**

Creates a new <tag | category> and allows you to include it into your post automatically

<p align="center">
  <img src="./assets/create-tag-category.gif" alt="Create tag or category" style="display: inline-block" />
</p>
  
**Front Matter: Insert <tags | categories>**

Inserts a selected <tags | categories> into the front matter of your article/post/... - When using this command, the Front Matter panel opens and focuses on the specified type.

> **Info**: This experience changed in version `1.11.0`.

**Front Matter: Export all tags & categories to your settings**

Export all the already used tags & categories in your articles/posts/... to your user settings.

**Front Matter: Remap or remove tag/category in all articles**

This command helps you quickly update/remap or delete a tag or category in your markdown files. The extension will ask you to select the taxonomy type (*tag* or *category*), the old taxonomy value, and the new one (leave the input field *blank* to remove the tag/category). 

> **Info**: Once the remapping/deleting process completes. Your VSCode settings update with all new taxonomy tags/categories.

**Front Matter: Set current date**

Update the `date` property of the current article/post/... to the current date & time.

**Optional**: if you want, you can specify the date property format by adding your settings' preference. Settings key: `frontMatter.taxonomy.dateFormat`. Check [date-fns formatting](https://date-fns.org/v2.0.1/docs/format) for more information on which patterns you can use.

**Front Matter: Set lastmod date**

Update the `lastmod` (last modified) property of the current article/post/... to the current date & time. By setting the `frontMatter.content.autoUpdateDate` setting, it can be done automatically when performing changes to your markdown files.

> **note**: Uses the same date format settings key as current date: `frontMatter.taxonomy.dateFormat`.

**Front Matter: Generate slug based on article title**

This command generates a clean slug for your article. It removes known stop words, punctuations, and special characters. 

Example:

```
title: Just a sample page with a title
slug: sample-page-title
```

You can also specify a prefix and suffix, which can be added to the slug if you want. Use the following settings to do this: `frontMatter.taxonomy.slugPrefix` and `frontMatter.taxonomy.slugSuffix`. By default, both options are not provided and will not add anything to the slug. Another setting is to allow you to sync the filename with the generated slug. The setting you need to turn on enable for this is `frontMatter.taxonomy.alignFilename`.

> **Info**: At the moment, the extension only supports English stopwords.

### Usage

- Start by opening the command prompt:
  - Windows: ⇧+ctrl+P
  - Mac: ⇧+⌘+P
- Use one of the commands from above

## Where is the data stored?

The tags and categories are stored in the project VSCode user settings. You can find them back under: `.vscode/settings.json`.

```json
{
  "frontMatter.taxonomy.tags": [],
  "frontMatter.taxonomy.categories": []
}
```

## Extension settings

The extension has more settings that allow you to configure it to your needs further. Here is a list of settings that you can set:

### `frontMatter.taxonomy.seoTitleLength`

Specifies the optimal title length for SEO (set to `-1` to turn it off). Default value: `60`.

```json
{
  "frontMatter.taxonomy.seoTitleLength": 60
}
```
### `frontMatter.taxonomy.seoDescriptionLength`

Specifies the optimal description length for SEO (set to `-1` to turn it off). Default value: `160`.

```json
{
  "frontMatter.taxonomy.seoDescriptionLength": 160
}
```

### `frontMatter.taxonomy.seoContentLength`

Specifies the optimal minimum length for your articles. Between 1,760 words – 2,400 is the absolute ideal article length for SEO in 2021. (set to `-1` to turn it off).

```json
{
  "frontMatter.taxonomy.seoContentLength": 1760
}
```

### `frontMatter.taxonomy.seoDescriptionLength`

Specifies the name of the SEO description field for your page. Default is `description`.

```json
{
  "frontMatter.taxonomy.seoDescriptionField": "description"
}
```

### `frontMatter.taxonomy.frontMatterType`

Specify which Front Matter language you want to use. The extension supports `YAML` (default) and `TOML`.

```json
{
  "frontMatter.taxonomy.frontMatterType": "YAML"
}
```

### `frontMatter.taxonomy.indentArrays`

Specify if arrays in the front matter are indented. Default: `true`. If you do not want to indent the array values, you can update it with the following setting change:

```json
{
  "frontMatter.taxonomy.indentArrays": false
}
```

### `frontMatter.taxonomy.noPropertyValueQuotes`

Specify the property names of which you want to remove the quotes in the output value. **Warning**: only use this when you know what you are doing. If you're going to, for instance, remove the quotes from the date property, you can add the following:

```json
{
  "frontMatter.taxonomy.noPropertyValueQuotes": ["date"]
}
```

### `frontMatter.taxonomy.dateField`

Specifies the date field name to use in your Front Matter. Default value: `date`.

```json
{
  "frontMatter.taxonomy.dateField": "date"
}
```

### `frontMatter.taxonomy.modifiedField`

Specifies the modified date field name to use in your Front Matter. Default value: `lastmod`.

```json
{
  "frontMatter.taxonomy.modifiedField": "lastmod"
}
```

### `frontMatter.custom.scripts`

Allows you to specify a title and script path (starting relative from the root of your project). These values will be used to create custom actions on the Front Matter panel. Default value: `[]`.

```json
{
  "frontMatter.custom.scripts": [{
    "title": "Generate social image",
    "script": "./scripts/social-img.js",
    "nodeBin": "~/.nvm/versions/node/v14.15.5/bin/node"
  }]
}
```

> **Important**: When the command execution would fail when it cannot find the `node` command. You are able to specify your path to the node app. This is for instance required when using `nvm`.

### `frontMatter.content.folders`

This array of folders defines where the extension can easily create new content by running the create article command.

```json
{
  "frontMatter.content.folders": [{
    "title": "Articles",
    "fsPath": "<the path to the folder>",
    "paths": ["<wsl-folder-path>"]
  }]
}
```

> **Important**: This setting can be configured by right-clicking on a folder in the VSCode file explorer view and clicking on the `Front Matter: Register folder` menu item.

### `frontMatter.content.autoUpdateDate`

Specify if you want to automatically update the modification date of your markdown page when doing changes to it. Default: `false`.

```json
{
  "frontMatter.content.autoUpdateDate": false
}
```

## Feedback / issues / ideas

Please submit them via creating an issue in the project repository: [issue list](https://github.com/estruyf/vscode-front-matter/issues).

<p align="center">
  <a href="#">
      <img src="https://estruyf-github.azurewebsites.net/api/VisitorHit?user=estruyf&repo=vscode-front-matter&countColor=%23F05450&labelColor=%230E131F" />
   </a>
</p>