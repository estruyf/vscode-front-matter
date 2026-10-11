---
title: "Why we moved our client sites to Astro"
description: "Four years of build pipelines, and the one change that made every site faster to edit and faster to load."
pubDate: 2026-09-18T09:00:00.000Z
heroImage: /images/astro-move.jpg
author: mara-lindqvist
category: Engineering
tags:
  - astro
  - performance
  - static-sites
featured: true
draft: false
---

Most of our client sites are marketing sites with a blog attached. For years they ran on a mix of server-rendered frameworks, each with its own build, its own plugins and its own way of breaking on a Friday.

## What we wanted

- Pages that are HTML by default, with JavaScript only where a component needs it.
- Content in Markdown, in the same repository as the code that renders it.
- A build that a new developer can run on their first morning.

## What changed for editors

Nothing they had to learn. The posts are still Markdown files with front matter at the top, and they still edit them in VS Code. The fields they fill in are the same fields the templates read.

## What changed for visitors

The median page on our three largest sites now ships under 60 KB of JavaScript, down from just over 400 KB.
