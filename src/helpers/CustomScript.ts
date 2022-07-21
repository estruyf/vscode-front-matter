import { CommandType } from './../models/PanelSettings';
import { CustomScript as ICustomScript, ScriptType } from '../models/PanelSettings';
import { window, env as vscodeEnv, ProgressLocation } from 'vscode';
import { ArticleHelper, Logger, Telemetry } from '.';
import { Folders } from '../commands/Folders';
import { exec } from 'child_process';
import * as os from 'os';
import { join } from 'path';
import { Notifications } from './Notifications';
import ContentProvider from '../providers/ContentProvider';
import { Dashboard } from '../commands/Dashboard';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { ParsedFrontMatter } from '../parsers';
import { TelemetryEvent } from '../constants/TelemetryEvent';

export class CustomScript {

  public static async run(script: ICustomScript, path: string | null = null): Promise<void> {
    const wsFolder = Folders.getWorkspaceFolder();

    if (wsFolder) {
      const wsPath = wsFolder.fsPath;

      if (script.type === ScriptType.MediaFile || script.type === ScriptType.MediaFolder) {
        Telemetry.send(TelemetryEvent.runMediaScript);
        
        CustomScript.runMediaScript(wsPath, path, script);
      } else {
        Telemetry.send(TelemetryEvent.runCustomScript);

        if (script.bulk) {
          // Run script on all files
          CustomScript.bulkRun(wsPath, script);
        } else if (path) {
          // Run script for provided path
          CustomScript.singleRun(wsPath, script, path);
        } else {
          // Run script on current file.
          CustomScript.singleRun(wsPath, script);
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
  private static async singleRun(wsPath: string, script: ICustomScript, path: string | null = null): Promise<void> {
    let articlePath: string | null = path;
    let article: ParsedFrontMatter | null = null;

    if (!path) {
      const editor = window.activeTextEditor;
      if (!editor) return;

      articlePath = editor.document.uri.fsPath;
      article = ArticleHelper.getFrontMatter(editor);
    } else {
      article = ArticleHelper.getFrontMatterByPath(path);
    }

    if (articlePath && article) {
      window.withProgress({
        location: ProgressLocation.Notification,
        title: `Executing: ${script.title}`,
        cancellable: false
      }, async () => {
        const output = await CustomScript.runScript(wsPath, article, articlePath as string, script);
        CustomScript.showOutput(output, script, articlePath);
      });
    } else {
      Notifications.warning(`${script.title}: Article couldn't be retrieved.`);
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
      Notifications.warning(`${script.title}: No files found.`);
      return;
    }

    let output: string[] = [];

    window.withProgress({
			location: ProgressLocation.Notification,
			title: `Executing: ${script.title}`,
			cancellable: false
		}, async (progress, token) => {      
      for await (const folder of folders) {
        if (folder.lastModified.length > 0) {
          for await (const file of folder.lastModified) {
            try {
              const article = ArticleHelper.getFrontMatterByPath(file.filePath);
              if (article) {
                const crntOutput = await CustomScript.runScript(wsPath, article, file.filePath, script);
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
  
      CustomScript.showOutput(output.join(`\n`), script);
    });
  }

  /**
   * Run a script for a media file
   * @param wsPath 
   * @param path 
   * @param script 
   * @returns 
   */
  private static async runMediaScript(wsPath: string, path: string | null, script: ICustomScript): Promise<void>  {
    if (!path) {
      Notifications.error(`${script.title}: There was no folder or media path specified.`);
      return;
    }

    return new Promise((resolve, reject) => {
      window.withProgress({
        location: ProgressLocation.Notification,
        title: `Executing: ${script.title}`,
        cancellable: false
      }, async () => {
        try {
          const output = await CustomScript.executeScript(script, wsPath, `"${wsPath}" "${path}"`);

          CustomScript.showOutput(output, script);
  
          Dashboard.postWebviewMessage({ 
            command: DashboardCommand.mediaUpdate
          });

          return;
        } catch (e) {
          Notifications.error(`${script.title}: ${(e as Error).message}`);
          return;
        }
      });
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
  private static async runScript(wsPath: string, article: ParsedFrontMatter | null, contentPath: string, script: ICustomScript): Promise<string | null> {
    try {
      let articleData = "";
      if (os.type() === "Windows_NT") {
        articleData = `"${JSON.stringify(article?.data).replace(/"/g, `""`)}"`;
      } else {
        articleData = JSON.stringify(article?.data).replace(/'/g, "%27");
        articleData = `'${articleData}'`;
      }

      const output = await CustomScript.executeScript(script, wsPath, `"${wsPath}" "${contentPath}" ${articleData}`);
      return output;
    } catch (e) {
      Notifications.error(`${script.title}: ${(e as Error).message}`);
      return null;
    }
  }

  /**
   * Show/process the output of the script
   * @param output 
   * @param script 
   */
  private static showOutput(output: string | null, script: ICustomScript, articlePath?: string | null): void {
    if (output) {
      try {
        const data = JSON.parse(output);

        if (data.frontmatter) {
          let article = null;
          const editor = window.activeTextEditor;

          if (!articlePath) {
            if (!editor) return;
      
            articlePath = editor.document.uri.fsPath;
            article = ArticleHelper.getFrontMatter(editor);
          } else {
            article = ArticleHelper.getFrontMatterByPath(articlePath);
          }

          if (article && article.data) {
            for (const key in data.frontmatter) {
              article.data[key] = data.frontmatter[key];
            }

            if (articlePath) {
              ArticleHelper.updateByPath(articlePath, article);
            } else if (editor) {
              ArticleHelper.update(editor, article);
            } else {
              throw new Error(`Couldn't update article.`);
            }
            Notifications.info(`${script.title}: front matter updated.`);
          }
        } else {
          throw new Error(`No frontmatter found.`);
        }
      } catch (error) {
        if (script.output === "editor") {
          ContentProvider.show(output, script.title, script.outputType || "text");
        } else {
          window.showInformationMessage(`${script.title}: ${output}`, 'Copy output').then(value => {
            if (value === 'Copy output') {
              vscodeEnv.clipboard.writeText(output);
            }
          });
        }
      }
    } else {
      Notifications.info(`${script.title}: Executed your custom script.`);
    }
  }

  /**
   * Execute script
   * @param script 
   * @param wsPath 
   * @param args 
   * @returns 
   */
  public static async executeScript(script: ICustomScript, wsPath: string, args: string): Promise<string> {
    return new Promise((resolve, reject) => {
      
      // Check the command to use
      let command = script.nodeBin || "node";
      if (script.command && script.command !== CommandType.Node) {
        command = script.command;
      }

      const scriptPath = join(wsPath, script.script);
      const fullScript = `${command} ${scriptPath} ${args}`;
      Logger.info(`Executing: ${fullScript}`);

      exec(fullScript, (error, stdout) => {
        if (error) {
          reject(error.message);
        }

        if (stdout && stdout.endsWith(`\n`)) {
          // Remove empty line at the end of the string
          stdout = stdout.slice(0, -1);
        }

        resolve(stdout);
      });
    });
  }
}