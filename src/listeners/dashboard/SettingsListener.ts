import { join } from 'path';
import { commands, FileType, Uri, workspace, window, ProgressLocation } from 'vscode';
import { Folders } from '../../commands/Folders';
import {
  COMMAND_NAME,
  ExtensionState,
  GeneralCommands,
  SETTING_CONTENT_STATIC_FOLDER,
  SETTING_FRAMEWORK_ID,
  SETTING_PREVIEW_HOST
} from '../../constants';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { DashboardSettings, Extension, Notifications, Settings } from '../../helpers';
import { FrameworkDetector } from '../../helpers/FrameworkDetector';
import { Framework, Template, PostMessageData, StaticFolder, LoadingType } from '../../models';
import { BaseListener } from './BaseListener';
import { Cache } from '../../commands/Cache';
import { Preview } from '../../commands';
import { GitListener } from '../general';
import { DataListener } from '../panel';
import { MarkdownFoldingProvider } from '../../providers/MarkdownFoldingProvider';
import { ModeSwitch } from '../../services/ModeSwitch';
import { PagesListener } from './PagesListener';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import download from 'github-directory-downloader/esm';

export class SettingsListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static async process(msg: PostMessageData) {
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
      case DashboardMessage.getSettings:
        this.getConfigSettings(msg);
        break;
      case DashboardMessage.setSettings:
        this.setConfigSettings(msg);
        break;
      case GeneralCommands.toVSCode.secrets.get:
        this.getSecretValue(msg.command, msg.payload, msg.requestId);
        break;
      case GeneralCommands.toVSCode.secrets.set:
        this.setSecretValue(msg.command, msg.payload, msg.requestId);
        break;
    }
  }

  /**
   * Retrieves the configuration settings based on the provided payload.
   * @param command - The command to execute.
   * @param requestId - The ID of the request.
   * @param payload - The payload containing the settings to retrieve.
   */
  public static async getConfigSettings({ command, requestId, payload }: PostMessageData) {
    if (!command || !requestId || !payload) {
      return;
    }

    const settings = [];

    for (const setting of payload) {
      const value = Settings.get(setting);
      settings.push({ name: setting, value });
    }

    this.sendRequest(command as any, requestId, settings);
  }

  public static async setConfigSettings({ command, requestId, payload }: PostMessageData) {
    if (!command || !requestId || !payload) {
      return;
    }

    for (const setting of payload) {
      if (typeof setting.name !== 'undefined' && typeof setting.value !== 'undefined') {
        const value = Settings.get(setting.name);
        if (value !== setting.value) {
          await Settings.update(setting.name, setting.value, true);
        }
      }
    }

    this.sendRequest(command as any, requestId, true);
  }

  /**
   * Switches the current project to the specified project.
   * @param project - The name of the project to switch to.
   */
  public static async switchProject(project: string) {
    if (project) {
      this.sendMsg(DashboardCommand.loading, 'loading' as LoadingType);
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
   * Retrieves the secret value for a given command and value.
   * @param command - The command to retrieve the secret value for.
   * @param key - The key associated with the secret.
   * @param requestId - Optional. The ID of the request.
   * @returns A Promise that resolves to the secret value.
   */
  private static async getSecretValue(command: string, key: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    const extension = Extension.getInstance();
    const value = await extension.getSecret(key);

    this.sendRequest(command as any, requestId, value);
  }

  /**
   * Sets the secret value for a given key.
   * @param command - The command to execute.
   * @param key - The key for the secret value.
   * @param value - The secret value to set.
   * @param requestId - Optional. The request ID.
   */
  private static async setSecretValue(
    command: string,
    { key, value }: { key: string; value: string },
    requestId?: string
  ) {
    if (!command || !requestId || !key) {
      return;
    }

    const extension = Extension.getInstance();
    await extension.setSecret(key, value || '');

    Notifications.info(
      l10n.t(LocalizationKey.listenersDashboardSettingsListenerSetSecretValueMessage)
    );

    this.sendRequest(command as any, requestId, true);
  }

  /**
   * Update a setting from the dashboard
   * @param data
   */
  private static async update(data: { name: string; value: any; global?: boolean }) {
    if (data.name) {
      await Settings.update(data.name, data.value, data.global);
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
  private static async triggerTemplate(requestId?: string, template?: Template) {
    if (template && template.url) {
      const wsFolder = Folders.getWorkspaceFolder();

      if (!wsFolder) {
        return;
      }

      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: l10n.t(
            LocalizationKey.listenersDashboardSettingsListenerTriggerTemplateProgressTitle
          ),
          cancellable: false
        },
        async (progress) => {
          try {
            const ghFolder = await download(template.url, wsFolder.fsPath);

            if (!ghFolder.downloaded) {
              Notifications.error(
                l10n.t(
                  LocalizationKey.listenersDashboardSettingsListenerTriggerTemplateDownloadError
                )
              );
              return;
            }

            await Settings.init();
            await SettingsListener.getSettings(true);
            if (requestId) {
              this.sendRequest(DashboardMessage.triggerTemplate as any, requestId, true);

              Notifications.info(
                l10n.t(
                  LocalizationKey.listenersDashboardSettingsListenerTriggerTemplateNotification
                )
              );
            }
          } catch (e) {
            Notifications.error(
              l10n.t(LocalizationKey.listenersDashboardSettingsListenerTriggerTemplateInitError)
            );
          }
        }
      );
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
