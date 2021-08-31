---
title: Dashboard
slug: dashboard
description: 
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-08-30T16:13:01.763Z'
weight: 3
---

# Dashboard

Managing your Markdown pages has never been easier in VS Code. With the Front Matter dashboard, you will be able to view all your pages and **search** through them, **filter**, **sort**, and much more.

![Dashboard](/assets/dashboard.png)

In order to start using the dashboard, you will have to let the extension know in which folder(s) it can find your pages. Be sure to follow our [getting started](/docs/getting-started) guide.

> **Important**: If your preview images are not loading, it might be that you need to configure the `publicFolder` where the extension can find them. For instance, in Hugo, this is the static folder. You can configure this by updating the `frontMatter.content.publicFolder` setting.

## Supported filters

- Tag filter
- Category filter
- Content folder (when you have multiple registered)

## Supported sorting

- Last modified
- Filename (asc/desc)

## Show on startup

If you want, you can check on the `Open on startup?` checkbox. This setting will allow the dashboard to automatically open when you launch the project in VS Code. It will only apply to the current project, not for all of them.