import { Questions } from './../helpers/Questions';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SETTING_TEMPLATES_FOLDER, SETTING_TEMPLATES_PREFIX } from '../constants';
import { ArticleHelper, Settings } from '../helpers';
import { Article } from '.';
import { Notifications } from '../helpers/Notifications';
import { CONTEXT } from '../constants';
import { Project } from './Project';
import { Folders } from './Folders';
import { ContentType } from '../helpers/ContentType';
import { ContentType as IContentType } from '../models';

export class Template {

  /**
   * Check if the template folder is available
   */
  public static async init() {
    const isInitialized = await Template.isInitialized();
    await vscode.commands.executeCommand('setContext', CONTEXT.canInit, !isInitialized);
  }

  /**
   * Check if the project is already initialized
   */
  public static async isInitialized() {
    const wsFolder = Folders.getWorkspaceFolder();
    const folder = Template.getSettings();

    if (!folder || !wsFolder) {
      return false;
    }

    const templatePath = vscode.Uri.file(path.join(wsFolder.fsPath, folder));

    try {
      await vscode.workspace.fs.stat(templatePath);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate a template
   */
  public static async generate() {
    const folder = Template.getSettings();
    const editor = vscode.window.activeTextEditor;

    if (folder && editor && ArticleHelper.isMarkdownFile()) {
      const article = ArticleHelper.getFrontMatter(editor);
      const clonedArticle = Object.assign({}, article);

      const titleValue = await vscode.window.showInputBox({  
        prompt: `What name would you like to give your template?`,
        placeHolder: `article`
      });

      if (!titleValue) {
        Notifications.warning(`You did not specify a template title.`);
        return;
      }

      const keepContents = await vscode.window.showQuickPick(
        ["yes", "no"], 
        { 
          canPickMany: false, 
          placeHolder: `Do you want to keep the contents for the template?`,
        }
      );

      if (!keepContents) {
        Notifications.warning(`You did not pick any of the options for keeping the template its content.`);
        return;
      }

      await Project.init(false);
      const templatePath = Project.templatePath();
      if (templatePath) {
        let fileContents = ArticleHelper.stringifyFrontMatter(keepContents === "no" ? "" : clonedArticle.content, clonedArticle.data);

        const templateFile = path.join(templatePath.fsPath, `${titleValue}.md`);
        fs.writeFileSync(templateFile, fileContents, { encoding: "utf-8" });

        Notifications.info(`Template created and is now available in your ${folder} folder.`);
      }
    }
  }

  /**
   * Create from a template
   */
  public static async create(folderPath: string) {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);
    const contentTypes = ContentType.getAll();

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
      placeHolder: `Select the content template to use`
    });
    if (!selectedTemplate) {
      Notifications.warning(`No template selected.`);
      return;
    }

    const titleValue = await Questions.ContentTitle();
    if (!titleValue) {
      return;
    }

    // Start the template read
    const template = templates.find(t => t.fsPath.endsWith(selectedTemplate));
    if (!template) {
      Notifications.warning(`Content template could not be found.`);
      return;
    }

    const templateData = ArticleHelper.getFrontMatterByPath(template.fsPath);
    let contentType: IContentType | undefined;
    if (templateData && templateData.data && templateData.data.type) {
      contentType = contentTypes?.find(t => t.name === templateData.data.type);
    }

    let newFilePath: string | undefined = ArticleHelper.createContent(contentType, folderPath, titleValue);
    if (!newFilePath) {
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
        fmData.slug = ArticleHelper.sanitize(titleValue);
      }

      frontMatter = Article.updateDate(frontMatter);

      fs.writeFileSync(newFilePath, ArticleHelper.stringifyFrontMatter(frontMatter.content, frontMatter.data), { encoding: "utf8" });

      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(newFilePath));
    }

    const txtDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(newFilePath));
    if (txtDoc) {
      vscode.window.showTextDocument(txtDoc);
    }

    Notifications.info(`Your new content has been created.`);
  }

  /**
   * Get the folder settings
   */
  public static getSettings() {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);
    return folder;
  }
}