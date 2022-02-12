import { SETTINGS_CONTENT_STATIC_FOLDER, SETTINGS_FRAMEWORK_ID } from "../../constants";
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
    }
  }

  /**
   * Update a setting from the dashboard
   * @param data 
   */
  private static async update(data: { name: string, value: any }) {
    if (data.name) {
      await Settings.update(data.name, data.value);
      this.getSettings();
    }
  }

  /**
   * Retrieve the settings for the dashboard
   */
  public static async getSettings() {
    const settings = await DashboardSettings.get();
    
    this.sendMsg(DashboardCommand.settings, settings);
  }

  /**
   * Set the current site-generator or framework + related settings
   * @param frameworkId 
   */
  private static setFramework(frameworkId: string | null) {
    Settings.update(SETTINGS_FRAMEWORK_ID, frameworkId, true);

    if (frameworkId) {
      const allFrameworks = FrameworkDetector.getAll();
      const framework = allFrameworks.find((f: Framework) => f.name === frameworkId);
      if (framework) {
        Settings.update(SETTINGS_CONTENT_STATIC_FOLDER, framework.static, true);
      } else {
        Settings.update(SETTINGS_CONTENT_STATIC_FOLDER, "", true);
      }
    }
  }
}