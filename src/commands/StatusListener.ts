import { ParsedFrontMatter } from './../parsers/FrontMatterParser';
import {
  CONTEXT,
  NOTIFICATION_TYPE,
  SETTING_SEO_DESCRIPTION_FIELD,
  SETTING_SEO_DESCRIPTION_LENGTH,
  SETTING_SEO_TITLE_FIELD,
  SETTING_SEO_TITLE_LENGTH
} from './../constants';
import * as vscode from 'vscode';
import { ArticleHelper, Notifications, SeoHelper, Settings } from '../helpers';
import { PanelProvider } from '../panelWebView/PanelProvider';
import { DefaultFields } from '../constants';
import { ContentType } from '../helpers/ContentType';
import { DataListener } from '../listeners/panel';
import { commands } from 'vscode';
import { Field } from '../models';
import { Preview } from './Preview';

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

        const article = editor
          ? ArticleHelper.getFrontMatter(editor)
          : await ArticleHelper.getFrontMatterByPath(document.uri.fsPath);

        // Check SEO and required fields
        if (article && article.data) {
          collection.clear();

          // Retrieve the SEO config properties
          const titleLength = (Settings.get(SETTING_SEO_TITLE_LENGTH) as number) || -1;
          const descLength = (Settings.get(SETTING_SEO_DESCRIPTION_LENGTH) as number) || -1;
          const titleField =
            (Settings.get(SETTING_SEO_TITLE_FIELD) as string) || DefaultFields.Title;
          const descriptionField =
            (Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string) || DefaultFields.Description;

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
  private static verifyRequiredFields(
    editor: vscode.TextEditor,
    article: ParsedFrontMatter,
    collection: vscode.DiagnosticCollection
  ) {
    // Check for missing fields
    const emptyFields = ContentType.findEmptyRequiredFields(article);
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
            message: `This ${fields
              .map((f) => f.name)
              .join('/')} field is required to contain a value.`,
            range: new vscode.Range(posStart, posEnd),
            severity: vscode.DiagnosticSeverity.Error,
            source: 'Front Matter'
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
          `The following fields are required to contain a value: ${fieldsToReport.join(', ')}`
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
