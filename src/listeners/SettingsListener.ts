import { Folders } from "../commands/Folders";
import { Template } from "../commands/Template";
import { ExtensionState, SETTINGS_CONTENT_DRAFT_FIELD, SETTINGS_CONTENT_SORTING, SETTINGS_CONTENT_SORTING_DEFAULT, SETTINGS_CONTENT_STATIC_FOLDER, SETTINGS_DASHBOARD_MEDIA_SNIPPET, SETTINGS_DASHBOARD_OPENONSTART, SETTINGS_FRAMEWORK_ID, SETTINGS_MEDIA_SORTING_DEFAULT, SETTING_CUSTOM_SCRIPTS, SETTING_TAXONOMY_CONTENT_TYPES } from "../constants";
import { DashboardCommand } from "../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { DashboardViewType, SortingOption } from "../dashboardWebView/models";
import { DashboardSettings, Settings } from "../helpers";
import { Extension } from "../helpers/Extension";
import { FrameworkDetector } from "../helpers/FrameworkDetector";
import { CustomScript, DraftField, ScriptType, SortingSetting, TaxonomyType } from "../models";
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
}