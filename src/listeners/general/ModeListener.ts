import { ModeSwitch } from './../../services/ModeSwitch';
import { CONTEXT, FEATURE_FLAG, GeneralCommands, SETTING_GLOBAL_MODES } from '../../constants';
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Mode } from '../../models';
import { CommandToCode } from "../../panelWebView/CommandToCode";
import { BaseListener } from "./BaseListener";
import { Settings } from "../../helpers";
import { commands } from 'vscode';


export class ModeListener extends BaseListener {

  /**
   * Process the messages
   * @param msg 
   */
  public static process(msg: { command: DashboardMessage | CommandToCode, data: any }) {
    super.process(msg as any);

    switch(msg.command) {
      case DashboardMessage.getMode:
      case CommandToCode.getMode:
        this.getMode();
        break;
    }
  }

  public static async getMode() {
    const modes = Settings.get<Mode[]>(SETTING_GLOBAL_MODES);
    if (!modes || modes.length === 0) {
      await this.resetEnablement();
      return;
    }

    const activeMode = ModeSwitch.getMode();
    if (activeMode) {
      const mode = modes.find(m => m.id === activeMode);
      this.sendMsg(GeneralCommands.setMode as any, mode);

      // Check the commands that need to be enabled/disabled
      const snippetsView = mode?.features.find(f => f === FEATURE_FLAG.dashboard.snippets.view);
      const dataView = mode?.features.find(f => f === FEATURE_FLAG.dashboard.data.view);

      await commands.executeCommand('setContext', CONTEXT.isSnippetsDashboardEnabled, !!snippetsView);
      await commands.executeCommand('setContext', CONTEXT.isDataDashboardEnabled, !!dataView);
    } else {
      this.sendMsg(GeneralCommands.setMode as any, undefined);

      // Enable dashboards
      await this.resetEnablement();
    }
  }

  /**
   * Check if the mode has the feature enabled
   * @param feature 
   * @returns 
   */
  public static async hasFeature(feature: string) {
    const modes = Settings.get<Mode[]>(SETTING_GLOBAL_MODES);
    
    if (!modes || modes.length === 0) {
      return true;
    }

    const activeMode = ModeSwitch.getMode();
    if (activeMode) {
      const mode = modes.find(m => m.id === activeMode);
      return mode?.features.find(f => f === feature);
    }

    return true;
  }

  /**
   * Reset the context
   */
  public static async resetEnablement() {
    await commands.executeCommand('setContext', CONTEXT.isSnippetsDashboardEnabled, true);
    await commands.executeCommand('setContext', CONTEXT.isDataDashboardEnabled, true);
  }
}