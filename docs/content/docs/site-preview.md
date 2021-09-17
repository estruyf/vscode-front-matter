---
title: Site preview
slug: site-preview
description: null
date: '2021-08-31T08:24:02.613Z'
lastmod: '2021-08-31T08:24:02.613Z'
weight: 6
---

# Site preview

## Overview

The Markdown preview is not consistently delivering the same result as the one you will see on your site. The Front Matter extension provides you a way to show the actual site instead. 

![Site preview](/assets/site-preview.png)

## Configuration

In order to use the site preview, you will first have to set the `frontMatter.preview.host` setting. You can set it via the `Global Settings` section in the Front Matter panel or in your `.vscode/settings.json` file. 

For example, with Hugo, the local server spins up on `http://localhost:1313`. When you set this URL as the value of the `frontMatter.preview.host` setting. You can click on the open preview button and the site preview will be shown.