import { Settings } from './../../helpers/SettingsHelper';
import { Dashboard } from '../../commands/Dashboard';
import { ExplorerView } from '../../explorerView/ExplorerView';
import { ArticleHelper, Extension, Logger, processKnownPlaceholders, Telemetry } from '../../helpers';
import { GeneralCommands } from './../../constants/GeneralCommands';
import simpleGit, { SimpleGit } from 'simple-git';
import { COMMAND_NAME, CONTEXT, SETTING_DATE_FORMAT, SETTING_GIT_COMMIT_MSG, SETTING_GIT_ENABLED, TelemetryEvent } from '../../constants';
import { Folders } from '../../commands/Folders';
import { commands } from 'vscode';

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
      ext.subscriptions.push(
        commands.registerCommand(COMMAND_NAME.gitSync, GitListener.sync)
      );

      this.isRegistered = true;
    }
  }

  /**
   * Process the messages
   * @param msg 
   */
  public static process(msg: { command: string, data: any }) {
    switch(msg.command) {
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

  private static async pull() {
    const git = this.getClient();
    if (!git) {
      return;
    }

    Logger.info(`Pulling from remote`);
    await git.pull();
  }

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

    Logger.info(`Pushing to remote`);

    const status = await git.status();

    for (const file of status.not_added) {
      await git.add(file);
    }
    for (const file of status.modified) {
      await git.add(file);
    }

    await git.commit(commitMsg || "Synced by Front Matter")

    await git.push();
  }

  private static getClient() {
    if (this.client) {
      return this.client;
    }

    const wsFolder = Folders.getWorkspaceFolder();

    const options = {
      baseDir: wsFolder?.fsPath || "",
      binary: 'git',
      maxConcurrentProcesses: 6,
    }

    this.client = simpleGit(options);
    return this.client;
  }

  private static sendMsg(command: string, data: any) {

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({ command: command as any, data });

    Dashboard.postWebviewMessage({ command: command as any, data });
  }
}