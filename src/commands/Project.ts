import { Telemetry } from './../helpers/Telemetry';
import { workspace, Uri } from "vscode";
import { join } from "path";
import * as fs from "fs";
import { Notifications } from "../helpers/Notifications";
import { Template } from "./Template";
import { Folders } from "./Folders";
import { Logger, Settings } from "../helpers";
import { SETTING_CONTENT_DEFAULT_FILETYPE, TelemetryEvent } from "../constants";
import { SettingsListener } from '../listeners/dashboard';

export class Project {

  private static content = `---
title:
slug:
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
      const fileType = Settings.get<string>(SETTING_CONTENT_DEFAULT_FILETYPE);

      const folder = Template.getSettings();
      const templatePath = Project.templatePath();

      if (!folder || !templatePath) {
        return;
      }
      
      const article = Uri.file(join(templatePath.fsPath, `article.${fileType}`));

      if (!fs.existsSync(templatePath.fsPath)) {
        await workspace.fs.createDirectory(templatePath);
      }

      if (sampleTemplate) {
        fs.writeFileSync(article.fsPath, Project.content, { encoding: "utf-8" });
        Notifications.info("Project initialized successfully.");
      }

      Telemetry.send(TelemetryEvent.initialization)

      SettingsListener.getSettings();
    } catch (err: any) {
      Logger.error(`Project::init: ${err?.message || err}`);
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