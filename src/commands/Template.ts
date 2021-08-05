import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CONFIG_KEY, SETTING_TEMPLATES_FOLDER, SETTING_TEMPLATES_PREFIX } from '../constants';
import { format } from 'date-fns';
import sanitize from '../helpers/Sanitize';
import { ArticleHelper } from '../helpers';
import { Article } from '.';
import { Notifications } from '../helpers/Notifications';
import { CONTEXT } from '../constants/context';

export class Template {

  /**
   * Check if the template folder is available
   */
  public static async init() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const folder = config.get<string>(SETTING_TEMPLATES_FOLDER);

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!folder || !workspaceFolders || workspaceFolders.length === 0) {
      vscode.commands.executeCommand('setContext', CONTEXT.canInit, true);
      return;
    }
    
    const workspaceFolder = workspaceFolders[0];
    const templatePath = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, folder));

    try {
      await vscode.workspace.fs.stat(templatePath);
      vscode.commands.executeCommand('setContext', CONTEXT.canInit, false);
    } catch (e) {
      vscode.commands.executeCommand('setContext', CONTEXT.canInit, true);
    }
  }

  /**
   * Create from a template
   */
  public static async create(folderPath: string) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const folder = config.get<string>(SETTING_TEMPLATES_FOLDER);
    const prefix = config.get<string>(SETTING_TEMPLATES_PREFIX);

    if (!folderPath) {
      Notifications.warning(`Incorrect project folder path retrieved.`);
      return;
    }

    if (!folder) {
      Notifications.warning(`No templates found.`);
      return;
    }

    const templates = await vscode.workspace.findFiles(`${folder}/**/*`, "**/node_modules/**,**/archetypes/**");
    if (!templates || templates.length === 0) {
      Notifications.warning(`No templates found.`);
      return;
    }

    const selectedTemplate = await vscode.window.showQuickPick(templates.map(t => path.basename(t.fsPath)), {
      placeHolder: `Select the article template to use`
    });
    if (!selectedTemplate) {
      Notifications.warning(`No template selected.`);
      return;
    }

    const titleValue = await vscode.window.showInputBox({  
      prompt: `What would you like to use as a title for the new article?`,
      placeHolder: `Article title`
    });
    if (!titleValue) {
      Notifications.warning(`You did not specify an article title.`);
      return;
    }

    // Start the template read
    const template = templates.find(t => t.fsPath.endsWith(selectedTemplate));
    if (!template) {
      Notifications.warning(`Article template could not be found.`);
      return;
    }

    const fileExt = path.parse(selectedTemplate).ext;
    const sanitizedName = sanitize(titleValue.toLowerCase().replace(/ /g, "-"));
    let newFileName = `${sanitizedName}${fileExt}`;
    if (prefix && typeof prefix === "string") {
      newFileName = `${format(new Date(), prefix)}-${newFileName}`;
    }

    const newFilePath = path.join(folderPath, newFileName);
    if (fs.existsSync(newFilePath)) {
      Notifications.warning(`File already exists, please remove it before creating a new one with the same title.`);
      return;
    }
    
    // Start the new file creation
    fs.copyFileSync(template.fsPath, newFilePath);

    // Update the properties inside the template
    let frontMatter = ArticleHelper.getFrontMatterByPath(newFilePath);
    if (!frontMatter) {
      Notifications.warning(`Something failed when retrieving the newly created file.`);
      return;
    }

    if (frontMatter.data) {
      const fmData = frontMatter.data;
      if (typeof fmData.title !== "undefined") {
        fmData.title = titleValue;
      }
      if (typeof fmData.slug !== "undefined") {
        fmData.slug = sanitizedName;
      }

      frontMatter = Article.updateDate(frontMatter);

      fs.writeFileSync(newFilePath, ArticleHelper.stringifyFrontMatter(frontMatter.content, frontMatter.data), { encoding: "utf8" });

      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(newFilePath));
    }

    const txtDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(newFilePath));
    if (txtDoc) {
      vscode.window.showTextDocument(txtDoc);
    }

    Notifications.info(`Your new article has been created.`);
  }
}