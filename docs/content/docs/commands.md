---
title: Commands
slug: commands
description: 
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-08-30T16:13:01.763Z'
weight: 6
---

# Commands

## Overview

Front Matter actions are also available as commands. In this section of the documentation all commands will be explained.

![Commands](/assets/commands.png)

## Using commands

- Start by opening the command prompt:
  - Windows: ⇧+ctrl+P
  - Mac: ⇧+⌘+P
- Use one of the following commands

## Available commands

### Initialize project

This command will initialize the project with a template folder and an article template. It makes it easier to get you started with the extension and creating your content.

ID: `frontMatter.init`

### Open dashboard

Opens the dashboard with your Markdown pages overview. If you did not yet initialize your project, the welcome screen will be shown.

ID: `frontMatter.dashboard`

### Create category

Creates a new category and allows you to include it into your post automatically.

ID: `frontMatter.createCategory`

### Create tag

Creates a new tag and allows you to include it into your post automatically.

ID: `frontMatter.createTag`

### Insert categories

Inserts a selected categories into the front matter of your article/post/... - When using this command, the Front Matter panel opens and focuses on the specified type.

ID: `frontMatter.insertCategories`

### Insert tags

Inserts a selected tags into the front matter of your article/post/... - When using this command, the Front Matter panel opens and focuses on the specified type.

ID: `frontMatter.insertTags`

### Export all tags & categories to your settings

Export all the already used tags & categories in your articles/posts/... to your user settings.

ID: `frontMatter.exportTaxonomy`

### Remap or remove tag/category in all articles

This command helps you quickly update/remap or delete a tag or category in your markdown files. The extension will ask you to select the taxonomy type (tag or category), the old taxonomy value, and the new one (leave the input field blank to remove the tag/category).

> **Info**: Once the remapping/deleting process completes, your VS Code settings update with all new taxonomy tags/categories.

ID: `frontMatter.remap`

### Create a template from current file

This command allows you to create a new template from the current open Markdown file. It will ask you for the name of the template and if you want to keep the current file its content in the template.

ID: `frontMatter.createTemplate`

### New article from template

With this command, you can easily create content in your project within the registered folders and provided templates.

> **Info**: The command will use the `frontMatter.templates.prefix` setting in order to add a prefix (default: `yyyy-MM-dd`) on the filename.

ID: `frontMatter.createContent`

### Generate slug based on article title

This command generates a clean slug for your article. It removes known stop words, punctuations, and special characters.

Example:

```yaml
---
title: Just a sample page with a title
slug: sample-page-title
---
```

You can also specify a prefix and suffix, which can be added to the slug if you want. Use the following settings to do this: `frontMatter.taxonomy.slugPrefix` and `frontMatter.taxonomy.slugSuffix`. 

By default, both prefix and suffix settings are not provided, which mean it would not add anything extra to the slug. 

Another setting is to allow you to sync the filename with the generated slug. The setting you need to turn on enable for this is `frontMatter.taxonomy.alignFilename`.

> **Info**: At the moment, the extension only supports English stopwords. 

ID: `frontMatter.generateSlug`

### Set lastmod date

Sets/updates the current modified date in your Markdown file.

ID: `frontMatter.setLastModifiedDate`

### Preview article

Open the site preview of your article in VS Code.

ID: `frontMatter.preview`

## Promote settings from local to team level

This command allows you to promote all local settings from within your `.vscode/settings.json` file to be promoted to the projects team configuration `frontmatter.json` file.

ID: `frontMatter.promoteSettings`

## Removed commands

### Set current date

This command has been removed, as it became obsolete since the introduction of Content Types.

ID: `frontMatter.setDate`