import { DEFAULT_CONTENT_TYPE } from './../constants/ContentType';
import { Telemetry } from './../helpers/Telemetry';
import { workspace, Uri, commands, window } from 'vscode';
import { join } from 'path';
import { Notifications } from '../helpers/Notifications';
import { Template } from './Template';
import { Folders } from './Folders';
import {
  Extension,
  FrameworkDetector,
  Logger,
  MediaLibrary,
  Settings,
  TaxonomyHelper
} from '../helpers';
import {
  COMMAND_NAME,
  SETTING_CONTENT_DEFAULT_FILETYPE,
  SETTING_TAXONOMY_CONTENT_TYPES,
  TelemetryEvent
} from '../constants';
import { SettingsListener } from '../listeners/dashboard';
import { existsAsync, writeFileAsync } from '../utils';

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

  public static registerCommands() {
    const ext = Extension.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.switchProject, Project.switchProject));
  }

  public static isInitialized() {
    const hasProjectFile = Settings.hasProjectFile();
    // If it has a project file, initialize the media library
    if (hasProjectFile) {
      MediaLibrary.getInstance();
      TaxonomyHelper.initDb();
    }
    return hasProjectFile;
  }

  /**
   * Initialize a new "Project" instance.
   */
  public static async init(sampleTemplate?: boolean) {
    try {
      await Settings.createTeamSettings();

      // Add the default content type
      await Settings.update(SETTING_TAXONOMY_CONTENT_TYPES, [DEFAULT_CONTENT_TYPE], true);

      if (sampleTemplate !== undefined) {
        await Project.createSampleTemplate();
      } else {
        Notifications.info('Project initialized successfully.');
      }

      // Initialize the media library
      MediaLibrary.getInstance();

      // Initialize the taxonomy database
      TaxonomyHelper.initDb();

      Telemetry.send(TelemetryEvent.initialization);

      // Check if you can find the framework
      const wsFolder = Folders.getWorkspaceFolder();
      const framework = await FrameworkDetector.get(wsFolder?.fsPath || '');

      if (framework) {
        await SettingsListener.setFramework(framework.name);
      }

      SettingsListener.getSettings(true);
    } catch (error: unknown) {
      const err = error as Error;
      Logger.error(`Project::init: ${err?.message || err}`);
      Notifications.error(`Sorry, something went wrong - ${err?.message || err}`);
    }
  }

  public static async switchProject() {
    const projects = Settings.getProjects();
    const project = await window.showQuickPick(
      projects.map((p) => p.name),
      {
        canPickMany: false,
        ignoreFocusOut: true,
        title: 'Select a project to switch to'
      }
    );

    if (!project) {
      return;
    }

    SettingsListener.switchProject(project);
  }

  /**
   * Creates the templates folder + sample if needed
   * @param sampleTemplate
   * @returns
   */
  public static async createSampleTemplate(sampleTemplate?: boolean) {
    const fileType = Settings.get<string>(SETTING_CONTENT_DEFAULT_FILETYPE);

    const folder = Template.getSettings();
    const templatePath = Project.templatePath();

    if (!folder || !templatePath) {
      return;
    }

    const article = Uri.file(join(templatePath.fsPath, `article.${fileType}`));

    if (!(await existsAsync(templatePath.fsPath))) {
      await workspace.fs.createDirectory(templatePath);
    }

    if (sampleTemplate) {
      await writeFileAsync(article.fsPath, Project.content, {
        encoding: 'utf-8'
      });
      Notifications.info('Sample template created.');
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
