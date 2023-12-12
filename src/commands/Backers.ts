import { authentication, commands, ExtensionContext } from 'vscode';
import { COMMAND_NAME, CONTEXT } from '../constants';
import { Extension, Logger } from '../helpers';
import fetch from 'node-fetch';
import { Dashboard } from './Dashboard';
import { SettingsListener } from '../listeners/panel';
import { PanelProvider } from '../panelWebView/PanelProvider';

export class Backers {
  public static async init(context: ExtensionContext) {
    Backers.checkSponsor();

    context.subscriptions.push(
      commands.registerCommand(COMMAND_NAME.authenticate, async () => {
        await authentication.getSession('github', ['read:user'], { createIfNone: true });
        Backers.checkSponsor();
      })
    );
  }

  public static async checkSponsor() {
    const ext = Extension.getInstance();
    const githubAuth = await authentication.getSession('github', ['read:user'], { silent: true });
    if (githubAuth && githubAuth.accessToken) {
      try {
        const isBeta = ext.isBetaVersion();
        const response = await fetch(
          `https://${isBeta ? `beta.` : ``}frontmatter.codes/api/v2/backers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json'
            },
            body: JSON.stringify({
              token: githubAuth.accessToken
            })
          }
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
      } catch (e) {
        Logger.error(`Failed to check if user is a sponsor: ${(e as Error).message}`);
      }
    } else {
      ext.setState(CONTEXT.backer, undefined, 'global');
    }
  }
}
