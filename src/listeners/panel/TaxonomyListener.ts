import { CommandToCode } from '../../panelWebView/CommandToCode';
import { TagType } from '../../panelWebView/TagType';
import { BaseListener } from './BaseListener';
import { authentication, window } from 'vscode';
import { ArticleHelper, Extension, Settings, TaxonomyHelper } from '../../helpers';
import { BlockFieldData, CustomTaxonomyData, PostMessageData, TaxonomyType } from '../../models';
import { DataListener } from '.';
import {
  DefaultFields,
  SETTING_SEO_DESCRIPTION_FIELD,
  SETTING_SEO_TITLE_FIELD
} from '../../constants';
import { SponsorAi } from '../../services/SponsorAI';
import { PanelProvider } from '../../panelWebView/PanelProvider';
import { MessageHandlerData } from '@estruyf/vscode';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

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
          typeof msg.payload?.renderAsString !== 'undefined' ? msg.payload?.renderAsString : false,
          msg.payload?.blockData
        );
        break;
      case CommandToCode.updateCategories:
        this.updateTags(
          msg.payload?.fieldName,
          msg.payload?.values || [],
          msg.payload?.parents || [],
          typeof msg.payload?.renderAsString !== 'undefined' ? msg.payload?.renderAsString : false,
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
      case CommandToCode.aiSuggestTaxonomy:
        this.aiSuggestTaxonomy(msg.command, msg.requestId, msg.payload);
        break;
    }
  }

  private static async aiSuggestTaxonomy(command: string, requestId?: string, type?: TagType) {
    if (!command || !requestId || !type) {
      return;
    }

    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelProvider.getInstance(extPath);

    const editor = window.activeTextEditor;
    if (!editor) {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoDataError)
      } as MessageHandlerData<string>);
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article || !article.data) {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoEditorError)
      } as MessageHandlerData<string>);
      return;
    }

    const githubAuth = await authentication.getSession('github', ['read:user'], { silent: true });
    if (!githubAuth || !githubAuth.accessToken) {
      return;
    }

    const titleField = (Settings.get(SETTING_SEO_TITLE_FIELD) as string) || DefaultFields.Title;
    const descriptionField =
      (Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string) || DefaultFields.Description;

    const suggestions = await SponsorAi.getTaxonomySuggestions(
      githubAuth.accessToken,
      article.data[titleField] || '',
      article.data[descriptionField] || '',
      type
    );

    if (!suggestions) {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoDataError)
      } as MessageHandlerData<string>);
      return;
    }

    panel.getWebview()?.postMessage({
      command,
      requestId,
      payload: suggestions || []
    } as MessageHandlerData<string[]>);
  }

  /**
   * Update the tags in the current document
   * @param tagType
   * @param values
   */
  private static async updateTags(
    fieldName: string,
    values: string[],
    parents: string[],
    renderAsString: boolean,
    blockData?: BlockFieldData
  ) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return '';
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      const parentObj = await DataListener.getParentObject(
        article.data,
        article,
        parents,
        blockData
      );

      if (renderAsString) {
        if (values.length === 0) {
          parentObj[fieldName] = '';
        } else if (values.length === 1) {
          parentObj[fieldName] = values[0];
        } else {
          parentObj[fieldName] = values || [];
        }
      } else {
        parentObj[fieldName] = values || [];
      }
      ArticleHelper.update(editor, article);
      DataListener.pushMetadata(article!.data);
    }
  }

  /**
   * Update the tags in the current document
   * @param data
   */
  private static async updateCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.name) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return '';
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      const parentObj = await DataListener.getParentObject(
        article.data,
        article,
        data.parents,
        data.blockData
      );

      if (data.renderAsString) {
        if (!data.options || data.options.length === 0) {
          parentObj[data.name] = '';
        } else if (data.options.length === 1) {
          parentObj[data.name] = data.options[0];
        } else {
          parentObj[data.name] = data.options || [] || [];
        }
      } else {
        parentObj[data.name] = data.options || [];
      }

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
          ? await TaxonomyHelper.get(TaxonomyType.Tag)
          : await TaxonomyHelper.get(TaxonomyType.Category);

      if (!options) {
        options = [];
      }

      options.push(value);
      const taxType = tagType === TagType.tags ? TaxonomyType.Tag : TaxonomyType.Category;
      TaxonomyHelper.update(taxType, options);
    }
  }
}
