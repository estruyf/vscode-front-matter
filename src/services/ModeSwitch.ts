import { ModeListener } from './../listeners/general/ModeListener';
import {
  EXTENSION_NAME,
  SETTING_GLOBAL_ACTIVE_MODE,
  SETTING_GLOBAL_MODES
} from './../constants/settings';
import { commands, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { Settings } from '../helpers/SettingsHelper';
import { COMMAND_NAME, CONTEXT } from '../constants';
import { Mode } from '../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class ModeSwitch {
  private static isInit = false;
  private static statusBarElm: StatusBarItem;
  private static currentMode: string;

  public static register() {
    if (!ModeSwitch.statusBarElm) {
      ModeSwitch.statusBarElm = window.createStatusBarItem(StatusBarAlignment.Left, 100);
      ModeSwitch.statusBarElm.tooltip = 'Switch between the different modes of Front Matter';
      ModeSwitch.statusBarElm.command = COMMAND_NAME.modeSwitch;
    }

    if (!ModeSwitch.isInit) {
      commands.registerCommand(COMMAND_NAME.modeSwitch, ModeSwitch.switchMode);

      const mode = Settings.get<string | null>(SETTING_GLOBAL_ACTIVE_MODE);
      if (mode) {
        ModeSwitch.currentMode = mode;
      } else {
        ModeSwitch.currentMode = '';
      }

      ModeSwitch.isInit = true;
    }

    ModeListener.getMode();

    const modes = Settings.get<string | null>(SETTING_GLOBAL_MODES);
    if (!modes || modes.length === 0) {
      ModeSwitch.statusBarElm.hide();
      commands.executeCommand('setContext', CONTEXT.hasViewModes, false);
      return;
    }

    commands.executeCommand('setContext', CONTEXT.hasViewModes, true);
    ModeSwitch.setText();
  }

  public static getMode(): string {
    return ModeSwitch.currentMode;
  }

  private static async switchMode() {
    const modes = Settings.get<Mode[]>(SETTING_GLOBAL_MODES);
    if (!modes || modes.length === 0) {
      return;
    }

    const modePicks = ['Default', ...modes.map((m) => m.id)];

    const mode = await window.showQuickPick(modePicks, {
      title: l10n.t(LocalizationKey.servicesModeSwitchSwitchModeQuickPickTitle, EXTENSION_NAME),
      placeHolder: l10n.t(LocalizationKey.servicesModeSwitchSwitchModeQuickPickPlaceholder),
      ignoreFocusOut: true
    });

    if (mode) {
      ModeSwitch.currentMode = mode === 'Default' ? '' : mode;
      ModeSwitch.setText();

      ModeListener.getMode();
    }
  }

  private static setText() {
    ModeSwitch.statusBarElm.text = `$(preview) ${l10n.t(
      LocalizationKey.servicesModeSwitchSetTextMode,
      ModeSwitch.currentMode ? ModeSwitch.currentMode : 'Default'
    )}`;
    ModeSwitch.statusBarElm.show();
  }
}
