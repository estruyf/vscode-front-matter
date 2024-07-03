import { ParsedFrontMatter } from './../parsers/FrontMatterParser';
import {
  CONTEXT,
  EXTENSION_NAME,
  NOTIFICATION_TYPE,
  SETTING_SEO_DESCRIPTION_LENGTH,
  SETTING_SEO_TITLE_LENGTH
} from './../constants';
import * as vscode from 'vscode';
import { ArticleHelper, Notifications, SeoHelper, Settings } from '../helpers';
import { PanelProvider } from '../panelWebView/PanelProvider';
import { ContentType } from '../helpers/ContentType';
import { DataListener } from '../listeners/panel';
import { commands } from 'vscode';
import { Field } from '../models';
import { Preview } from './Preview';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { i18n } from './i18n';
import { getDescriptionField, getTitleField } from '../utils';

export class StatusListener {
  /**
   * Update the text of the status bar
   *
   * @param frontMatterSB
   * @param collection
   */
  public static async verify(collection: vscode.DiagnosticCollection) {
    const editor = vscode.window.activeTextEditor;
    let document = editor?.document;

    if (!document) {
      const filePath = Preview.filePath || ArticleHelper.getActiveFile();
      if (filePath) {
        document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
      }
    }

    if (document && ArticleHelper.isSupportedFile(document)) {
      try {
        commands.executeCommand('setContext', CONTEXT.isValidFile, true);

        // Check i18n
        const isI18nEnabled = await i18n.isLocaleEnabled(document.uri.fsPath);
        commands.executeCommand('setContext', CONTEXT.isI18nEnabled, isI18nEnabled);

        const article = editor
          ? ArticleHelper.getFrontMatter(editor)
          : await ArticleHelper.getFrontMatterByPath(document.uri.fsPath);

        // Check SEO and required fields
        if (article && article.data) {
          collection.clear();

          // Retrieve the SEO config properties
          const titleLength = Settings.get<number>(SETTING_SEO_TITLE_LENGTH) || -1;
          const descLength = Settings.get<number>(SETTING_SEO_DESCRIPTION_LENGTH) || -1;
          const titleField = getTitleField();
          const descriptionField = getDescriptionField();

          if (editor && article.data[titleField] && titleLength > -1) {
            SeoHelper.checkLength(editor, collection, article, titleField, titleLength);
          }

          if (editor && article.data[descriptionField] && descLength > -1) {
            SeoHelper.checkLength(editor, collection, article, descriptionField, descLength);
          }

          // Check the required fields
          if (editor) {
            StatusListener.verifyRequiredFields(editor, article, collection);
          }
        }

        const panel = PanelProvider.getInstance();
        if (panel && panel.visible) {
          DataListener.pushMetadata(article?.data);
        }

        return;
      } catch (e) {
        // Nothing to do
      }
    } else {
      commands.executeCommand('setContext', CONTEXT.isValidFile, false);
      commands.executeCommand('setContext', CONTEXT.isI18nEnabled, false);

      const panel = PanelProvider.getInstance();
      if (panel && panel.visible) {
        DataListener.pushMetadata(null);
      }
    }
  }

  /**
   * Verify the required fields
   * @param article
   * @param collection
   */
  private static async verifyRequiredFields(
    editor: vscode.TextEditor,
    article: ParsedFrontMatter,
    collection: vscode.DiagnosticCollection
  ) {
    // Check for missing fields
    const emptyFields = await ContentType.findEmptyRequiredFields(article);
    const fieldsToReport = [];

    if (emptyFields && emptyFields.length > 0) {
      const text = editor.document.getText();
      const markdown = ArticleHelper.stringifyFrontMatter('', article.data);
      const editorSpaces = vscode.window.activeTextEditor?.options?.tabSize;

      const requiredDiagnostics: vscode.Diagnostic[] = [];

      for (const fields of emptyFields) {
        let txtIdx = -1;
        let fieldName = '';
        let level = 0;

        for (const field of fields) {
          const totalSpaces =
            level * (typeof editorSpaces === 'string' ? parseInt(editorSpaces) : editorSpaces || 2);
          const crntIdx = StatusListener.findFieldLine(text, txtIdx, totalSpaces, field);

          if (crntIdx && crntIdx > txtIdx) {
            txtIdx = crntIdx;
            fieldName = field.name;
          }

          ++level;
        }

        if (txtIdx !== -1 && txtIdx < markdown.length) {
          fieldsToReport.push(fields.map((f) => f.title).join('/'));

          const posStart = editor.document.positionAt(txtIdx);
          const posEnd = editor.document.positionAt(txtIdx + 1 + fieldName.length);

          const diagnostic: vscode.Diagnostic = {
            code: '',
            message: l10n.t(
              LocalizationKey.commandsStatusListenerVerifyRequiredFieldsDiagnosticEmptyField,
              fields.map((f) => f.name).join('/')
            ),
            range: new vscode.Range(posStart, posEnd),
            severity: vscode.DiagnosticSeverity.Error,
            source: EXTENSION_NAME
          };

          requiredDiagnostics.push(diagnostic);
        }
      }

      if (collection.has(editor.document.uri)) {
        const otherDiag = collection.get(editor.document.uri) || [];
        collection.set(editor.document.uri, [...otherDiag, ...requiredDiagnostics]);
      } else {
        collection.set(editor.document.uri, [...requiredDiagnostics]);
      }

      if (fieldsToReport.length > 0) {
        Notifications.showIfNotDisabled(
          NOTIFICATION_TYPE.requiredFieldValidation,
          'ERROR_ONCE',
          l10n.t(
            LocalizationKey.commandsStatusListenerVerifyRequiredFieldsNotificationError,
            fieldsToReport.join(', ')
          )
        );
      }
    }
  }

  /**
   * Find the line of the field
   * @param text
   * @param startIdx
   * @param totalSpaces
   * @param field
   * @returns
   */
  private static findFieldLine(
    text: string,
    startIdx: number,
    totalSpaces: number,
    field: Field
  ): number | undefined {
    const crntIdx = text.indexOf(field.name, startIdx === -1 ? 0 : startIdx);

    if (crntIdx > -1) {
      // Find the linebreak before the current index
      const txtFromStart = text.substring(0, crntIdx);
      const splitLineBreaks = txtFromStart.split(/\r?\n/);
      const lastLine = splitLineBreaks[splitLineBreaks.length - 1];

      if (lastLine.length === totalSpaces) {
        if (crntIdx > startIdx) {
          return crntIdx;
        }
      } else {
        return StatusListener.findFieldLine(text, crntIdx + field.name.length, totalSpaces, field);
      }
    }

    return;
  }
}
