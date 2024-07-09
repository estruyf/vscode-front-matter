import { commands, Uri, window } from 'vscode';
import { EXTENSION_COMMAND_PREFIX } from '../constants';

export class UriHandler {
  /**
   * Register the URI handler
   */
  public static register() {
    window.registerUriHandler({
      handleUri(uri: Uri) {
        const queryParams = new URLSearchParams(uri.query);
        if (!queryParams.has('command')) {
          return;
        }

        const command = queryParams.get('command');
        let args = queryParams.get('args');

        if (!command || !command.startsWith(EXTENSION_COMMAND_PREFIX)) {
          return;
        }

        if (args) {
          try {
            args = JSON.parse(args);
          } catch (error) {
            // Ignore error
          }
        }

        commands.executeCommand(command, args);
      }
    });
  }
}
