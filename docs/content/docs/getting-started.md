---
title: Getting started
slug: getting-started
description: 
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-08-30T16:13:01.763Z'
weight: 2
---

# Getting started

## Overview

To get you started, you first need to install the extension in Visual Studio Code. 

## Installation

You can get the extension via:

- The VS Code marketplace: [VS Code Marketplace - Front Matter](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter).
- The extension CLI: `ext install eliostruyf.vscode-front-matter`
- Or by clicking on the following link: <a href="" title="open extension in VS Code" data-vscode="vscode:extension/eliostruyf.vscode-front-matter">open extension in VS Code</a>

### Beta version

If you have the courage to test out the beta features, we made available a beta version as well. You can install this via:

- The VS Code marketplace: [VS Code Marketplace - Front Matter BETA](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter-beta).
- The extension CLI: `ext install eliostruyf.vscode-front-matter-beta`
- Or by clicking on the following link: <a href="" title="open extension in VS Code" data-vscode="vscode:extension/eliostruyf.vscode-front-matter-beta">open extension in VS Code</a>

> **Info**: The BETA docs can be found on [beta.frontmatter.codes](https://beta.frontmatter.codes).

## Welcome screen

Once installed, Front Matter will open the **welcome screen** the first time Visual Studio Code gets reloaded.

![Welcome screen](/assets/welcome-progress.png)

It also supports light themes:

![Welcome screen](/assets/welcome-light.png)

> **Info**: The welcome screen will also be shown when Front Matter is not yet fully configured.

## Required configuration

On the welcome screen, there are two tasks to complete before you can take full advantage of Front Matter. 

### Step 1: Initialize the project

In this step, a `.templates` folder and `article.md` file template will be created in the current project.

The `.templates` folder, is a folder that can be used to place all sort of Markdown templates. It will be used when you want to let Front Matter generate new pages/articles/...

### Step 2: Register content folder(s)

As Front Matter is **not** created to only support one static site generator, you will be able to specify where your Markdown content lives. From the moment you register a folder, it will be used on the dashboard to show an overview of all files.

You can register a folder by right-clicking on a folder name in the explorer panel from Visual Studio Code and selecting **Front Matter: Register folder**.

![Register a folder](/assets/register-folder.png)

## Enjoy using Front Matter