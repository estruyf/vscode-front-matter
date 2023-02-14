import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';
import { commands, env as vscodeEnv } from 'vscode';
import * as os from 'os';
import { exec } from 'child_process';
import { Folders } from '../../commands/Folders';
import { COMMAND_NAME } from '../../constants';
import { SettingsListener } from '.';
import { openFileInEditor } from '../../helpers';

export class ExtensionListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: { command: any; data: any }) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.openFile:
        this.openFile();
        break;
      case CommandToCode.openProject:
        this.openFolder();
        break;
      case CommandToCode.openInEditor:
        openFileInEditor(msg.data);
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
      const wsPath = wsFolder.fsPath;
      if (os.type() === 'Darwin') {
        exec(`open ${wsPath}`);
      } else if (os.type() === 'Windows_NT') {
        exec(`explorer ${wsPath}`);
      } else if (os.type() === 'Linux' && vscodeEnv.remoteName?.toLowerCase() === 'wsl') {
        exec('explorer.exe `wslpath -w "$PWD"`');
      } else {
        exec(`xdg-open ${wsPath}`);
      }
    }
  }
}
