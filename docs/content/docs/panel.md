---
title: Editor panel
slug: panel
description: null
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-09-17T16:13:01.763Z'
weight: 4
---

# Editor panel

## Overview

The Front Matter panel allows you to perform most of the extension actions by just a click on the button, and it shows the SEO statuses of your title, description, and more.

> **Info**: Initially, this panel was created to add tags and categories easily to your articles, as currently, VS Code multi-select is not optimal to use when having a lot of tags/categories.

To leverage most of the capabilities of the extension. SEO information and everyday actions like slug optimization, updating the date, and publish/drafting the article.

## Using the panel

Once you installed the extension, you will notice a Front Matter icon on the activity bar (by default on the left side). Clicking this icon will open the Front Matter panel.

![Activity bar action](/assets/activitybar-action.png)

## Global settings

In this section of the panel, you can modify a couple of the useful settings to have close to hand.

![Global settings](/assets/global-settings.png)

> **Info**: The global settings section will also be shown when you have the panel open on other types of files.

## SEO status

Search Engine Optimization or simply SEO is very important to any site. The extension shows you more information about how well your article is written.

Supports the following:

- Title and description length validation
- Article length recommendation
- Keyword validation on title, description, slug, and content
- More content details

![SEO](/assets/seo.png)

### Settings

In case you want to change the SEO settings, you can use the following settings: 

- `frontMatter.taxonomy.seoTitleLength`: Specifies the optimal title length for SEO (set to `-1` to turn it off).
- `frontMatter.taxonomy.seoDescriptionLength`: Specifies the optimal description length for SEO (set to `-1` to turn it off).
- `frontMatter.taxonomy.seoContentLengh`: Specifies the optimal minimum length for your articles. Between 1,760 words – 2,400 is the absolute ideal article length for SEO in 2021. (set to `-1` to turn it off).
- `frontMatter.taxonomy.seoDescriptionField`: Specifies the name of the SEO description field for your page. Default is 'description'.

## Actions

When writing articles, there are always a couple of actions you need/want to perform. In this section, we provide you the most used/requested actions like:

- Optimizing the slug
- Setting the publishing date
- Setting the modified date
- Publish or revert to draft

![Actions](/assets/actions.png)

> **Important**: You are able to add your own actions, more information about this you can read in our [custom actions](/docs/custom-actions) section.

> **Info**: In version `3.2.0` a couple of actions were moved to the metadata section like changing the draft state and date time properties.

### Settings

The following settings are related to these actions:

- `frontMatter.preview.host`: Specify the host URL (example: http://localhost:1313) to be used when opening the preview.
- `frontMatter.taxonomy.dateField`: Specifies the date field name to use in your Front Matter. Default: `date`.
- `frontMatter.taxonomy.modifiedField`: Specifies the modified date field name to use in your Front Matter. Default: `lastmod`.
- `frontMatter.taxonomy.dateFormat`: Specify the date format for your articles. Check [date-fns formating](https://date-fns.org/v2.0.1/docs/format) for more information.
- `frontMatter.taxonomy.slugPrefix`: Specify a prefix for the slug.
- `frontMatter.taxonomy.slugSuffix`: Specify a suffix for the slug.
- `frontMatter.taxonomy.alignFilename`: Align the filename with the new slug when it gets generated.

## Metadata

In the metadata section, you can manage the front matter of your Markdown file. This section is fully customizable to your needs with our `content type` support.

![Metadata section](/assets/metadata.png)

> **Info**: More information about content types can be read at [content type section](/docs/content-types).

The tags and categories inputs allow you to insert known and unknown tags/categories. When an unknown tag/category gets added, it will show a `+` sign that allows you to add it to your configuration so that it will appear in the known tags/categories next time.

### Settings

- `frontMatter.panel.freeform`: Specifies if you want to allow yourself from entering unknown tags/categories in the tag picker (when enabled, you will have the option to store them afterwards). Default: `true`.

## Recently modified

Navigate quickly to a recently modified file. In the recently modified section, the latest 10 modified files get shown. 

![Recently modified](/assets/recent-files.png)

> **Important**: In order to use this functionality, a registered content folder needs to be present. More information in our [getting started](/docs/getting-started) section.

> **Info**: The recently modified section will also be shown when you have the panel open on other types of files.

## Other actions

This section provides a couple of other useful actions, like opening the current project in your explorer/finder. 

![Other actions](/assets/other-actions.png)

> **Info**: The `writing settings enabled / enable write settings` action allows you to make Markdown specific changes to optimize the writing of your articles. It will change settings like the `fontSize`, `lineHeight`, `wordWrap`, `lineNumbers` and more.

> **Info**: The other actions section will also be shown when you have the panel open on other types of files.
