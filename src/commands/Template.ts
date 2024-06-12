import { Questions } from './../helpers/Questions';
import * as vscode from 'vscode';
import * as path from 'path';
import {
  COMMAND_NAME,
  SETTING_CONTENT_DEFAULT_FILETYPE,
  SETTING_TEMPLATES_FOLDER,
  TelemetryEvent
} from '../constants';
import { ArticleHelper, Extension, Settings } from '../helpers';
import { Article, Folders } from '.';
import { Notifications } from '../helpers/Notifications';
import { Project } from './Project';
import { ContentType } from '../helpers/ContentType';
import { ContentType as IContentType } from '../models';
import { PagesListener } from '../listeners/dashboard';
import { extname } from 'path';
import { Telemetry } from '../helpers/Telemetry';
import { writeFileAsync, copyFileAsync } from '../utils';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class Template {
  public static async registerCommands() {
    const ext = Extension.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      vscode.commands.registerCommand(COMMAND_NAME.createTemplate, Template.generate)
    );

    subscriptions.push(
      vscode.commands.registerCommand(COMMAND_NAME.createFromTemplate, (folder: vscode.Uri) => {
        const folderPath = Folders.getFolderPath(folder);
        if (folderPath) {
          Template.create(folderPath);
        }
      })
    );
  }

  /**
   * Generate a template
   */
  public static async generate() {
    const folder = Template.getSettings();
    const editor = vscode.window.activeTextEditor;
    const fileType = Settings.get<string>(SETTING_CONTENT_DEFAULT_FILETYPE);

    if (folder && editor && ArticleHelper.isSupportedFile()) {
      const article = ArticleHelper.getFrontMatter(editor);
      const clonedArticle = Object.assign({}, article);

      const titleValue = await vscode.window.showInputBox({
        title: l10n.t(LocalizationKey.commandsTemplateGenerateInputTitle),
        prompt: l10n.t(LocalizationKey.commandsTemplateGenerateInputPrompt),
        placeHolder: l10n.t(LocalizationKey.commandsTemplateGenerateInputPlaceholder),
        ignoreFocusOut: true
      });

      if (!titleValue) {
        Notifications.warning(l10n.t(LocalizationKey.commandsTemplateGenerateNoTitleWarning));
        return;
      }

      const keepContents = await vscode.window.showQuickPick(
        [l10n.t(LocalizationKey.commonYes), l10n.t(LocalizationKey.commonNo)],
        {
          title: l10n.t(LocalizationKey.commandsTemplateGenerateKeepContentsTitle),
          placeHolder: l10n.t(LocalizationKey.commandsTemplateGenerateKeepContentsPlaceholder),
          canPickMany: false,
          ignoreFocusOut: true
        }
      );

      if (!keepContents) {
        Notifications.warning(
          l10n.t(LocalizationKey.commandsTemplateGenerateKeepContentsNoOptionWarning)
        );
        return;
      }

      await Project.init(false);
      const templatePath = Project.templatePath();
      if (templatePath) {
        const fileContents = ArticleHelper.stringifyFrontMatter(
          keepContents === l10n.t(LocalizationKey.commonNo) ? '' : clonedArticle.content,
          clonedArticle.data
        );

        const templateFile = path.join(templatePath.fsPath, `${titleValue}.${fileType}`);
        await writeFileAsync(templateFile, fileContents, { encoding: 'utf-8' });

        Notifications.info(
          l10n.t(LocalizationKey.commandsTemplateGenerateKeepContentsSuccess, folder)
        );
      }
    }
  }

  /**
   * Retrieve all templates
   */
  public static async getTemplates() {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);

    if (!folder) {
      Notifications.warning(l10n.t(LocalizationKey.commandsTemplateGetTemplatesWarning));
      return;
    }

    return await vscode.workspace.findFiles(
      `${folder}/**/*`,
      '**/node_modules/**,**/archetypes/**'
    );
  }

  /**
   * Create from a template
   */
  public static async create(folderPath: string) {
    const contentTypes = ContentType.getAll();

    if (!folderPath) {
      Notifications.warning(l10n.t(LocalizationKey.commandsTemplateCreateFolderPathWarning));
      return;
    }

    const templates = await Template.getTemplates();
    if (!templates || templates.length === 0) {
      Notifications.warning(l10n.t(LocalizationKey.commandsTemplateCreateNoTemplatesWarning));
      return;
    }

    const selectedTemplate = await vscode.window.showQuickPick(
      templates.map((t) => path.basename(t.fsPath)),
      {
        title: l10n.t(LocalizationKey.commandsTemplateCreateSelectTemplateTitle),
        placeHolder: l10n.t(LocalizationKey.commandsTemplateCreateSelectTemplatePlaceholder),
        ignoreFocusOut: true
      }
    );
    if (!selectedTemplate) {
      Notifications.warning(
        l10n.t(LocalizationKey.commandsTemplateCreateSelectTemplateNoTemplateWarning)
      );
      return;
    }

    const titleValue = await Questions.ContentTitle();
    if (!titleValue) {
      return;
    }

    // Start the template read
    const template = templates.find((t) => t.fsPath.endsWith(selectedTemplate));
    if (!template) {
      Notifications.warning(
        l10n.t(LocalizationKey.commandsTemplateCreateSelectTemplateNotFoundWarning)
      );
      return;
    }

    const templateData = await ArticleHelper.getFrontMatterByPath(template.fsPath);
    let contentType: IContentType | undefined;
    if (templateData && templateData.data && templateData.data.type) {
      contentType = contentTypes?.find((t) => t.name === templateData.data.type);
    }

    const fileExtension = extname(template.fsPath).replace('.', '');
    const newFilePath: string | undefined = await ArticleHelper.createContent(
      contentType,
      folderPath,
      titleValue,
      fileExtension
    );
    if (!newFilePath) {
      return;
    }

    // Start the new file creation
    await copyFileAsync(template.fsPath, newFilePath);

    // Update the properties inside the template
    const frontMatter = await ArticleHelper.getFrontMatterByPath(newFilePath);
    if (!frontMatter) {
      Notifications.warning(l10n.t(LocalizationKey.commonError));
      return;
    }

    if (frontMatter.data) {
      frontMatter.data = await ArticleHelper.updatePlaceholders(
        frontMatter.data,
        titleValue,
        newFilePath
      );

      const article = await Article.updateDate(frontMatter);

      if (!article) {
        return;
      }

      await writeFileAsync(
        newFilePath,
        ArticleHelper.stringifyFrontMatter(article.content, article.data),
        { encoding: 'utf8' }
      );

      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(newFilePath));
    }

    const txtDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(newFilePath));
    if (txtDoc) {
      vscode.window.showTextDocument(txtDoc);
    }

    Notifications.info(l10n.t(LocalizationKey.commandsTemplateCreateSuccess));

    Telemetry.send(TelemetryEvent.createContentFromTemplate);

    // Trigger a refresh for the dashboard
    PagesListener.refresh();
  }

  /**
   * Get the folder settings
   */
  public static getSettings() {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);
    return folder;
  }
}
