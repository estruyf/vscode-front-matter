---
title: Custom actions
slug: custom-actions
description: 
date: '2021-08-30T16:13:00.546Z'
lastmod: '2021-08-30T16:13:01.763Z'
weight: 5
---

# Custom actions

## Overview

Not every website is the same. That is why we want to give you the ability to extend Front Matter and you can do this by adding your custom actions to the Front Matter panel. A custom action is nothing more than a Node.js script which is referenced from within your project.

![Custom action](/assets/custom-action.png)

> **Sample**: [Generate open graph preview image in Code with Front Matter](https://www.eliostruyf.com/generate-open-graph-preview-image-code-front-matter/)

## Creating a script

Create a folder in your project where you want to store all your custom scripts, and create a new JavaScript file. The sample content of this file looks like this:

```javascript
const arguments = process.argv;

if (arguments && arguments.length > 0) {
  const workspaceArg = arguments[2]; // The workspace path
  const fileArg = arguments[3]; // The file path
  const frontMatterArg = arguments[4]; // Front matter data

  console.log(`The content returned for your notification.`);
}
```

> **Info**: The sample script can be found here [sample-script.js](https://github.com/estruyf/vscode-front-matter/blob/HEAD/sample/script-sample.js)

The current workspace-, file-path, and front matter data will be passed as a arguments. Like you can see in the above sample script, you can fetch these argument values as follows:

- `arguments[2]`: The workspace path
- `arguments[3]`: The file path (Markdown file)
- `arguments[4]`: The front matter data as object

In order to use this functionality, you will need to configure the `frontMatter.custom.scripts` setting for your project as follows:

```json
{
  "frontMatter.custom.scripts": [{
    "title": "Generate social image",
    "script": "./scripts/social-img.js",
    "nodeBin": "~/.nvm/versions/node/v14.15.5/bin/node"
  }]
}
```

> **Important**: When the command execution would fail when it cannot find the node command. You are able to specify your path to the node app. Command execution might for instance fail when using `nvm`. You can use the `nodeBin` property to specify the path to your node executable. **This property is optional**.

Once a custom action has been configured, it will appear on the Front Matter panel. The output of the script will be passed as a notification in VS Code. This output allows you to copy the output, useful when you generate additional content.

![Custom action output](/assets/custom-action-output.png)
