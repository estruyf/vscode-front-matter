import { join } from 'path';
import { commands, Uri } from 'vscode';
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
import { DashboardSettings, Extension, Settings } from '../../helpers';
import { FrameworkDetector } from '../../helpers/FrameworkDetector';
import { Framework, PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';
import { Cache } from '../../commands/Cache';
import { Preview } from '../../commands';
import { GitListener } from '../general';
import { DataListener } from '../panel';
import { MarkdownFoldingProvider } from '../../providers/MarkdownFoldingProvider';
import { ModeSwitch } from '../../services/ModeSwitch';
import { PagesListener } from './PagesListener';

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
        if (framework.static) {
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

  private static addFolder(folder: string) {
    if (folder) {
      const wsFolder = Folders.getWorkspaceFolder();
      const folderUri = Uri.file(join(wsFolder?.fsPath || '', folder));
      commands.executeCommand(COMMAND_NAME.registerFolder, folderUri);
    }
  }
}
