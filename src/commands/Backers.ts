import { commands, ExtensionContext } from 'vscode';
import { COMMAND_NAME, CONTEXT } from '../constants';
import { Extension } from '../helpers';
import { Credentials } from '../services/Credentials';
import fetch from 'node-fetch';
import { Dashboard } from './Dashboard';
import { SettingsListener } from '../listeners/panel';
import { PanelProvider } from '../panelWebView/PanelProvider';

export class Backers {
  private static creds: Credentials | null = null;

  public static async init(context: ExtensionContext) {
    Backers.creds = new Credentials();
    await Backers.creds.initialize(context, Backers.tryUsernameCheck);

    Backers.tryUsernameCheck();

    context.subscriptions.push(
      commands.registerCommand(COMMAND_NAME.authenticate, async () => {
        Backers.tryUsernameCheck();
      })
    );
  }

  public static async tryUsernameCheck() {
    try {
      const username = await Backers.getUsername();
      Backers.validate(username || '');
    } catch (e) {
      Backers.validate('');
    }
  }

  public static async getUsername() {
    const octokit = await Backers.creds?.getOctokit();
    const user = await octokit?.users.getAuthenticated();

    if (user?.data?.login) {
      return user?.data?.login;
    }

    return;
  }

  public static async validate(username: string) {
    const ext = Extension.getInstance();

    if (!username) {
      ext.setState(CONTEXT.backer, undefined, 'global');
    }

    const isBeta = ext.isBetaVersion();

    const response = await fetch(
      `https://${isBeta ? `beta.` : ``}frontmatter.codes/api/backers?backer=${username}`
    );

    if (response.ok) {
      const prevData = await ext.getState<boolean>(CONTEXT.backer, 'global');
      await ext.setState(CONTEXT.backer, true, 'global');

      if (!prevData) {
        const PanelView = PanelProvider.getInstance();
        if (PanelView.visible) {
          SettingsListener.getSettings();
        }

        if (Dashboard.isOpen) {
          Dashboard.reload();
        }
      }
    } else {
      ext.setState(CONTEXT.backer, false, 'global');
    }
  }
}
