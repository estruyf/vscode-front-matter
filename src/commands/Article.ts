import { isValidFile } from './../helpers/isValidFile';
import { SETTING_AUTO_UPDATE_DATE, SETTING_MODIFIED_FIELD, SETTING_SLUG_UPDATE_FILE_NAME, SETTING_TEMPLATES_PREFIX, CONFIG_KEY, SETTING_DATE_FORMAT, SETTING_SLUG_PREFIX, SETTING_SLUG_SUFFIX, SETTINGS_CONTENT_PLACEHOLDERS, TelemetryEvent } from './../constants';
import * as vscode from 'vscode';
import { Field, TaxonomyType } from "../models";
import { format } from "date-fns";
import { ArticleHelper, Settings, SlugHelper } from '../helpers';
import { Notifications } from '../helpers/Notifications';
import { extname, basename, parse, dirname } from 'path';
import { COMMAND_NAME, DefaultFields } from '../constants';
import { DashboardData } from '../models/DashboardData';
import { DateHelper } from '../helpers/DateHelper';
import { parseWinPath } from '../helpers/parseWinPath';
import { Telemetry } from '../helpers/Telemetry';
import { ParsedFrontMatter } from '../parsers';
import { MediaListener } from '../listeners/panel';


export class Article {
  /**
  * Insert taxonomy
  *
  * @param type
  */
  public static async insert(type: TaxonomyType) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = Article.getCurrent();

    if (!article) {
      return;
    }

    let options: vscode.QuickPickItem[] = [];
    const matterProp: string = type === TaxonomyType.Tag ? "tags" : "categories";

    // Add the selected options to the options array
    if (article.data[matterProp]) {
      const propData = article.data[matterProp];
      if (propData && propData.length > 0) {
        options = [...propData].filter(p => p).map(p => ({
          label: p,
          picked: true
        } as vscode.QuickPickItem));
      }
    }

    // Add all the known options to the selection list
    const crntOptions = Settings.getTaxonomy(type);
    if (crntOptions && crntOptions.length > 0) {
      for (const crntOpt of crntOptions) {
        if (!options.find(o => o.label === crntOpt)) {
          options.push({
            label: crntOpt
          });
        }
      }
    }

    if (options.length === 0) {
      Notifications.info(`No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
      return;
    }

    const selectedOptions = await vscode.window.showQuickPick(options, {
      placeHolder: `Select your ${type === TaxonomyType.Tag ? "tags" : "categories"} to insert`,
      canPickMany: true
    });

    if (selectedOptions) {
      article.data[matterProp] = selectedOptions.map(o => o.label);
    }

    ArticleHelper.update(editor, article);
  }

  /**
   * Sets the article date
   */
  public static async setDate() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    let article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    article = this.updateDate(article, true);

    try {
      ArticleHelper.update(editor, article);
    } catch (e) {
      Notifications.error(`Something failed while parsing the date format. Check your "${CONFIG_KEY}${SETTING_DATE_FORMAT}" setting.`);
    }
  }

  /**
   * Update the date in the front matter
   * @param article 
   */
  public static updateDate(article: ParsedFrontMatter, forceCreate: boolean = false) {
    article.data = ArticleHelper.updateDates(article.data);   
    return article;
  }

  /**
   * Sets the article lastmod date
   */
  public static async setLastModifiedDate() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const updatedArticle = this.setLastModifiedDateInner(editor.document);

    if (typeof updatedArticle === "undefined") {
      return;
    }

    ArticleHelper.update(
      editor,
      updatedArticle as ParsedFrontMatter
    );
  }

  public static async setLastModifiedDateOnSave(
    document: vscode.TextDocument
  ): Promise<vscode.TextEdit[]> {
    const updatedArticle = this.setLastModifiedDateInner(document);

    if (typeof updatedArticle === "undefined") {
      return [];
    }

    const update = ArticleHelper.generateUpdate(document, updatedArticle);

    return [update];
  }

  private static setLastModifiedDateInner(
    document: vscode.TextDocument
  ): ParsedFrontMatter | undefined {
    const article = ArticleHelper.getFrontMatterFromDocument(document);

    if (!article) {
      return;
    }

    const cloneArticle = Object.assign({}, article);
    const dateField = Settings.get(SETTING_MODIFIED_FIELD) as string || DefaultFields.LastModified;
    try {
      cloneArticle.data[dateField] = Article.formatDate(new Date());
      return cloneArticle;
    } catch (e: any) {
      Notifications.error(`Something failed while parsing the date format. Check your "${CONFIG_KEY}${SETTING_DATE_FORMAT}" setting.`);
    }
  }

  /**
   * Generate the slug based on the article title
   */
	public static async generateSlug() {
		Telemetry.send(TelemetryEvent.generateSlug);
    
    const prefix = Settings.get(SETTING_SLUG_PREFIX) as string;
    const suffix = Settings.get(SETTING_SLUG_SUFFIX) as string;
    const updateFileName = Settings.get(SETTING_SLUG_UPDATE_FILE_NAME) as string;
    const filePrefix = Settings.get<string>(SETTING_TEMPLATES_PREFIX);
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article || !article.data) {
      return;
    }

    const contentType = ArticleHelper.getContentType(article.data);
    const titleField = "title";
    const articleTitle: string = article.data[titleField];
    
    const slug = SlugHelper.createSlug(articleTitle);
    if (slug) {
      let slugFieldValue = `${prefix}${slug}${suffix}`;
      article.data["slug"] = slugFieldValue;

      if (contentType) {
        // Update the fields containing the slug placeholder
        let fieldsToUpdate: Field[] = contentType.fields.filter(f => f.default === "{{slug}}");
        for (const field of fieldsToUpdate) {
          article.data[field.name] = slug;
        }

        // Update the fields containing a custom placeholder that depends on slug
        const placeholders = Settings.get<{id: string, value: string}[]>(SETTINGS_CONTENT_PLACEHOLDERS);
        const customPlaceholders = placeholders?.filter(p => p.value.includes("{{slug}}"));
        for (const customPlaceholder of (customPlaceholders || [])) {
          const customPlaceholderFields = contentType.fields.filter(f => f.default === `{{${customPlaceholder.id}}}`);
          for (const pField of customPlaceholderFields) {
            article.data[pField.name] = customPlaceholder.value;
            article.data[pField.name] = ArticleHelper.processKnownPlaceholders(article.data[pField.name], articleTitle);
          }
        }
      }

      ArticleHelper.update(editor, article);

      // Check if the file name should be updated by the slug
      // This is required for systems like Jekyll
      if (updateFileName) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const ext = extname(editor.document.fileName);
          const fileName = basename(editor.document.fileName);
          
          let slugName = slug.startsWith("/") ? slug.substring(1) : slug;
          slugName = slugName.endsWith("/") ? slugName.substring(0, slugName.length - 1) : slugName;

          let newFileName = `${slugName}${ext}`;
          if (filePrefix && typeof filePrefix === "string") {
            newFileName = `${format(new Date(), DateHelper.formatUpdate(filePrefix) as string)}-${newFileName}`;
          }

          const newPath = editor.document.uri.fsPath.replace(fileName, newFileName);

          try {
            await editor.document.save();

            await vscode.workspace.fs.rename(editor.document.uri, vscode.Uri.file(newPath), {
              overwrite: false
            });
          } catch (e: any) {
            Notifications.error(`Failed to rename file: ${e?.message || e}`);
          }
        }
      }
    }
	}

  /**
   * Retrieve the slug from the front matter
   */
  public static getSlug() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const file = parseWinPath(editor.document.fileName);

    if (!isValidFile(file)) {
      return;
    }

    const parsedFile = parse(file);

    if (parsedFile.name.toLowerCase() !== "index") {
      return parsedFile.name;
    }

    const folderName = basename(dirname(file));
    return folderName;
  }

  /**
   * Toggle the page its draft mode
   */
  public static async toggleDraft() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    const newDraftStatus = !article.data["draft"];
    article.data["draft"] = newDraftStatus;
    ArticleHelper.update(editor, article);
  }

  /**
   * Article auto updater
   * @param event
   */
  public static async autoUpdate(event: vscode.TextDocumentWillSaveEvent) {
    const document = event.document;
    if (document && ArticleHelper.isMarkdownFile(document)) {
      const autoUpdate = Settings.get(SETTING_AUTO_UPDATE_DATE);

      if (autoUpdate) {
        event.waitUntil(Article.setLastModifiedDateOnSave(document));
      }
    }
  }

  /**
   * Format the date to the defined format
   */
  public static formatDate(dateValue: Date): string {
    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;

    if (dateFormat && typeof dateFormat === "string") {
      return format(dateValue, DateHelper.formatUpdate(dateFormat) as string);
    } else {
      return typeof dateValue.toISOString === 'function' ? dateValue.toISOString() : dateValue?.toString();
    }
  }

  /**
   * Insert an image from the media dashboard into the article
   */
  public static async insertImage() {
		let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;

    await vscode.commands.executeCommand(COMMAND_NAME.dashboard, {
      type: "media",
      data: {
        filePath: editor.document.uri.fsPath,
        fieldName: basename(editor.document.uri.fsPath),
        position
      }
    } as DashboardData);

    // Let the editor panel know you are selecting an image
    MediaListener.getMediaSelection();
	}

  /**
   * Get the current article
   */
  private static getCurrent(): ParsedFrontMatter | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    return article;
  }

  /**
   * Update the article date and return it
   * @param article 
   * @param dateFormat 
   * @param field 
   * @param forceCreate 
   */
  private static articleDate(article: ParsedFrontMatter, field: string, forceCreate: boolean) {
    if (typeof article.data[field] !== "undefined" || forceCreate) {
      article.data[field] = Article.formatDate(new Date());
    }
    return article;
  }
}
