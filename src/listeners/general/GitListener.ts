import {
  SETTING_GIT_DISABLED_BRANCHES,
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
  parseWinPath,
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
import { Event, commands, extensions } from 'vscode';
import { GitAPIState, GitRepository, PostMessageData } from '../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export class GitListener {
  private static gitAPI: {
    onDidChangeState: Event<GitAPIState>;
    onDidOpenRepository: Event<GitRepository>;
    onDidCloseRepository: Event<GitRepository>;
    getAPI: (version: number) => any;
    repositories: GitRepository[];
  } | null = null;
  private static isRegistered: boolean = false;
  private static client: SimpleGit | null = null;
  private static subClient: SimpleGit | null = null;
  private static repository: GitRepository | null = null;

  public static async getSettings() {
    const gitActions = Settings.get<boolean>(SETTING_GIT_ENABLED);
    if (gitActions) {
      return {
        isGitRepo: gitActions ? await GitListener.isGitRepository() : false,
        actions: gitActions || false,
        disabledBranches: gitActions
          ? Settings.get<string[]>(SETTING_GIT_DISABLED_BRANCHES) || []
          : []
      };
    }

    return;
  }

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
      case GeneralCommands.toVSCode.git.sync:
        this.sync();
        break;
      case GeneralCommands.toVSCode.git.getBranch:
        this.getBranch(msg.command, msg.requestId);
        break;
      case GeneralCommands.toVSCode.git.selectBranch:
        this.selectBranch();
        break;
    }
  }

  public static async selectBranch() {
    const workspaceFolder = Folders.getWorkspaceFolder();
    await commands.executeCommand('git.checkout', workspaceFolder);
  }

  /**
   * Run the sync
   */
  public static async sync() {
    try {
      this.sendMsg(GeneralCommands.toWebview.git.syncingStart, {});

      Telemetry.send(TelemetryEvent.gitSync);

      await this.pull();
      await this.push();

      this.sendMsg(GeneralCommands.toWebview.git.syncingEnd, {});
    } catch (e) {
      Logger.error((e as Error).message);
      this.sendMsg(GeneralCommands.toWebview.git.syncingEnd, {});
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

    GitListener.vscodeGitProvider();

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
      commitMsg = processKnownPlaceholders(commitMsg, undefined, dateFormat);
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

  private static async vscodeGitProvider() {
    if (!GitListener.gitAPI) {
      const wsFolder = Folders.getWorkspaceFolder();
      const extension = extensions.getExtension('vscode.git');

      /**
       * Logic from: https://github.com/microsoft/vscode/blob/main/extensions/github/src/extension.ts
       * initializeGitExtension
       */
      if (wsFolder && extension) {
        const gitExtension = extension.isActive ? extension.exports : await extension.activate();

        // Get version 1 of the API
        GitListener.gitAPI = gitExtension.getAPI(1);

        if (!GitListener.gitAPI) {
          return;
        }

        GitListener.listenToRepo(GitListener.gitAPI?.repositories);

        GitListener.gitAPI.onDidChangeState(() => {
          GitListener.listenToRepo(GitListener.gitAPI?.repositories);
        });

        GitListener.gitAPI.onDidOpenRepository((repo: GitRepository) => {
          GitListener.triggerBranchChange(repo);
        });

        GitListener.gitAPI.onDidCloseRepository((repo: GitRepository) => {
          Logger.info(`Closed repo: ${repo?.state?.HEAD?.name}`);
        });
      }
    }
  }

  private static async getBranch(command: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    this.sendRequest(command, requestId, GitListener.repository?.state?.HEAD.name);
  }

  private static listenToRepo(repositories: GitRepository[] | undefined) {
    if (!repositories) {
      return;
    }

    if (repositories && repositories.length === 1) {
      GitListener.triggerBranchChange(repositories[0]);
    } else if (repositories && repositories.length > 1) {
      const wsFolder = Folders.getWorkspaceFolder();
      if (wsFolder) {
        const repo = repositories.find(
          (repo) => parseWinPath(repo.rootUri.fsPath) === parseWinPath(wsFolder.fsPath)
        );
        if (repo) {
          GitListener.triggerBranchChange(repo);
        }
      }
    }
  }

  /**
   * Trigger the branch change
   * @param repo
   */
  private static async triggerBranchChange(repo: GitRepository | null) {
    if (repo && repo.state) {
      if (repo.state.HEAD.name !== GitListener.repository?.state?.HEAD.name) {
        GitListener.repository = repo;
        let branches = [];

        if (repo.repository.getBranches) {
          const allBranches = await repo.repository.getBranches();
          if (allBranches && allBranches.length > 0) {
            branches = allBranches.map((branch: any) => branch.name);
          }
        }
        this.sendMsg(GeneralCommands.toWebview.git.branchInfo, {
          crntBranch: GitListener.repository?.state?.HEAD.name,
          branches
        });

        repo.state.onDidChange(() => {
          GitListener.triggerBranchChange(repo);
        });
      }
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

  /**
   * Sends a request to the webview panel.
   * @param command - The command to send.
   * @param requestId - The unique identifier for the request.
   * @param payload - The payload to send with the request.
   */
  private static sendRequest(command: string, requestId: string, payload: any) {
    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelProvider.getInstance(extPath);

    panel.getWebview()?.postMessage({
      command,
      requestId,
      payload
    });

    Dashboard.postWebviewMessage({ command: command as any, requestId, payload });
  }
}
