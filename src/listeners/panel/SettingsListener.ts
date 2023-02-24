import { commands, workspace } from 'vscode';
import {
  EXTENSION_BETA_ID,
  EXTENSION_ID,
  SETTING_CONTENT_FRONTMATTER_HIGHLIGHT,
  SETTING_FRAMEWORK_START,
  SETTING_AUTO_UPDATE_DATE,
  SETTING_PREVIEW_HOST
} from '../../constants';
import { Extension, Settings } from '../../helpers';
import { PanelSettings } from '../../helpers/PanelSettings';
import { PostMessageData } from '../../models';
import { Command } from '../../panelWebView/Command';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';

export class SettingsListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.getData:
        this.getSettings();
        break;
      case CommandToCode.openSettings:
        this.openVSCodeSettings();
        break;
      case CommandToCode.toggleWritingSettings:
        this.toggleWritingSettings();
        break;
      case CommandToCode.updateModifiedUpdating:
        this.updateSetting(SETTING_AUTO_UPDATE_DATE, msg.payload || false);
        break;
      case CommandToCode.updateFmHighlight:
        this.updateSetting(
          SETTING_CONTENT_FRONTMATTER_HIGHLIGHT,
          msg.payload !== null && msg.payload !== undefined ? msg.payload : false
        );
        break;
      case CommandToCode.updatePreviewUrl:
        this.updateSetting(SETTING_PREVIEW_HOST, msg.payload || '');
        break;
      case CommandToCode.updateStartCommand:
        this.updateSetting(SETTING_FRAMEWORK_START, msg.payload || '');
        break;
    }
  }

  /**
   * Retrieve the extension settings required to render the panel
   */
  public static async getSettings() {
    const panelSettings = await PanelSettings.get();
    this.sendMsg(Command.settings, panelSettings);
  }

  /**
   * Open the settings view of VS Code
   */
  public static openVSCodeSettings() {
    const isBeta = Extension.getInstance().isBetaVersion();
    commands.executeCommand(
      'workbench.action.openSettings',
      `@ext:${isBeta ? EXTENSION_BETA_ID : EXTENSION_ID}`
    );
  }

  /**
   * Updates a setting and refreshes the retrieved settings
   * @param setting
   * @param value
   */
  private static async updateSetting(setting: string, value: any) {
    await Settings.update(setting, value);
    this.getSettings();
  }

  /**
   * Toggle the writing settings
   */
  private static async toggleWritingSettings() {
    const config = workspace.getConfiguration('', { languageId: 'markdown' });
    const enabled = PanelSettings.isWritingSettingsEnabled();

    await config.update('editor.fontSize', enabled ? undefined : 14, false, true);
    await config.update('editor.lineHeight', enabled ? undefined : 26, false, true);
    await config.update('editor.wordWrap', enabled ? undefined : 'wordWrapColumn', false, true);
    await config.update('editor.wordWrapColumn', enabled ? undefined : 64, false, true);
    await config.update('editor.lineNumbers', enabled ? undefined : 'off', false, true);
    await config.update('editor.quickSuggestions', enabled ? undefined : false, false, true);
    await config.update('editor.minimap.enabled', enabled ? undefined : false, false, true);

    this.getSettings();
  }
}
