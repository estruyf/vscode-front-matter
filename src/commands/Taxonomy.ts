import { commands } from 'vscode';
import { COMMAND_NAME } from '../constants';
import { TagType } from '../panelWebView/TagType';
import { PanelProvider } from '../panelWebView/PanelProvider';

export class Taxonomy {
  /**
   * Registers the commands for the Article class.
   *
   * @param subscriptions - The array of subscriptions to register the commands with.
   */
  public static async registerCommands(subscriptions: unknown[]) {
    const explorerSidebar = PanelProvider.getInstance();

    if (explorerSidebar) {
      subscriptions.push(
        commands.registerCommand(COMMAND_NAME.insertTags, async () => {
          await commands.executeCommand('workbench.view.extension.frontmatter-explorer');
          await commands.executeCommand('workbench.action.focusSideBar');
          explorerSidebar.triggerInputFocus(TagType.tags);
        })
      );

      subscriptions.push(
        commands.registerCommand(COMMAND_NAME.insertCategories, async () => {
          await commands.executeCommand('workbench.view.extension.frontmatter-explorer');
          await commands.executeCommand('workbench.action.focusSideBar');
          explorerSidebar.triggerInputFocus(TagType.categories);
        })
      );
    }
  }
}
