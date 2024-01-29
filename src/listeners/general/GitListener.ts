import {
  SETTING_GIT_SUBMODULE_BRANCH,
  SETTING_GIT_SUBMODULE_FOLDER,
  SETTING_GIT_SUBMODULE_PULL,
  SETTING_GIT_SUBMODULE_PUSH
} from './../../constants/settings';
import { Settings } from './../../helpers/SettingsHelper';
import { Dashboard } from '../../commands/Dashboard';
import { PanelProvider } from '../../panelWebView/PanelProvider';
import {
  ArticleHelper,
  Extension,
  Logger,
  Notifications,
  processTimePlaceholders,
  Telemetry
} from '../../helpers';
import { GeneralCommands } from './../../constants/GeneralCommands';
import simpleGit, { SimpleGit } from 'simple-git';
import {
  COMMAND_NAME,
  CONTEXT,
  SETTING_DATE_FORMAT,
  SETTING_GIT_COMMIT_MSG,
  SETTING_GIT_ENABLED,
  TelemetryEvent
} from '../../constants';
import { Folders } from '../../commands/Folders';
import { commands } from 'vscode';
import { PostMessageData } from '../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export class GitListener {
  private static isRegistered: boolean = false;
  private static client: SimpleGit | null = null;
  private static subClient: SimpleGit | null = null;

  /**
   * Initialize the listener
   */
  public static async init() {
    let isEnabled = false;
    const gitEnabled = Settings.get<boolean>(SETTING_GIT_ENABLED);
    if (gitEnabled) {
      const isRepo = await GitListener.isGitRepository();
      if (isRepo) {
        isEnabled = true;
      }
    }

    await commands.executeCommand('setContext', CONTEXT.isGitEnabled, isEnabled);

    if (!this.isRegistered) {
      const ext = Extension.getInstance();
      ext.subscriptions.push(commands.registerCommand(COMMAND_NAME.gitSync, GitListener.sync));

      this.isRegistered = true;
    }
  }

  /**
   * Process the messages
   * @param msg
   */
  public static process(msg: PostMessageData) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.gitSync:
        this.sync();
        break;
    }
  }

  /**
   * Run the sync
   */
  public static async sync() {
    try {
      this.sendMsg(GeneralCommands.toWebview.gitSyncingStart, {});

      Telemetry.send(TelemetryEvent.gitSync);

      await this.pull();
      await this.push();

      this.sendMsg(GeneralCommands.toWebview.gitSyncingEnd, {});
    } catch (e) {
      Logger.error((e as Error).message);
      this.sendMsg(GeneralCommands.toWebview.gitSyncingEnd, {});
    }
  }

  /**
   * Check if the current workspace is a git repository
   * @returns
   */
  public static async isGitRepository() {
    const git = this.getClient();
    if (!git) {
      return false;
    }

    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      Logger.warning(`Current workspace is not a GIT repository`);
    }

    return isRepo;
  }

  /**
   * Pull the changes from the remote
   * @returns
   */
  private static async pull() {
    const git = this.getClient();
    if (!git) {
      return;
    }

    const submoduleFolder = Settings.get<string>(SETTING_GIT_SUBMODULE_FOLDER);
    const submoduleBranch = Settings.get<string>(SETTING_GIT_SUBMODULE_BRANCH);
    const submodulePull = Settings.get<boolean>(SETTING_GIT_SUBMODULE_PULL);

    if (submoduleFolder) {
      const absFolderPath = Folders.getAbsFolderPath(submoduleFolder);
      const subGit = this.getClient(absFolderPath);
      if (subGit && submoduleBranch) {
        await subGit.checkout(submoduleBranch);
      }
    } else {
      if (submoduleBranch) {
        Logger.info(`Checking out the branch ${submoduleBranch} for submodules`);
        await git.subModule(['foreach', 'git', 'checkout', submoduleBranch]);
      }
    }

    if (submodulePull) {
      Logger.info(`Pulling from remote with submodules`);
      await git.subModule(['update', '--remote', '--merge']);
    }

    Logger.info(`Pulling from remote`);
    await git.pull();
  }

  /**
   * Push the changes to the remote
   * @returns
   */
  private static async push() {
    let commitMsg = Settings.get<string>(SETTING_GIT_COMMIT_MSG);

    if (commitMsg) {
      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      commitMsg = processTimePlaceholders(commitMsg, dateFormat);
      commitMsg = await ArticleHelper.processCustomPlaceholders(commitMsg, undefined, undefined);
    }

    const git = this.getClient();
    if (!git) {
      return;
    }

    const submoduleFolder = Settings.get<string>(SETTING_GIT_SUBMODULE_FOLDER);
    const submodulePush = Settings.get<boolean>(SETTING_GIT_SUBMODULE_PUSH);

    if (submoduleFolder) {
      const absFolderPath = Folders.getAbsFolderPath(submoduleFolder);
      const subGit = this.getClient(absFolderPath);
      if (subGit && submodulePush) {
        try {
          const status = await subGit.status();
          // Check if anything changed
          if (status.files.length > 0) {
            await subGit.raw(['add', '.', '-A']);
            await subGit.commit(commitMsg || 'Synced by Front Matter');
          }
          await subGit.push();
        } catch (e) {
          Notifications.errorWithOutput(
            l10n.t(LocalizationKey.listenersGeneralGitListenerPushError)
          );
          Logger.error((e as Error).message);
          return;
        }
      }
    } else {
      if (submodulePush) {
        Logger.info(`Pushing to remote with submodules`);

        try {
          const status = await git.subModule(['foreach', 'git', 'status', '--porcelain', '-u']);
          const lines = status.split('\n').filter((line) => line.trim() !== '');

          // First line is the submodule folder name
          if (lines.length > 1) {
            await git.subModule(['foreach', 'git', 'add', '.', '-A']);
            await git.subModule([
              'foreach',
              'git',
              'commit',
              '-m',
              commitMsg || 'Synced by Front Matter'
            ]);
            await git.subModule(['foreach', 'git', 'push']);
          }
        } catch (e) {
          Notifications.errorWithOutput(
            l10n.t(LocalizationKey.listenersGeneralGitListenerPushError)
          );
          Logger.error((e as Error).message);
          return;
        }
      }
    }

    Logger.info(`Pushing to remote`);

    const status = await git.status();

    if (status.files.length > 0) {
      await git.raw(['add', '.', '-A']);
      await git.commit(commitMsg || 'Synced by Front Matter');
    }

    await git.push();
  }

  /**
   * Get the git client
   * @param submoduleFolder
   * @returns
   */
  private static getClient(submoduleFolder: string = ''): SimpleGit | null {
    if (!submoduleFolder && this.client) {
      return this.client;
    } else if (submoduleFolder && this.subClient) {
      return this.subClient;
    }

    const wsFolder = Folders.getWorkspaceFolder();

    const options = {
      baseDir: submoduleFolder || wsFolder?.fsPath || '',
      binary: 'git',
      maxConcurrentProcesses: 6
    };

    if (submoduleFolder) {
      this.subClient = simpleGit(options);
      return this.subClient;
    } else {
      this.client = simpleGit(options);
      return this.client;
    }
  }

  /**
   * Send the message to the webview
   * @param command
   * @param payload
   */
  private static sendMsg(command: string, payload: any) {
    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelProvider.getInstance(extPath);

    panel.sendMessage({ command: command as any, payload });

    Dashboard.postWebviewMessage({ command: command as any, payload });
  }
}
