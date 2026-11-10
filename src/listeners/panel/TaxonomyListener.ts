import { CommandToCode } from '../../panelWebView/CommandToCode';
import { TagType } from '../../panelWebView/TagType';
import { BaseListener } from './BaseListener';
import { authentication, window } from 'vscode';
import { ArticleHelper, Extension, Settings, TaxonomyHelper } from '../../helpers';
import { BlockFieldData, CustomTaxonomyData, PostMessageData, TaxonomyType } from '../../models';
import { SETTING_COPILOT_ENABLED } from '../../constants';
import { DataListener } from '.';
import { SettingsListener as PanelSettingsListener } from '.';
import { SettingsListener as DashboardSettingsListener } from '../dashboard';
import { SponsorAi } from '../../services/SponsorAI';
import { PanelProvider } from '../../panelWebView/PanelProvider';
import type { MessageHandlerData } from '@estruyf/vscode';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { Copilot } from '../../services/Copilot';
import { getDescriptionField, getTitleField } from '../../utils';

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
          typeof msg.payload?.renderAsString !== 'undefined' ? msg.payload?.renderAsString : false,
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
      case CommandToCode.copilotSuggestTaxonomy:
        this.copilotSuggestTaxonomy(msg.command, msg.requestId, msg.payload);
        break;
    }
  }

  /**
   * Suggests a taxonomy for a given command, request ID, and tag type.
   *
   * @param command - The command to execute.
   * @param requestId - The ID of the request.
   * @param type - The type of the tag.
   * @returns A Promise that resolves to void.
   */
  private static async copilotSuggestTaxonomy(command: string, requestId?: string, type?: TagType) {
    if (!command || !requestId || !type) {
      return;
    }

    // Check if Copilot is enabled and installed
    const copilotEnabled = Settings.get<boolean>(SETTING_COPILOT_ENABLED) !== false;
    const isCopilotInstalled = await Copilot.isInstalled();

    if (!copilotEnabled || !isCopilotInstalled) {
      const extPath = Extension.getInstance().extensionPath;
      const panel = PanelProvider.getInstance(extPath);
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.servicesCopilotGetChatResponseError)
      } as MessageHandlerData<string[]>);
      return;
    }

    const article = ArticleHelper.getActiveFile();
    if (!article) {
      this.sendRequestError(
        command,
        requestId,
        l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoEditorError)
      );
      return;
    }

    const articleDetails = await ArticleHelper.getFrontMatterByPath(article);
    if (!articleDetails) {
      this.sendRequestError(
        command,
        requestId,
        l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoDataError)
      );
      return;
    }

    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelProvider.getInstance(extPath);

    const titleField = getTitleField();
    const descriptionField = getDescriptionField();

    const tags = await Copilot.suggestTaxonomy(
      articleDetails.data[titleField],
      type,
      articleDetails.data[descriptionField],
      articleDetails.content
    );

    if (tags) {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        payload: tags
      } as MessageHandlerData<string[]>);
    } else {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.servicesCopilotGetChatResponseError)
      } as MessageHandlerData<string>);
    }
  }

  /**
   * Suggests taxonomy based on the provided command, request ID, and tag type.
   *
   * @param command - The command to execute.
   * @param requestId - The ID of the request.
   * @param type - The type of tag.
   * @returns A Promise that resolves to void.
   */
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
        error: l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoEditorError)
      } as MessageHandlerData<string>);
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article || !article.data) {
      panel.getWebview()?.postMessage({
        command,
        requestId,
        error: l10n.t(LocalizationKey.listenersPanelTaxonomyListenerAiSuggestTaxonomyNoDataError)
      } as MessageHandlerData<string>);
      return;
    }

    const githubAuth = await authentication.getSession('github', ['read:user'], { silent: true });
    if (!githubAuth || !githubAuth.accessToken) {
      this.sendRequestError(command, requestId, 'No GitHub session found');
      return;
    }

    const titleField = getTitleField();
    const descriptionField = getDescriptionField();

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
    if (!editor || !ArticleHelper.isSupportedFile(editor.document)) {
      return '';
    }

    return DataListener.queueUpdate(editor.document.uri.fsPath, async () => {
      // Read the latest contents, as a previous update could have changed the file
      const version = editor.document.version;
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

        // The document changed while processing the update, so it has to start over
        if (editor.document.version !== version || !(await ArticleHelper.update(editor, article))) {
          return false;
        }
        DataListener.pushMetadata(article!.data);
      }
    });
  }

  /**
   * Update the tags in the current document
   * @param data
   */
  private static async updateCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.name) {
      return;
    }
    const { name } = data;

    const editor = window.activeTextEditor;
    if (!editor || !ArticleHelper.isSupportedFile(editor.document)) {
      return '';
    }

    return DataListener.queueUpdate(editor.document.uri.fsPath, async () => {
      // Read the latest contents, as a previous update could have changed the file
      const version = editor.document.version;
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
            parentObj[name] = '';
          } else if (data.options.length === 1) {
            parentObj[name] = data.options[0];
          } else {
            parentObj[name] = data.options || [] || [];
          }
        } else {
          parentObj[name] = data.options || [];
        }

        // The document changed while processing the update, so it has to start over
        if (editor.document.version !== version || !(await ArticleHelper.update(editor, article))) {
          return false;
        }
        DataListener.pushMetadata(article!.data);
      }
    });
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

    PanelSettingsListener.getSettings();
    DashboardSettingsListener.getSettings(true);
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
