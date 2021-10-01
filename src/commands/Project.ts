import { workspace, Uri } from "vscode";
import { join } from "path";
import * as fs from "fs";
import { Notifications } from "../helpers/Notifications";
import { Template } from "./Template";
import { Folders } from "./Folders";
import { Settings } from "../helpers";

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
  public static async init(sampleTemplate: boolean = true) {
    try {
      Settings.createTeamSettings();

      const folder = Template.getSettings();
      const templatePath = Project.templatePath();

      if (!folder || !templatePath) {
        return;
      }
      
      const article = Uri.file(join(templatePath.fsPath, "article.md"));

      if (!fs.existsSync(templatePath.fsPath)) {
        await workspace.fs.createDirectory(templatePath);
      }

      if (sampleTemplate) {
        fs.writeFileSync(article.fsPath, Project.content, { encoding: "utf-8" });
        Notifications.info("Project initialized successfully.");
      }
    } catch (err: any) {
      Notifications.error(`Sorry, something went wrong - ${err?.message || err}`);
    }
  }

  /**
   * Get the template path for the current project
   */
  public static templatePath() {
    const folder = Template.getSettings();
    const wsFolder = Folders.getWorkspaceFolder();

    if (!folder || !wsFolder) {
      return null;
    }

    const templatePath = Uri.file(join(wsFolder.fsPath, folder));
    return templatePath;
  }
}