import { CustomScript as ICustomScript, ScriptType } from '../models/PanelSettings';
import { window, env as vscodeEnv, ProgressLocation } from 'vscode';
import { ArticleHelper } from '.';
import { Folders } from '../commands/Folders';
import { exec } from 'child_process';
import matter = require('gray-matter');
import * as os from 'os';
import { join } from 'path';
import { Notifications } from './Notifications';
import ContentProvider from '../providers/ContentProvider';
import { Dashboard } from '../commands/Dashboard';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';

export class CustomScript {

  public static async run(script: ICustomScript, path: string | null = null): Promise<void> {
    const wsFolder = Folders.getWorkspaceFolder();

    if (wsFolder) {
      const wsPath = wsFolder.fsPath;

      if (script.type === ScriptType.MediaFile || script.type === ScriptType.MediaFolder) {
        CustomScript.runMediaScript(wsPath, path, script);
      } else {
        if (script.bulk) {
          // Run script on all files
          CustomScript.bulkRun(wsPath, script);
        } else {
          // Run script on current file.
          CustomScript.singleRun(wsPath, script);
        }
      }
    }
  }

  private static async singleRun(wsPath: string, script: ICustomScript): Promise<void> {
    const editor = window.activeTextEditor;
    if (!editor) return;

    const article = ArticleHelper.getFrontMatter(editor);

    if (article) {
      const output = await CustomScript.runScript(wsPath, article, editor.document.uri.fsPath, script);

      CustomScript.showOutput(output, script);
    } else {
      Notifications.warning(`${script.title}: Current article couldn't be retrieved.`);
    }
  }

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
              const article = ArticleHelper.getFrontMatterByPath(file.filePath, true);
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
        exec(`${script.nodeBin || "node"} ${join(wsPath, script.script)} "${wsPath}" "${path}"`, (error, stdout) => {
          if (error) {
            Notifications.error(`${script.title}: ${error.message}`);
            resolve();
            return;
          }
  
          CustomScript.showOutput(stdout, script);
  
          Dashboard.postWebviewMessage({ 
            command: DashboardCommand.mediaUpdate
          });
  
          resolve();
          return;
        });
      });
    });
  }

  private static async runScript(wsPath: string, article: matter.GrayMatterFile<string> | null, contentPath: string, script: ICustomScript): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let articleData = "";
      if (os.type() === "Windows_NT") {
        articleData = `"${JSON.stringify(article?.data).replace(/"/g, `""`)}"`;
      } else {
        articleData = JSON.stringify(article?.data).replace(/'/g, "%27");
        articleData = `'${articleData}'`;
      }

      exec(`${script.nodeBin || "node"} ${join(wsPath, script.script)} "${wsPath}" "${contentPath}" ${articleData}`, (error, stdout) => {
        if (error) {
          Notifications.error(`${script.title}: ${error.message}`);
          resolve(null);
          return;
        }

        resolve(stdout);
      });
    });
  }

  private static showOutput(output: string | null, script: ICustomScript): void {
    if (output) {
      if (script.output === "editor") {
        ContentProvider.show(output, script.title, script.outputType || "text");
      } else {
        window.showInformationMessage(`${script.title}: ${output}`, 'Copy output').then(value => {
          if (value === 'Copy output') {
            vscodeEnv.clipboard.writeText(output);
          }
        });
      }
    } else {
      Notifications.info(`${script.title}: Executed your custom script.`);
    }
  }
}