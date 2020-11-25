import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CONFIG_KEY, EXTENSION_NAME, SETTING_TEMPLATES_FOLDER, SETTING_TEMPLATES_PREFIX } from '../constants';
import { format } from 'date-fns';
import sanitize from '../helpers/Sanitize';
import { ArticleHelper } from '../helpers';
import { Article } from '.';

export class Template {

  /**
   * Create from a template
   */
  public static async create(folderPath: string) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const folder = config.get<string>(SETTING_TEMPLATES_FOLDER);
    const prefix = config.get<string>(SETTING_TEMPLATES_PREFIX);

    if (!folderPath) {
      this.showNoTemplates(`Incorrect project folder path retrieved.`);
      return;
    }

    if (!folder) {
      this.showNoTemplates(`No templates found.`);
      return;
    }

    const templates = await vscode.workspace.findFiles(`${folder}/**/*`, "**/node_modules/**,**/archetypes/**");
    if (!templates || templates.length === 0) {
      this.showNoTemplates(`No templates found.`);
      return;
    }

    const selectedTemplate = await vscode.window.showQuickPick(templates.map(t => path.basename(t.fsPath)), {
      placeHolder: `Select the article template to use`
    });
    if (!selectedTemplate) {
      this.showNoTemplates(`No template selected.`);
      return;
    }

    const titleValue = await vscode.window.showInputBox({  
      prompt: `What would you like to use as a title for the new article?`,
      placeHolder: `Article title`
    });
    if (!titleValue) {
      this.showNoTemplates(`You did not specify an article title.`);
      return;
    }

    // Start the template read
    const template = templates.find(t => t.fsPath.endsWith(selectedTemplate));
    if (!template) {
      this.showNoTemplates(`Article template could not be found.`);
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
      this.showNoTemplates(`File already exists, please remove it before creating a new one with the same title.`);
      return;
    }
    
    // Start the new file creation
    fs.copyFileSync(template.fsPath, newFilePath);

    // Update the properties inside the template
    let frontMatter = ArticleHelper.getFrontMatterByPath(newFilePath);
    if (!frontMatter) {
      this.showNoTemplates(`Something failed when retrieving the newly created file.`);
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
    }

    const txtDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(newFilePath));
    if (txtDoc) {
      vscode.window.showTextDocument(txtDoc);
    }

    vscode.window.showInformationMessage(`${EXTENSION_NAME}: Your new article has been created.`);
  }

  /**
   * Show a warning message when no templates are found
   */
  private static showNoTemplates(value: string) {
    vscode.window.showWarningMessage(`${EXTENSION_NAME}: ${value}`);
  }
}