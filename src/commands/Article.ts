import { SETTING_MODIFIED_FIELD } from './../constants/settings';
import * as vscode from 'vscode';
import { TaxonomyType } from "../models";
import { CONFIG_KEY, SETTING_DATE_FORMAT, EXTENSION_NAME, SETTING_SLUG_PREFIX, SETTING_SLUG_SUFFIX, SETTING_DATE_FIELD } from "../constants/settings";
import { format } from "date-fns";
import { ArticleHelper, SettingsHelper, SlugHelper } from '../helpers';
import matter = require('gray-matter');


export class Article {

  /**
  * Insert taxonomy
  *
  * @param type
  */
  public static async insert(type: TaxonomyType) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
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
    const crntOptions = SettingsHelper.getTaxonomy(type);
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
      vscode.window.showInformationMessage(`${EXTENSION_NAME}: No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
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
      vscode.window.showErrorMessage(`${EXTENSION_NAME}: Something failed while parsing the date format. Check your "${CONFIG_KEY}${SETTING_DATE_FORMAT}" setting.`);
      console.log(e.message);
    }
  }

  /**
   * Update the date in the front matter
   * @param article 
   */
  public static updateDate(article: matter.GrayMatterFile<string>, forceCreate: boolean = false) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const dateFormat = config.get(SETTING_DATE_FORMAT) as string;
    const dateField = config.get(SETTING_DATE_FIELD) as string || "date";
    const modField = config.get(SETTING_MODIFIED_FIELD) as string || "date";

    article = this.articleDate(article, dateFormat, dateField, forceCreate);
    article = this.articleDate(article, dateFormat, modField, false);   

    return article;
  }

  /**
   * Sets the article lastmod date
   */
  public static async setLastModifiedDate() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    const dateFormat = config.get(SETTING_DATE_FORMAT) as string;
    const dateField = config.get(SETTING_MODIFIED_FIELD) as string || "lastmod";
    try {
      if (dateFormat && typeof dateFormat === "string") {
        article.data[dateField] = format(new Date(), dateFormat);
      } else {
        article.data[dateField] = new Date().toISOString();
      }

      ArticleHelper.update(editor, article);
    } catch (e) {
      vscode.window.showErrorMessage(`${EXTENSION_NAME}: Something failed while parsing the date format. Check your "${CONFIG_KEY}${SETTING_DATE_FORMAT}" setting.`);
      console.log(e.message);
    }
  }

  /**
   * Generate the slug based on the article title
   */
	public static generateSlug() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const prefix = config.get(SETTING_SLUG_PREFIX) as string;
    const suffix = config.get(SETTING_SLUG_SUFFIX) as string;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article || !article.data) {
      return;
    }

    const articleTitle: string = article.data["title"];
    const slug = SlugHelper.createSlug(articleTitle);
    if (slug) {
      article.data["slug"] = `${prefix}${slug}${suffix}`;
      ArticleHelper.update(editor, article);
    }
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
   * Update the article date and return it
   * @param article 
   * @param dateFormat 
   * @param field 
   * @param forceCreate 
   */
  private static articleDate(article: matter.GrayMatterFile<string>, dateFormat: string, field: string, forceCreate: boolean) {
    if (typeof article.data[field] !== "undefined" || forceCreate) {
      if (dateFormat && typeof dateFormat === "string") {
        article.data[field] = format(new Date(), dateFormat);
      } else {
        article.data[field] = new Date().toISOString();
      }
    }
    return article;
  }
}
