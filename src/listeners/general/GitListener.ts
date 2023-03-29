import {
  SETTING_GIT_SUBMODULE_BRANCH,
  SETTING_GIT_SUBMODULE_PULL,
  SETTING_GIT_SUBMODULE_PUSH
} from './../../constants/settings';
import { Settings } from './../../helpers/SettingsHelper';
import { Dashboard } from '../../commands/Dashboard';
import { ExplorerView } from '../../explorerView/ExplorerView';
import {
  ArticleHelper,
  Extension,
  Logger,
  Notifications,
  processKnownPlaceholders,
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

export class GitListener {
  private static isRegistered: boolean = false;
  private static client: SimpleGit | null = null;

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

    const submoduleBranch = Settings.get<string>(SETTING_GIT_SUBMODULE_BRANCH);
    const submodulePull = Settings.get<boolean>(SETTING_GIT_SUBMODULE_PULL);

    if (submoduleBranch) {
      Logger.info(`Checking out the branch ${submoduleBranch} for submodules`);
      await git.subModule(['foreach', 'git', 'checkout', submoduleBranch]);
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
      commitMsg = processKnownPlaceholders(commitMsg, undefined, dateFormat);
      commitMsg = await ArticleHelper.processCustomPlaceholders(commitMsg, undefined, undefined);
    }

    const git = this.getClient();
    if (!git) {
      return;
    }

    const submodulePush = Settings.get<boolean>(SETTING_GIT_SUBMODULE_PUSH);

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
        Notifications.error(`Failed to push submodules. Please check the logs for more details.`);
        Logger.error((e as Error).message);
        return;
      }
    }

    Logger.info(`Pushing to remote`);

    const status = await git.status();

    for (const file of status.not_added) {
      await git.add(file);
    }
    for (const file of status.modified) {
      await git.add(file);
    }
    for (const file of status.deleted) {
      await git.add(file);
    }

    await git.commit(commitMsg || 'Synced by Front Matter');

    await git.push();
  }

  private static getClient() {
    if (this.client) {
      return this.client;
    }

    const wsFolder = Folders.getWorkspaceFolder();

    const options = {
      baseDir: wsFolder?.fsPath || '',
      binary: 'git',
      maxConcurrentProcesses: 6
    };

    this.client = simpleGit(options);
    return this.client;
  }

  private static sendMsg(command: string, payload: any) {
    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({ command: command as any, payload });

    Dashboard.postWebviewMessage({ command: command as any, payload });
  }
}
