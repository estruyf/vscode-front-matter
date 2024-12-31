import { Settings } from './SettingsHelper';
import { CommandType } from './../models/PanelSettings';
import { CustomScript as ICustomScript, ScriptType } from '../models/PanelSettings';
import { window, env as vscodeEnv, ProgressLocation, Uri, commands } from 'vscode';
import { ArticleHelper, Logger, MediaHelpers } from '.';
import { Folders, WORKSPACE_PLACEHOLDER } from '../commands/Folders';
import { exec, execSync } from 'child_process';
import * as os from 'os';
import { join } from 'path';
import { Notifications } from './Notifications';
import ContentProvider from '../providers/ContentProvider';
import { Dashboard } from '../commands/Dashboard';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { ParsedFrontMatter } from '../parsers';
import { SETTING_CUSTOM_SCRIPTS } from '../constants';
import { evaluateCommand, existsAsync, getPlatform } from '../utils';
import { LocalizationKey, localize } from '../localization';
import { ScriptAction } from '../models';
import { Copilot } from '../services/Copilot';

export class CustomScript {
  /**
   * Retrieve all scripts
   * @returns
   */
  public static async getScripts(): Promise<ICustomScript[]> {
    const scripts = Settings.get<ICustomScript[]>(SETTING_CUSTOM_SCRIPTS) || [];
    return scripts;
  }

  /**
   * Run a script
   * @param script
   * @param path
   */
  public static async run(script: ICustomScript, path: string | null = null): Promise<void> {
    const wsFolder = Folders.getWorkspaceFolder();

    if (wsFolder) {
      const wsPath = wsFolder.fsPath;

      if (script.type === ScriptType.MediaFile || script.type === ScriptType.MediaFolder) {
        await CustomScript.runMediaScript(wsPath, path, script);
      } else {
        if (script.bulk) {
          // Run script on all files
          await CustomScript.bulkRun(wsPath, script);
        } else if (path) {
          // Run script for provided path
          await CustomScript.singleRun(wsPath, script, path);
        } else {
          // Run script on current file.
          await CustomScript.singleRun(wsPath, script);
        }
      }
    }
  }

  /**
   * Run the script on the current file
   * @param wsPath
   * @param script
   * @param path
   * @returns
   */
  public static async singleRun(
    wsPath: string,
    script: ICustomScript,
    path: string | null = null
  ): Promise<any> {
    let articlePath: string | null = path;
    let article: ParsedFrontMatter | null | undefined = null;

    if (!path) {
      const editor = window.activeTextEditor;
      if (!editor) {
        return;
      }

      articlePath = editor.document.uri.fsPath;
      article = ArticleHelper.getFrontMatter(editor);
    } else {
      article = await ArticleHelper.getFrontMatterByPath(path);
    }

    if (articlePath && article) {
      return window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: `Executing: ${script.title}`,
          cancellable: false
        },
        async () => {
          const output = await CustomScript.runScript(
            wsPath,
            article,
            articlePath as string,
            script
          );
          return await CustomScript.showOutput(output, script, articlePath);
        }
      );
    } else {
      Notifications.warning(
        localize(LocalizationKey.helpersCustomScriptSingleRunArticleWarning, script.title)
      );
    }
  }

  /**
   * Run the script on multiple files
   * @param wsPath
   * @param script
   * @returns
   */
  private static async bulkRun(wsPath: string, script: ICustomScript): Promise<void> {
    const folders = await Folders.getInfo();

    if (!folders || folders.length === 0) {
      Notifications.warning(
        localize(LocalizationKey.helpersCustomScriptBulkRunNoFilesWarning, script.title)
      );
      return;
    }

    const output: string[] = [];

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: localize(LocalizationKey.helpersCustomScriptExecuting, script.title),
        cancellable: false
      },
      async (_, __) => {
        for await (const folder of folders) {
          if (folder.lastModified.length > 0) {
            for await (const file of folder.lastModified) {
              try {
                const article = await ArticleHelper.getFrontMatterByPath(file.filePath);
                if (article) {
                  const crntOutput = await CustomScript.runScript(
                    wsPath,
                    article,
                    file.filePath,
                    script
                  );
                  if (crntOutput) {
                    output.push(crntOutput);
                  }
                }
              } catch (error) {
                // Skipping file
              }
            }
          }
        }

        await CustomScript.showOutput(output.join(`\n`), script);
      }
    );
  }

  /**
   * Run a script for a media file
   * @param wsPath
   * @param path
   * @param script
   * @returns
   */
  private static async runMediaScript(
    wsPath: string,
    path: string | null,
    script: ICustomScript
  ): Promise<void> {
    if (!path) {
      Notifications.error(
        localize(LocalizationKey.helpersCustomScriptRunMediaScriptNoFolderWarning, script.title)
      );
      return;
    }

    return new Promise((resolve, reject) => {
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: localize(LocalizationKey.helpersCustomScriptExecuting, script.title),
          cancellable: false
        },
        async () => {
          try {
            const output = await CustomScript.executeScript(
              script,
              wsPath,
              `"${wsPath}" "${path}"`
            );

            await CustomScript.showOutput(output, script);

            Dashboard.postWebviewMessage({
              command: DashboardCommand.mediaUpdate
            });

            return;
          } catch (e) {
            Notifications.errorWithOutput(`${script.title} -`);
            return;
          }
        }
      );
    });
  }

  /**
   * Script runner
   * @param wsPath
   * @param article
   * @param contentPath
   * @param script
   * @returns
   */
  private static async runScript(
    wsPath: string,
    article: ParsedFrontMatter | null | undefined,
    contentPath: string,
    script: ICustomScript
  ): Promise<string | null> {
    try {
      let articleData = '';
      if (os.type() === 'Windows_NT') {
        const jsonData = JSON.stringify(article?.data);

        if (script.command && script.command.toLowerCase() === 'powershell') {
          articleData = `'${jsonData.replace(/"/g, `\\"`)}'`;
        } else {
          articleData = `"${jsonData.replace(/"/g, `\\"`)}"`;
        }
      } else {
        articleData = JSON.stringify(article?.data).replace(/'/g, '%27');
        articleData = `'${articleData}'`;
      }

      const output = await CustomScript.executeScript(
        script,
        wsPath,
        `"${wsPath}" "${contentPath}" ${articleData}`
      );
      return output;
    } catch (e) {
      if (typeof e === 'string') {
        Notifications.error(`${script.title}: ${e}`);
      } else {
        Notifications.error(`${script.title}: ${(e as Error).message}`);
      }
      return null;
    }
  }

  /**
   * Show/process the output of the script
   * @param output
   * @param script
   */
  private static async showOutput(
    output: string | null,
    script: ICustomScript,
    articlePath?: string | null
  ): Promise<any> {
    if (output) {
      try {
        const data: {
          frontmatter?: { [key: string]: any };
          fmAction?: ScriptAction;
          fmPath?: string;
          fmSourcePath?: string;
          fmDestinationPath?: string;
          fmFieldValue?: any;
        } = JSON.parse(output);

        if (data.frontmatter) {
          let article = null;
          const editor = window.activeTextEditor;

          if (!articlePath) {
            if (!editor) {
              return;
            }

            articlePath = editor.document.uri.fsPath;
            article = ArticleHelper.getFrontMatter(editor);
          } else {
            article = await ArticleHelper.getFrontMatterByPath(articlePath);
          }

          if (article && article.data) {
            for (const key in data.frontmatter) {
              article.data[key] = data.frontmatter[key];
            }

            if (articlePath) {
              await ArticleHelper.updateByPath(articlePath, article);
            } else if (editor) {
              await ArticleHelper.update(editor, article);
            } else {
              Logger.error(`Couldn't update article.`);
              throw new Error(`Couldn't update article.`);
            }
            Notifications.info(
              localize(
                LocalizationKey.helpersCustomScriptShowOutputFrontMatterSuccess,
                script.title
              )
            );
          }
        } else if (data.fmAction) {
          if (data.fmAction === 'open' && data.fmPath) {
            const uri = data.fmPath.startsWith(`http`) ? data.fmPath : Uri.file(data.fmPath);
            commands.executeCommand('vscode.open', uri);
          } else if (
            data.fmAction === 'copyMediaMetadata' &&
            data.fmSourcePath &&
            data.fmDestinationPath
          ) {
            await MediaHelpers.copyMetadata(data.fmSourcePath, data.fmDestinationPath);
          } else if (
            data.fmAction === 'copyMediaMetadataAndDelete' &&
            data.fmSourcePath &&
            data.fmDestinationPath
          ) {
            await MediaHelpers.copyMetadata(data.fmSourcePath, data.fmDestinationPath);
            await MediaHelpers.deleteFile(data.fmSourcePath);
          } else if (data.fmAction === 'deleteMedia' && data.fmPath) {
            await MediaHelpers.deleteFile(data.fmPath);
          } else if (data.fmAction === 'fieldAction') {
            return data.fmFieldValue || undefined;
          }
        } else {
          Logger.error(`No frontmatter found.`);
          throw new Error(`No frontmatter found.`);
        }
      } catch (error) {
        if (script.output === 'editor') {
          ContentProvider.show(output, script.title, script.outputType || 'text');
        } else {
          window
            .showInformationMessage(
              `${script.title}: ${output}`,
              localize(LocalizationKey.helpersCustomScriptShowOutputCopyOutputAction)
            )
            .then((value) => {
              if (
                value === localize(LocalizationKey.helpersCustomScriptShowOutputCopyOutputAction)
              ) {
                vscodeEnv.clipboard.writeText(output);
              }
            });
        }
      }
    } else {
      Notifications.info(
        localize(LocalizationKey.helpersCustomScriptShowOutputSuccess, script.title)
      );
    }
  }

  /**
   * Execute script
   * @param script
   * @param wsPath
   * @param args
   * @returns
   */
  public static async executeScript(
    script: ICustomScript,
    wsPath: string,
    args: string
  ): Promise<string> {
    const platform = getPlatform();

    // Check the command to use
    let command = script.nodeBin || 'node';
    if (script.command && script.command !== CommandType.Node) {
      command = script.command;
    }

    if (script.command === CommandType.Node && platform !== 'windows') {
      command = await evaluateCommand(CommandType.Node);
    }

    let scriptPath = join(wsPath, script.script);
    if (script.script.includes(WORKSPACE_PLACEHOLDER)) {
      scriptPath = Folders.getAbsFilePath(script.script);
    }

    // Check if there is an environments overwrite required
    if (script.environments) {
      const environment = script.environments.find((e) => e.type === platform);
      if (environment && environment.script && environment.command) {
        if (await CustomScript.validateCommand(environment.command)) {
          command = environment.command;

          if (command === CommandType.Node && platform !== 'windows') {
            command = await evaluateCommand(CommandType.Node);
          }

          scriptPath = join(wsPath, environment.script);
          if (environment.script.includes(WORKSPACE_PLACEHOLDER)) {
            scriptPath = Folders.getAbsFilePath(environment.script);
          }
        }
      }
    }

    if (!(await existsAsync(scriptPath))) {
      Logger.error(`Script not found: ${scriptPath}`);
      throw new Error(`Script not found: ${scriptPath}`);
    }

    if (platform === 'windows' && command.toLowerCase() === 'powershell') {
      command = `${command} -File`;
    }

    const fullScript = `${command} "${scriptPath}" ${args}`;
    Logger.info(localize(LocalizationKey.helpersCustomScriptExecuting, fullScript));

    const output = await CustomScript.processExecution(fullScript, wsPath);
    return output;
  }

  // Recursive function to process the execution of the script
  private static async processExecution(fullScript: string, wsPath: string): Promise<string> {
    const output: string = await CustomScript.executeScriptAsync(fullScript, wsPath);

    try {
      const data = JSON.parse(output);
      const { questions, fmAction, fmPrompt } = data as {
        questions?: {
          name: string;
          message: string;
          default?: string;
          options?: string[];
        }[];
        fmAction?: ScriptAction;
        fmPrompt?: any; // When the 'promptCopilot' action is used
      };

      if (questions) {
        const answers: string[] = [];

        for (const question of questions) {
          if (question.name && question.message) {
            let answer;
            if (question.options) {
              answer = await window.showQuickPick(question.options, {
                title: question.message,
                ignoreFocusOut: true,
                canPickMany: false
              });
            } else {
              answer = await window.showInputBox({
                prompt: question.message,
                value: question.default || '',
                ignoreFocusOut: true,
                title: question.message
              });
            }

            if (answer) {
              answers.push(`${question.name}="${answer}"`);
            } else {
              return '';
            }
          }
        }

        if (answers.length > 0) {
          const newScript = `${fullScript} ${answers.join(' ')}`;
          return await CustomScript.processExecution(newScript, wsPath);
        }
      } else if (fmAction) {
        if (fmAction === 'promptCopilot' && fmPrompt) {
          const response = await Copilot.promptCopilot(fmPrompt);
          if (response) {
            const promptResponse = `promptResponse="${response}"`;
            const newScript = `${fullScript} ${promptResponse}`;
            return await CustomScript.processExecution(newScript, wsPath);
          }
        }
      }
    } catch (error) {
      // Not a JSON
    }

    return output;
  }

  /**
   * Execute script async
   * @param fullScript
   * @param wsPath
   * @returns
   */
  private static async executeScriptAsync(fullScript: string, wsPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(fullScript, { cwd: wsPath }, (error, stdout) => {
        if (error) {
          Logger.error(error.message);
          reject(error.message);
          return;
        }

        if (stdout && stdout.endsWith(`\n`)) {
          // Remove empty line at the end of the string
          stdout = stdout.slice(0, -1);
        }

        resolve(stdout);
      });
    });
  }

  /**
   * Validate if the command is exists
   * @param command
   * @returns
   */
  private static async validateCommand(command: string) {
    try {
      execSync(command);

      return true;
    } catch (e) {
      Logger.error(localize(LocalizationKey.helpersCustomScriptValidateCommandError, command));
      return false;
    }
  }
}
