import { workspace, Uri } from "vscode";
import { CONFIG_KEY, SETTING_TEMPLATES_FOLDER } from "../constants";
import { join } from "path";
import * as fs from "fs";
import { Notifications } from "../helpers/Notifications";

export class Project {

  private static content = `---
title: "{{name}}"
slug: "/{{kebabCase name}}/"
description:
author: 
date: 2019-08-22T15:20:28.000Z
lastmod: 2019-08-22T15:20:28.000Z
draft: true
tags: []
categories: []
---
`;

  /**
   * Initialize a new "Project" instance.
   */
  public static async init() {
    try {
      const config = workspace.getConfiguration(CONFIG_KEY);
      const folder = config.get<string>(SETTING_TEMPLATES_FOLDER);

      const workspaceFolders = workspace.workspaceFolders;

      if (!folder || !workspaceFolders || workspaceFolders.length === 0) {
        return;
      }
      
      const workspaceFolder = workspaceFolders[0];
      const templatePath = Uri.file(join(workspaceFolder.uri.fsPath, folder));
      const article = Uri.file(join(templatePath.fsPath, "article.md"));

      await workspace.fs.createDirectory(templatePath);

      fs.writeFileSync(article.fsPath, Project.content, { encoding: "utf-8" });

      Notifications.info("Project initialized successfully.");
    } catch (err) {
      Notifications.error(`Sorry, something went wrong - ${err?.message || err}`);
    }
  }
}