import { commands, QuickPickItem, window } from 'vscode'; 
import { COMMAND_NAME } from '../constants';

export class Content {

  public static async create() {

    const options: QuickPickItem[] = [{
      label: "Create content by content type",
      description: "Select if you want to create new content by the available content type(s)"
    }, {
      label: "Create content by template",
      description: "Select if you want to create new content by the available template(s)"
    } as QuickPickItem];

    const selectedOption = await window.showQuickPick(options, {
      placeHolder: `Select how you want to create your new content`,
      canPickMany: false
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