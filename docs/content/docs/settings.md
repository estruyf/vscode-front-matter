---
title: Settings
slug: settings
description: null
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-09-17T07:08:17.747Z'
weight: 7
---

# Settings

## Overview

Most of Front Matter is configurable to your needs. In this part of the documentation all settings are explained.

## Team settings and local settings


Since version 4 of Front Matter, Team settings got introduced. Teams settings allow you to have all settings on the project/solution level. You will be able to override them on user/local level (`.vscode/settings.json`).

The purpose of team settings is to share the global configuration of your CMS configuration. This way, your whole team can use the same tags/categories but apply their changes locally.

As you do not typically share your `.vscode/settings.json` configuration, we went for a `frontmatter.json` file on the root of your project/solution. The settings you provide in this JSON file are the same as you can configure on a local level. This allows you to easily copy, move settings from team to local level and vice versa.

## Migrate local settings to team settings

To allow you to easily migrate already defined settings, you can run the `Promote settings from local to team level` command.

## Available settings

### frontMatter.content.autoUpdateDate

Specify if you want to automatically update the modified date of your article/page.

- Type: `boolean`
- Default: `false`

### frontMatter.content.fmHighlight

Specify if you want to highlight the Front Matter in the Markdown file.

- Type: `boolean`
- Default: `true`

### frontMatter.content.pageFolders

This array of folders defines where the extension can find your content and create new content by running the create article command.

- Type: `object[]`
- Default: `[]`

Sample:

```json
{
  "frontMatter.content.pageFolders": [
    {
      "title": "Blog posts",
      "path": "[[workspace]]/content/posts"
    }
  ]
}
```

> **Important**: `[[workspace]]` is a placeholder that the extension uses to replace the workspace path. The reason why we choose to use this, is because some do not keep the original folder name.

### frontMatter.content.publicFolder

Specify the folder name where all your assets are located. For instance in Hugo this is the `static` folder.

- Type: `string`
- Default: `""`


### frontMatter.custom.scripts

Specify the path to a Node.js script to execute. The current file path will be provided as an argument."

- Type: `object[]`
- Default: `[]`

Sample:

```json
{
  "frontMatter.custom.scripts": [{
    "title": "Generate social image",
    "script": "./scripts/social-img.js",
    "nodeBin": "~/.nvm/versions/node/v14.15.5/bin/node"
  }]
}
```

### frontMatter.dashboard.openOnStart

Specify if you want to open the dashboard when you start VS Code.

- Type: `boolean | null`
- Default: `null`

### frontMatter.panel.freeform

Specifies if you want to allow yourself from entering unknown tags/categories in the tag picker (when enabled, you will have the option to store them afterwards).

- Type: `boolean`
- Default: `true`

### frontMatter.preview.host

Specify the host URL (example: http://localhost:1313) to be used when opening the preview.

- Type: `string`
- Default: `""`

### frontMatter.preview.pathName

Specify the path you want to add after the host and before your slug. This can be used for instance to include the year/month like: `yyyy/MM`. The date will be generated based on the article its date field value.

- Type: `string`
- Default: `""`

> **Important**: As the value will be formatted with the article's date, it will try to convert all characters you enter. In case you wan to skip some characters or all of them, you need to wrap that part between two single quotes. Example: `"'blog/'yyyy/MM"` will result in: `blog/2021/08`.

### frontMatter.taxonomy.dateField

This setting is used to define the publishing date field of your articles.

- Type: `string`
- Default: `date`

> **Important**: if you would use another field in your content types, be sure to remap this setting.

### frontMatter.taxonomy.modifiedField

This setting is used to define the modified date field of your articles.

- Type: `string`
- Default: `lastmod`

> **Important**: if you would use another field in your content types, be sure to remap this setting.

### frontMatter.taxonomy.dateFormat

Specify the date format for your articles. Check [date-fns formating](https://date-fns.org/v2.0.1/docs/format) for more information.

- Type: `string`
- Default: `iso`

### frontMatter.taxonomy.commaSeparatedFields

Specify the fields names that Front Matter should treat as a comma-separated array.

- Type: `string[]`
- Default: `[]`

> **Info**: As some site generators expect arrays in `YAML` to be comma-separated like Pelican. You can use this setting to define which of the front matter properties should be treated as an comma-separated array.

### frontMatter.taxonomy.tags

Specifies the tags which can be used in the Front Matter.

- Type: `string[]`
- Default: `[]`
### frontMatter.taxonomy.categories

Specifies the categories which can be used in the Front Matter.

- Type: `string[]`
- Default: `[]`

### frontMatter.taxonomy.slugPrefix

Specify a prefix for the slug.

- Type: `string`
- Default: `""`

### frontMatter.taxonomy.slugSuffix

Specify a suffix for the slug.

- Type: `string`
- Default: `""`

### frontMatter.taxonomy.alignFilename

Align the filename with the new slug when it gets generated.

- Type: `boolean`
- Default: `false`


### frontMatter.taxonomy.indentArrays

Specify if arrays in front matter of the markdown files are indented.

- Type: `boolean`
- Default: `true`

### frontMatter.taxonomy.noPropertyValueQuotes

Specify the property names of which you want to remove the quotes in the output value. Warning: only use this when you know what you are doing. If you're going to, for instance, remove the quotes from the date property, you can add the following:

```json
{
  "frontMatter.taxonomy.noPropertyValueQuotes": ["date"]
}
```

- Type: `string[]`
- Default: `[]`

### frontMatter.taxonomy.frontMatterType

Specify which Front Matter language you want to use. The extension supports `YAML` (default) and `TOML`.

- Type: `enum: YAML | TOML`
- Default: `YAML`

### frontMatter.taxonomy.seoTitleLength

Specifies the optimal title length for SEO (set to `-1` to turn it off).

- Type: `number`
- Default: `60`

### frontMatter.taxonomy.seoDescriptionLength

Specifies the optimal description length for SEO (set to `-1` to turn it off).

- Type: `number`
- Default: `160`

### frontMatter.taxonomy.seoContentLengh

Specifies the optimal minimum length for your articles. Between 1,760 words – 2,400 is the absolute ideal article length for SEO in 2021. (set to `-1` to turn it off).

- Type: `number`
- Default: `1760`

### frontMatter.taxonomy.seoDescriptionField

Specifies the name of the SEO description field for your page.

- Type: `string`
- Default: `description`

> **Important**: if you would use another field in your content types, be sure to remap this setting.

### frontMatter.templates.folder

Specify the folder to use for your article templates.

- Type: `string`
- Default: `.templates`

### frontMatter.templates.prefix

Specify the prefix you want to add for your new article filenames.

- Type: `string`
- Default: `yyyy-MM-dd`


## Removed settings

### frontMatter.content.folders

This setting has been deprecated since version `3.1.0` in favor of the newly introduced `frontMatter.content.pageFolders` setting.
