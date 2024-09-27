import {
  COMMAND_NAME,
  CONTEXT,
  GIT_CONFIG,
  SETTING_DATE_FORMAT,
  SETTING_GIT_COMMIT_MSG,
  SETTING_GIT_DISABLED_BRANCHES,
  SETTING_GIT_ENABLED,
  SETTING_GIT_REQUIRES_COMMIT_MSG,
  SETTING_GIT_SUBMODULE_BRANCH,
  SETTING_GIT_SUBMODULE_FOLDER,
  SETTING_GIT_SUBMODULE_PULL,
  SETTING_GIT_SUBMODULE_PUSH
} from './../../constants';
import { Settings } from './../../helpers/SettingsHelper';
import { Dashboard } from '../../commands/Dashboard';
import { PanelProvider } from '../../panelWebView/PanelProvider';
import {
  ArticleHelper,
  Extension,
  Logger,
  Notifications,
  parseWinPath,
  processTimePlaceholders
} from '../../helpers';
import { GeneralCommands } from './../../constants/GeneralCommands';
import simpleGit, { SimpleGit } from 'simple-git';
import { Folders } from '../../commands/Folders';
import { Event, commands, extensions } from 'vscode';
import { GitAPIState, GitRepository, PostMessageData } from '../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';

export class GitListener {
  private static gitAPI: {
    onDidChangeState: Event<GitAPIState>;
    onDidOpenRepository: Event<GitRepository>;
    onDidCloseRepository: Event<GitRepository>;
    getAPI: (version: number) => any;
    repositories: GitRepository[];
  } | null = null;
  private static isRegistered = false;
  private static client: SimpleGit | null = null;
  private static subClient: SimpleGit | null = null;
  private static repository: GitRepository | null = null;
  private static branchName: string | null = null;

  /**
   * Retrieves the Git settings.
   * @returns {Promise<{
   *   isGitRepo: boolean,
   *   actions: boolean,
   *   disabledBranches: string[],
   *   requiresCommitMessage: string[]
   * }>} The Git settings.
   */
  public static async getSettings(): Promise<
    | {
        isGitRepo: boolean;
        actions: boolean;
        disabledBranches: string[];
        requiresCommitMessage: string[];
      }
    | undefined
  > {
    Logger.verbose('GitListener:getSettings:start');
    const gitActions = Settings.get<boolean>(SETTING_GIT_ENABLED);
    if (gitActions) {
      Logger.verbose('GitListener:getSettings:end:enabled');
      return {
        isGitRepo: gitActions ? await GitListener.isGitRepository() : false,
        actions: gitActions || false,
        disabledBranches: gitActions
          ? Settings.get<string[]>(SETTING_GIT_DISABLED_BRANCHES) || []
          : [],
        requiresCommitMessage: gitActions
          ? Settings.get<string[]>(SETTING_GIT_REQUIRES_COMMIT_MSG) || []
          : []
      };
    }

    Logger.verbose('GitListener:getSettings:end:disabled');
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
        this.sync(msg.payload);
        break;
      case GeneralCommands.toVSCode.git.fetch:
        this.sync(undefined, false);
        break;
      case GeneralCommands.toVSCode.git.getBranch:
        this.getBranch(msg.command, msg.requestId);
        break;
      case GeneralCommands.toVSCode.git.selectBranch:
        this.selectBranch();
        break;
      case GeneralCommands.toVSCode.git.isRepo:
        this.checkIsGitRepo(msg.command, msg.requestId);
        break;
    }
  }

  public static async checkIsGitRepo(command: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    const isRepo = await GitListener.isGitRepository();
    Dashboard.postWebviewMessage({
      command: command as DashboardCommand | DashboardMessage,
      payload: isRepo,
      requestId
    });
  }

  /**
   * Selects the current branch in the Git repository.
   * @returns {Promise<void>} A promise that resolves when the branch command has been executed.
   */
  public static async selectBranch(): Promise<void> {
    const workspaceFolder = Folders.getWorkspaceFolder();
    await commands.executeCommand('git.checkout', workspaceFolder);
  }

  /**
   * Synchronizes the local repository with the remote repository.
   * @param commitMsg The commit message for the push operation.
   * @param isSync Determines whether to perform a sync operation (default: true) or a fetch operation.
   */
  public static async sync(commitMsg?: string, isSync = true) {
    try {
      this.sendMsg(GeneralCommands.toWebview.git.syncingStart, isSync ? 'syncing' : 'fetching');

      await this.pull();

      if (isSync) {
        await this.push(commitMsg);
      }

      this.sendMsg(GeneralCommands.toWebview.git.syncingEnd, {});
    } catch (e) {
      Logger.error((e as Error).message);
      this.sendMsg(GeneralCommands.toWebview.git.syncingEnd, {});
    }
  }

  /**
   * Checks if the current workspace is a Git repository.
   * @returns A boolean indicating whether the current workspace is a Git repository.
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
   * Pulls the latest changes from the remote repository.
   * If submoduleFolder is specified, it checks out the submoduleBranch for the submodule located in that folder.
   * If submodulePull is true, it also updates the submodules with the latest changes from the remote repository.
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
   * Pushes the changes to the remote repository.
   *
   * @param commitMsg The commit message to use. If not provided, it will use the default commit message or the one specified in the settings.
   * @returns A promise that resolves when the push operation is completed.
   */
  private static async push(commitMsg?: string) {
    commitMsg =
      commitMsg || Settings.get<string>(SETTING_GIT_COMMIT_MSG) || 'Synced by Front Matter';

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
            await subGit.commit(commitMsg || GIT_CONFIG.defaultCommitMessage);
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
              commitMsg || GIT_CONFIG.defaultCommitMessage
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
      await git.commit(commitMsg || GIT_CONFIG.defaultCommitMessage);
    }

    await git.push();
  }

  /**
   * Retrieves the Git client instance based on the provided submodule folder.
   * If no submodule folder is provided, it returns the main Git client instance.
   * If a submodule folder is provided, it returns the submodule-specific Git client instance.
   * @param submoduleFolder The path to the submodule folder.
   * @returns The Git client instance or null if it cannot be retrieved.
   */
  private static getClient(submoduleFolder = ''): SimpleGit | null {
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
   * Initializes the VS Code Git provider and sets up event listeners for repository changes.
   * @returns {Promise<void>} A promise that resolves when the Git provider is initialized.
   */
  private static async vscodeGitProvider(): Promise<void> {
    if (!GitListener.gitAPI) {
      const extension = extensions.getExtension('vscode.git');

      /**
       * Logic from: https://github.com/microsoft/vscode/blob/main/extensions/github/src/extension.ts
       * initializeGitExtension
       */
      if (extension) {
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

  /**
   * Retrieves the branch name and sends a request.
   * @param command - The command to send.
   * @param requestId - The ID of the request.
   */
  private static async getBranch(command: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    this.sendRequest(command, requestId, GitListener.repository?.state?.HEAD?.name);
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
   * Triggers a branch change event for the specified Git repository.
   * @param repo The Git repository to monitor for branch changes.
   */
  private static async triggerBranchChange(repo: GitRepository | null) {
    if (repo && repo.state) {
      if (repo.state?.HEAD?.name && repo.state.HEAD.name !== GitListener.branchName) {
        GitListener.branchName = repo.state.HEAD.name;
        GitListener.repository = repo;

        this.sendMsg(GeneralCommands.toWebview.git.branchName, GitListener.branchName);

        repo.state.onDidChange(() => {
          GitListener.triggerBranchChange(repo);
        });
      }
    }
  }

  /**
   * Sends a message to the panel and the dashboard.
   * @param command - The command to send.
   * @param payload - The payload to send with the command.
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
