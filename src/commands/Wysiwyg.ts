import { commands, window, Selection } from "vscode";
import { COMMAND_NAME, CONTEXT, SETTINGS_CONTENT_WYSIWYG } from "../constants";
import { Settings } from "../helpers";

enum MarkupType {
  bold = 1,
  italic,
  strikethrough,
  code,
  codeblock
}

export class Wysiwyg {

  /**
   * Registers the markup commands for the WYSIWYG controls
   * @param subscriptions 
   * @returns 
   */
  public static async registerCommands(subscriptions: any) {

    const wysiwygEnabled = Settings.get(SETTINGS_CONTENT_WYSIWYG);

    if (!wysiwygEnabled) {
      return;
    }

    await commands.executeCommand('setContext', CONTEXT.wysiwyg, true);

    subscriptions.push(commands.registerCommand(COMMAND_NAME.bold, () => this.addMarkup(MarkupType.bold)));
    subscriptions.push(commands.registerCommand(COMMAND_NAME.italic, () => this.addMarkup(MarkupType.italic)));
    subscriptions.push(commands.registerCommand(COMMAND_NAME.strikethrough, () => this.addMarkup(MarkupType.strikethrough)));
    subscriptions.push(commands.registerCommand(COMMAND_NAME.code, () => this.addMarkup(MarkupType.code)));
    subscriptions.push(commands.registerCommand(COMMAND_NAME.codeblock, () => this.addMarkup(MarkupType.codeblock)));
  }

  /**
   * Add the markup to the content
   * @param type 
   * @returns 
   */
  private static async addMarkup(type: MarkupType) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const hasTextSelection = !selection.isEmpty;

    const markers = this.getMarkers(type);
    if (!markers) {
      return;
    }

    const crntSelection = selection.active;

    if (hasTextSelection) {
      // Replace the selection and surround with the markup
      const selectionText = editor.document.getText(selection);
      
      editor.edit(builder => {
        builder.replace(selection, markers + selectionText + markers);
      });
    } else {
      // Insert the markers where cursor is located.
      let newPosition = crntSelection.with(crntSelection.line, crntSelection.character + markers.length);

      await editor.edit(builder => {
        builder.insert(newPosition, markers + this.lineBreak(type) + markers)
      });

      if (type === MarkupType.codeblock) {
        newPosition = crntSelection.with(crntSelection.line + 1, 0);
      }

      editor.selection = new Selection(newPosition, newPosition);
    }
  }

  /**
   * Check if linebreak needs to be added
   * @param type 
   * @returns 
   */
  private static lineBreak(type: MarkupType) {
    if (type === MarkupType.codeblock) {
      return `\n\n`;
    }
    return "";
  }

  /**
   * Retrieve the type of markers
   * @param type 
   * @returns 
   */
  private static getMarkers(type: MarkupType) {
    switch(type) {
      case MarkupType.bold:
        return `**`;
      case MarkupType.italic:
        return `*`;
      case MarkupType.strikethrough:
        return `~~`;
      case MarkupType.code:
        return "`";
      case MarkupType.codeblock:
        return "```";
      default:
        return;
    }
  }
}