import { workspace, window, ThemeIcon, TerminalOptions } from 'vscode';
import { Folders } from '../commands';
import { LocalizationKey, localize } from '../localization';
import { getShellPath } from '../utils';

export class Terminal {
  public static readonly terminalName: string = 'Local server';

  /**
   * Return the shell path for the current platform
   */
  public static get shell() {
    const shell: string | { path: string } | undefined = getShellPath();
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
        message: localize(
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
}
