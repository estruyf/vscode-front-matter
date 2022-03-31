import { ModeListener } from './../listeners/general/ModeListener';
import { SETTING_GLOBAL_ACTIVE_MODE, SETTING_GLOBAL_MODES } from './../constants/settings';
import { commands, StatusBarAlignment, StatusBarItem, ThemeColor, window } from "vscode";
import { Settings } from "../helpers/SettingsHelper";
import { COMMAND_NAME } from '../constants';
import { Mode } from '../models';


export class ModeSwitch {
  private static isInit: boolean = false;
  private static statusBarElm: StatusBarItem;
  private static currentMode: string;
  
  public static register() {
    if (!ModeSwitch.statusBarElm) {
      ModeSwitch.statusBarElm = window.createStatusBarItem(StatusBarAlignment.Left, 100);
      ModeSwitch.statusBarElm.tooltip = "Switch between the different modes of Front Matter";
      ModeSwitch.statusBarElm.command = COMMAND_NAME.modeSwitch;
    }

    if (!ModeSwitch.isInit) {
      commands.registerCommand(COMMAND_NAME.modeSwitch, ModeSwitch.switchMode);

      const mode = Settings.get<string | null>(SETTING_GLOBAL_ACTIVE_MODE);
      if (mode) {
        ModeSwitch.currentMode = mode;
      } else {
        ModeSwitch.currentMode = "";
      }
      
      ModeSwitch.isInit = true;
    }

    const modes = Settings.get<string | null>(SETTING_GLOBAL_MODES);
    if (!modes || modes.length === 0) {
      ModeSwitch.statusBarElm.hide();
      return;
    }

    ModeSwitch.setText();
    ModeListener.getMode();
  }

  public static getMode(): string {
    return ModeSwitch.currentMode;
  }

  private static async switchMode() {
    const modes = Settings.get<Mode[]>(SETTING_GLOBAL_MODES);
    if (!modes || modes.length === 0) {
      return;
    }

    const modePicks = [
      "Default",
      ...modes.map(m => m.id)
    ]

    const mode = await window.showQuickPick(modePicks, {
      placeHolder: `Select the mode you want to use`,
      ignoreFocusOut: true,
      title: `Front Matter: Mode selection`
    });

    if (mode) {
      ModeSwitch.currentMode = mode === "Default" ? "" : mode;
      ModeSwitch.setText();

      ModeListener.getMode();
    }
  }

  private static setText() {
    ModeSwitch.statusBarElm.text = `$(preview) Mode: ${ModeSwitch.currentMode ? ModeSwitch.currentMode : "Default"}`;
    ModeSwitch.statusBarElm.show();
  }
}