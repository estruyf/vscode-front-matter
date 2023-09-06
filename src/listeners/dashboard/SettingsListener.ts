import { join } from 'path';
import { commands, FileType, Uri, workspace } from 'vscode';
import { Folders } from '../../commands/Folders';
import {
  COMMAND_NAME,
  ExtensionState,
  SETTING_CONTENT_STATIC_FOLDER,
  SETTING_FRAMEWORK_ID,
  SETTING_PREVIEW_HOST
} from '../../constants';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { DashboardSettings, Extension, Notifications, Settings } from '../../helpers';
import { FrameworkDetector } from '../../helpers/FrameworkDetector';
import { Framework, FrameworkTemplate, PostMessageData, StaticFolder } from '../../models';
import { BaseListener } from './BaseListener';
import { Cache } from '../../commands/Cache';
import { Preview } from '../../commands';
import { GitListener } from '../general';
import { DataListener } from '../panel';
import { MarkdownFoldingProvider } from '../../providers/MarkdownFoldingProvider';
import { ModeSwitch } from '../../services/ModeSwitch';
import { PagesListener } from './PagesListener';
import { existsAsync } from '../../utils';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export class SettingsListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.getData:
        this.getSettings();
        break;
      case DashboardMessage.updateSetting:
        this.update(msg.payload);
        break;
      case DashboardMessage.setFramework:
        this.setFramework(msg?.payload);
        break;
      case DashboardMessage.addFolder:
        this.addFolder(msg?.payload);
        break;
      case DashboardMessage.addAssetsFolder:
        this.addAssetsFolder(msg?.payload);
        break;
      case DashboardMessage.triggerTemplate:
        this.triggerTemplate(msg?.requestId, msg?.payload);
        break;
      case DashboardMessage.switchProject:
        this.switchProject(msg.payload);
        break;
    }
  }

  public static async switchProject(project: string) {
    if (project) {
      this.sendMsg(DashboardCommand.loading, true);
      Settings.setProject(project);
      await Cache.clear(false);

      // Clear out the media folder
      await Extension.getInstance().setState<string | undefined>(
        ExtensionState.SelectedFolder,
        undefined,
        'workspace'
      );

      Preview.init();
      GitListener.init();

      SettingsListener.getSettings(true);
      DataListener.getFoldersAndFiles();
      MarkdownFoldingProvider.triggerHighlighting(true);
      ModeSwitch.register();

      // Update pages
      PagesListener.startWatchers();
      PagesListener.refresh();
    }
  }

  /**
   * Update a setting from the dashboard
   * @param data
   */
  private static async update(data: { name: string; value: any }) {
    if (data.name) {
      await Settings.update(data.name, data.value);
      this.getSettings(true);
    }
  }

  /**
   * Retrieve the settings for the dashboard
   */
  public static async getSettings(clear: boolean = false) {
    const settings = await DashboardSettings.get(clear);

    this.sendMsg(DashboardCommand.settings, settings);
  }

  /**
   * Set the current site-generator or framework + related settings
   * @param frameworkId
   */
  public static async setFramework(frameworkId: string | null) {
    await Settings.update(SETTING_FRAMEWORK_ID, frameworkId, true);

    if (frameworkId) {
      const allFrameworks = FrameworkDetector.getAll();
      const framework: Framework | undefined = allFrameworks.find(
        (f: Framework) => f.name === frameworkId
      );
      if (framework) {
        if (framework.static && typeof framework.static === 'string') {
          await Settings.update(SETTING_CONTENT_STATIC_FOLDER, framework.static, true);
        }

        if (framework.server) {
          await Settings.update(SETTING_PREVIEW_HOST, framework.server, true);
        }

        await FrameworkDetector.checkDefaultSettings(framework);
      } else {
        await Settings.update(SETTING_CONTENT_STATIC_FOLDER, '', true);
      }
    }

    SettingsListener.getSettings(true);
  }

  public static async addAssetsFolder(assetFolder: string | StaticFolder) {
    await Settings.update(SETTING_CONTENT_STATIC_FOLDER, assetFolder, true);
    SettingsListener.getSettings(true);
  }

  private static addFolder(folder: string) {
    if (folder) {
      const wsFolder = Folders.getWorkspaceFolder();
      const folderUri = Uri.file(join(wsFolder?.fsPath || '', folder));
      commands.executeCommand(COMMAND_NAME.registerFolder, folderUri);
    }
  }

  /**
   * Adds the template files to the workspace
   * @param template
   */
  private static async triggerTemplate(requestId?: string, template?: FrameworkTemplate) {
    if (template && template.template) {
      const templateFileLocation = join(
        Extension.getInstance().extensionPath.fsPath,
        'templates',
        template.template
      );

      if (await existsAsync(templateFileLocation)) {
        const allFiles = await workspace.fs.readDirectory(Uri.file(templateFileLocation));

        await this.copyTemplateFiles(allFiles, templateFileLocation);

        await Settings.init();
        await SettingsListener.getSettings(true);

        if (template.showDashboardOnComplete) {
          if (requestId) {
            this.sendRequest(DashboardMessage.triggerTemplate as any, requestId, true);
          }
        } else {
          Notifications.info(
            l10n.t(LocalizationKey.listenersDashboardSettingsListenerTriggerTemplateNotification)
          );
        }
      }
    }
  }

  /**
   * Copies all the template files to the workspace
   * @param files
   * @param templateFileLocation
   * @param extRelPath
   * @returns
   */
  private static async copyTemplateFiles(
    files: [string, FileType][],
    templateFileLocation: string,
    extRelPath: string = ''
  ) {
    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      return;
    }

    for (const file of files) {
      const crntFolderPath = join(extRelPath, file[0]);
      const extFilePath = join(templateFileLocation, crntFolderPath);

      if (file[1] === FileType.Directory) {
        const allFiles = await workspace.fs.readDirectory(Uri.file(extFilePath));

        const wsFolderPath = join(wsFolder.fsPath || '', crntFolderPath);
        await workspace.fs.createDirectory(Uri.file(wsFolderPath));

        await this.copyTemplateFiles(allFiles, templateFileLocation, crntFolderPath);
      } else {
        const wsFilePath = join(wsFolder.fsPath || '', crntFolderPath);
        await workspace.fs.copy(Uri.file(extFilePath), Uri.file(wsFilePath), {
          overwrite: true
        });
      }
    }
  }
}
