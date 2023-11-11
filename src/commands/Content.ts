import { commands, QuickPickItem, window } from 'vscode';
import { COMMAND_NAME, SETTING_TEMPLATES_ENABLED } from '../constants';
import { Settings } from '../helpers';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class Content {
  public static async create() {
    const templatesEnabled = await Settings.get(SETTING_TEMPLATES_ENABLED);
    if (!templatesEnabled) {
      commands.executeCommand(COMMAND_NAME.createByContentType);
      return;
    }

    const options: QuickPickItem[] = [
      {
        label: l10n.t(LocalizationKey.commandsContentOptionContentTypeLabel),
        description: l10n.t(LocalizationKey.commandsContentOptionContentTypeDescription)
      },
      {
        label: l10n.t(LocalizationKey.commandsContentOptionTemplateLabel),
        description: l10n.t(LocalizationKey.commandsContentOptionTemplateDescription)
      } as QuickPickItem
    ];

    const selectedOption = await window.showQuickPick(options, {
      title: l10n.t(LocalizationKey.commandsContentQuickPickTitle),
      placeHolder: l10n.t(LocalizationKey.commandsContentQuickPickPlaceholder),
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (selectedOption) {
      if (selectedOption.label === options[0].label) {
        commands.executeCommand(COMMAND_NAME.createByContentType);
      } else {
        commands.executeCommand(COMMAND_NAME.createByTemplate);
      }
    }

    return;
  }
}
