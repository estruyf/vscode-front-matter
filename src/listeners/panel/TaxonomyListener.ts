import { CommandToCode } from '../../panelWebView/CommandToCode';
import { TagType } from '../../panelWebView/TagType';
import { BaseListener } from './BaseListener';
import { window } from 'vscode';
import { ArticleHelper, Settings } from '../../helpers';
import { BlockFieldData, CustomTaxonomyData, PostMessageData, TaxonomyType } from '../../models';
import { DataListener } from '.';
import { SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_TAGS } from '../../constants';

export class TaxonomyListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.updateTags:
        this.updateTags(
          msg.payload?.fieldName,
          msg.payload?.values || [],
          msg.payload?.parents || [],
          msg.payload?.blockData
        );
        break;
      case CommandToCode.updateCategories:
        this.updateTags(
          msg.payload?.fieldName,
          msg.payload?.values || [],
          msg.payload?.parents || [],
          msg.payload?.blockData
        );
        break;
      case CommandToCode.updateKeywords:
        this.updateTags(
          TagType.keywords.toLowerCase(),
          msg.payload?.values || [],
          msg.payload?.parents || [],
          msg.payload?.blockData
        );
        break;
      case CommandToCode.updateCustomTaxonomy:
        this.updateCustomTaxonomy(msg.payload);
        break;
      case CommandToCode.addTagToSettings:
        this.addTags(TagType.tags, msg.payload);
        break;
      case CommandToCode.addCategoryToSettings:
        this.addTags(TagType.categories, msg.payload);
        break;
      case CommandToCode.addToCustomTaxonomy:
        this.addCustomTaxonomy(msg.payload);
        break;
    }
  }

  /**
   * Update the tags in the current document
   * @param tagType
   * @param values
   */
  private static updateTags(
    fieldName: string,
    values: string[],
    parents: string[],
    blockData?: BlockFieldData
  ) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return '';
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      const parentObj = DataListener.getParentObject(article.data, article, parents, blockData);

      parentObj[fieldName] = values || [];
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
      return '';
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      const parentObj = DataListener.getParentObject(
        article.data,
        article,
        data.parents,
        data.blockData
      );

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
      let options =
        tagType === TagType.tags
          ? Settings.get<string[]>(SETTING_TAXONOMY_TAGS, true)
          : Settings.get<string[]>(SETTING_TAXONOMY_CATEGORIES, true);

      if (!options) {
        options = [];
      }

      options.push(value);
      const taxType = tagType === TagType.tags ? TaxonomyType.Tag : TaxonomyType.Category;
      await Settings.updateTaxonomy(taxType, options);
    }
  }
}
