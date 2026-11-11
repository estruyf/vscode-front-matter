import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';
import {
  Range,
  Selection,
  TextEditorRevealType,
  Uri,
  commands,
  env as vscodeEnv,
  window
} from 'vscode';
import * as os from 'os';
import { exec } from 'child_process';
import { Folders } from '../../commands/Folders';
import { COMMAND_NAME } from '../../constants';
import { openFileInEditor } from '../../helpers';
import { PostMessageData } from '../../models';

export class ExtensionListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.openFile:
        this.openFile();
        break;
      case CommandToCode.openProject:
        this.openFolder();
        break;
      case CommandToCode.openInEditor:
        openFileInEditor(msg.payload);
        break;
      case CommandToCode.initProject:
        this.initialize();
        break;
      case CommandToCode.toggleCenterMode:
        commands.executeCommand(`workbench.action.toggleCenteredLayout`);
        break;
      case CommandToCode.openPreview:
        commands.executeCommand(COMMAND_NAME.preview);
        break;
      case CommandToCode.openDashboard:
        commands.executeCommand(COMMAND_NAME.dashboard);
        break;
      case CommandToCode.selectInDocument:
        ExtensionListener.selectLinkInDocument(msg.payload);
        break;
    }
  }

  /**
   * Find the given link URL in the active editor and select it.
   * Searches for markdown link syntax `[text](url)` as well as bare `url` occurrences.
   */
  private static selectLinkInDocument(url: string) {
    const editor = window.activeTextEditor;
    if (!editor || !url) {
      return;
    }

    const text = editor.document.getText();

    // Primary: match full markdown link [text](url)
    const markdownPattern = new RegExp(
      `\\[[^\\]]*\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`,
      'g'
    );
    const mdMatch = markdownPattern.exec(text);

    if (mdMatch) {
      const start = editor.document.positionAt(mdMatch.index);
      const end = editor.document.positionAt(mdMatch.index + mdMatch[0].length);
      editor.selection = new Selection(start, end);
      editor.revealRange(new Range(start, end), TextEditorRevealType.InCenter);
      return;
    }

    // Fallback: select just the URL wherever it appears
    const idx = text.indexOf(url);
    if (idx !== -1) {
      const start = editor.document.positionAt(idx);
      const end = editor.document.positionAt(idx + url.length);
      editor.selection = new Selection(start, end);
      editor.revealRange(new Range(start, end), TextEditorRevealType.InCenter);
    }
  }

  /**
   * Initialize project
   */
  private static async initialize() {
    await commands.executeCommand(COMMAND_NAME.dashboard);
  }

  /**
   * Open the file in your explorer
   */
  private static openFile() {
    if (os.type() === 'Linux' && vscodeEnv.remoteName?.toLowerCase() === 'wsl') {
      commands.executeCommand('remote-wsl.revealInExplorer');
    } else {
      commands.executeCommand('revealFileInOS');
    }
  }

  /**
   * Opens the project folder
   */
  private static openFolder() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      if (os.type() === 'Linux' && vscodeEnv.remoteName?.toLowerCase() === 'wsl') {
        exec('explorer.exe `wslpath -w "$PWD"`');
      } else {
        // Let the OS open the folder, the path is never passed through a shell
        vscodeEnv.openExternal(Uri.file(wsFolder.fsPath));
      }
    }
  }
}
