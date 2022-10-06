import { join } from "path";
import { commands, Uri } from "vscode";
import { Folders } from "../../commands/Folders";
import { COMMAND_NAME, SETTING_CONTENT_STATIC_FOLDER, SETTING_FRAMEWORK_ID } from "../../constants";
import { DashboardCommand } from "../../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { DashboardSettings, Settings } from "../../helpers";
import { FrameworkDetector } from "../../helpers/FrameworkDetector";
import { Framework } from "../../models";
import { BaseListener } from "./BaseListener";


export class SettingsListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.getData:
        this.getSettings();
        break;
      case DashboardMessage.updateSetting:
        this.update(msg.data);
        break;
      case DashboardMessage.setFramework:
        this.setFramework(msg?.data);
        break;
      case DashboardMessage.addFolder:
        this.addFolder(msg?.data);
        break;
    }
  }

  /**
   * Update a setting from the dashboard
   * @param data 
   */
  private static async update(data: { name: string, value: any }) {
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
    Settings.update(SETTING_FRAMEWORK_ID, frameworkId, true);

    if (frameworkId) {
      const allFrameworks = FrameworkDetector.getAll();
      const framework = allFrameworks.find((f: Framework) => f.name === frameworkId);
      if (framework) {
        Settings.update(SETTING_CONTENT_STATIC_FOLDER, framework.static, true);

        await FrameworkDetector.checkDefaultSettings(framework);
      } else {
        Settings.update(SETTING_CONTENT_STATIC_FOLDER, "", true);
      }
    }

    SettingsListener.getSettings(true);
  }

  private static addFolder(folder: string) {
    if (folder) {
      const wsFolder = Folders.getWorkspaceFolder();
      const folderUri = Uri.file(join(wsFolder?.fsPath || "", folder));
      commands.executeCommand(COMMAND_NAME.registerFolder, folderUri);
    }
  }
}