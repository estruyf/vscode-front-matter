import { workspace, window, ThemeIcon, TerminalOptions } from 'vscode';
import * as os from 'os';
import { Folders } from '../commands';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

interface ShellSetting {
  path: string;
}

export class Terminal {
  public static readonly terminalName: string = 'Local server';

  /**
   * Return the shell path for the current platform
   */
  public static get shell() {
    const shell: string | { path: string } | undefined = Terminal.getShellPath();
    let shellPath: string | undefined = undefined;

    if (typeof shell !== 'string' && !!shell) {
      shellPath = shell.path;
    } else {
      shellPath = shell || undefined;
    }

    return shellPath;
  }

  /**
   * Open a new local server terminal
   */
  public static openLocalServerTerminal(command: string) {
    let localServerTerminal = Terminal.findLocalServerTerminal();
    if (localServerTerminal) {
      localServerTerminal.dispose();
    }

    if (!command) {
      return;
    }

    if (
      !localServerTerminal ||
      (localServerTerminal && localServerTerminal.state.isInteractedWith === true)
    ) {
      const terminalOptions: TerminalOptions = {
        name: Terminal.terminalName,
        iconPath: new ThemeIcon('server-environment'),
        message: l10n.t(
          LocalizationKey.servicesTerminalOpenLocalServerTerminalTerminalOptionMessage
        )
      };

      // Check if workspace
      if (workspace.workspaceFolders && workspace.workspaceFolders.length > 1) {
        const wsFolder = Folders.getWorkspaceFolder();
        if (wsFolder) {
          terminalOptions.cwd = wsFolder;
        }
      }

      localServerTerminal = window.createTerminal(terminalOptions);
    }

    if (localServerTerminal) {
      localServerTerminal.sendText(command);
      localServerTerminal.show(false);
    }
  }

  /**
   * Close local server terminal
   */
  public static closeLocalServerTerminal() {
    const localServerTerminal = Terminal.findLocalServerTerminal();
    if (localServerTerminal) {
      localServerTerminal.dispose();
    }
  }

  /**
   * Find the server terminal
   * @returns
   */
  public static findLocalServerTerminal() {
    const terminals = window.terminals;
    if (terminals) {
      const localServerTerminal = terminals.find((t) => t.name === Terminal.terminalName);
      return localServerTerminal;
    }
  }

  /**
   * Retrieve the automation profile for the current platform
   * @returns
   */
  private static getShellPath(): string | ShellSetting | undefined {
    const platform = Terminal.getPlatform();
    const terminalSettings = workspace.getConfiguration('terminal');

    const automationProfile = terminalSettings.get<string | ShellSetting>(
      `integrated.automationProfile.${platform}`
    );
    if (!!automationProfile) {
      return automationProfile;
    }

    const defaultProfile = terminalSettings.get<string>(`integrated.defaultProfile.${platform}`);
    const profiles = terminalSettings.get<{ [prop: string]: ShellSetting }>(
      `integrated.profiles.${platform}`
    );

    if (defaultProfile && profiles && profiles[defaultProfile]) {
      return profiles[defaultProfile];
    }

    return terminalSettings.get(`integrated.shell.${platform}`);
  }

  /**
   * Get the current platform
   * @returns
   */
  private static getPlatform = (): 'windows' | 'linux' | 'osx' => {
    const platform = os.platform();
    if (platform === 'win32') {
      return 'windows';
    } else if (platform === 'darwin') {
      return 'osx';
    }

    return 'linux';
  };
}
