import { CommandToCode } from "../../panelWebView/CommandToCode";
import { TagType } from "../../panelWebView/TagType";
import { BaseListener } from "./BaseListener";
import { window } from "vscode";
import { ArticleHelper, Settings } from "../../helpers";
import { CustomTaxonomyData, TaxonomyType } from "../../models";
import { DataListener } from ".";
import { SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_TAGS } from "../../constants";


export class TaxonomyListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: any, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case CommandToCode.updateTags:
        this.updateTags(TagType.tags, msg.data?.values || [], msg.data?.parents || []);
        break;
      case CommandToCode.updateCategories:
        this.updateTags(TagType.categories, msg.data?.values || [], msg.data?.parents || []);
        break;
      case CommandToCode.updateKeywords:
        this.updateTags(TagType.keywords, msg.data?.values || [], msg.data?.parents || []);
        break;
      case CommandToCode.updateCustomTaxonomy:
        this.updateCustomTaxonomy(msg.data);
        break;
      case CommandToCode.addTagToSettings:
        this.addTags(TagType.tags, msg.data);
        break;
      case CommandToCode.addCategoryToSettings:
        this.addTags(TagType.categories, msg.data);
        break;
      case CommandToCode.addToCustomTaxonomy:
        this.addCustomTaxonomy(msg.data);
        break;
    }
  }

  /**
   * Update the tags in the current document
   * @param tagType 
   * @param values 
   */
   private static updateTags(tagType: TagType, values: string[], parents: string[]) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {

      // Support multi-level fields
      let parentObj = article.data;
      for (const parent of parents || []) {
        parentObj = parentObj[parent];
      }

      parentObj[tagType.toLowerCase()] = values || [];
      ArticleHelper.update(editor, article);
      DataListener.pushMetadata(article!.data);
    }
  }

  /**
   * Update the tags in the current document
   * @param data 
   */
  private static updateCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.name) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {

      // Support multi-level fields
      let parentObj = article.data;
      for (const parent of data.parents || []) {
        parentObj = parentObj[parent];
      }

      parentObj[data.name] = data.options || [];
      ArticleHelper.update(editor, article);
      DataListener.pushMetadata(article!.data);
    }
  }

  /**
   * Add tag to the settings
   * @param data 
   */
  private static async addCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.option) {
      return;
    }

    await Settings.updateCustomTaxonomy(data.id, data.option);
  }

  /**
   * Add tag to the settings
   * @param tagType 
   * @param value 
   */
  private static async addTags(tagType: TagType, value: string) {
    if (value) {
      let options = tagType === TagType.tags ? Settings.get<string[]>(SETTING_TAXONOMY_TAGS, true) : Settings.get<string[]>(SETTING_TAXONOMY_CATEGORIES, true);

      if (!options) {
        options = [];
      }

      options.push(value);
      const taxType = tagType === TagType.tags ? TaxonomyType.Tag : TaxonomyType.Category;
      await Settings.updateTaxonomy(taxType, options);
    }
  }
}