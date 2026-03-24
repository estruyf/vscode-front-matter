import { ParsedFrontMatter } from './../parsers/FrontMatterParser';
import {
  CONTEXT,
  EXTENSION_NAME,
  NOTIFICATION_TYPE,
  SETTING_SEO_DESCRIPTION_LENGTH,
  SETTING_SEO_TITLE_LENGTH,
  SETTING_VALIDATION_ENABLED
} from './../constants';
import * as vscode from 'vscode';
import {
  ArticleHelper,
  Notifications,
  SeoHelper,
  Settings,
  FrontMatterValidator,
  ValidationError
} from '../helpers';
import { PanelProvider } from '../panelWebView/PanelProvider';
import { ContentType } from '../helpers/ContentType';
import { DataListener } from '../listeners/panel';
import { commands } from 'vscode';
import { Field } from '../models';
import { FrontMatterParser } from '../parsers';
import { Preview } from './Preview';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { i18n } from './i18n';
import { getDescriptionField, getTitleField } from '../utils';
import * as yaml from 'yaml';

export class StatusListener {
  private static _validator: FrontMatterValidator | undefined;
  private static get validator(): FrontMatterValidator {
    if (!StatusListener._validator) {
      StatusListener._validator = new FrontMatterValidator();
    }
    return StatusListener._validator;
  }
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

            // Schema validation
            const validationEnabled = Settings.get<boolean>(SETTING_VALIDATION_ENABLED, true);
            if (validationEnabled) {
              await StatusListener.verifySchemaValidation(editor, article, collection);
            }
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
   * Verify schema validation
   * @param editor Text editor
   * @param article Parsed front matter
   * @param collection Diagnostic collection
   */
  private static async verifySchemaValidation(
    editor: vscode.TextEditor,
    article: ParsedFrontMatter,
    collection: vscode.DiagnosticCollection
  ) {
    try {
      const contentType = await ArticleHelper.getContentType(article);
      if (!contentType || !contentType.fields || contentType.fields.length === 0) {
        return;
      }

      // Validate against schema
      const errors = await StatusListener.validator.validate(article.data, contentType);

      if (errors.length === 0) {
        return;
      }

      const text = editor.document.getText();
      const schemaDiagnostics: vscode.Diagnostic[] = [];

      for (const error of errors) {
        const range = StatusListener.findSchemaErrorRange(editor.document, text, error);

        if (range) {
          const diagnostic: vscode.Diagnostic = {
            code: '',
            message: error.message,
            range,
            severity: vscode.DiagnosticSeverity.Warning,
            source: EXTENSION_NAME
          };

          schemaDiagnostics.push(diagnostic);
        }
      }

      if (schemaDiagnostics.length > 0) {
        if (collection.has(editor.document.uri)) {
          const otherDiag = collection.get(editor.document.uri) || [];
          collection.set(editor.document.uri, [...otherDiag, ...schemaDiagnostics]);
        } else {
          collection.set(editor.document.uri, [...schemaDiagnostics]);
        }
      }
    } catch (error) {
      // Silently fail validation errors to not disrupt the user experience
      // Logger can be used here if needed for debugging
    }
  }

  private static findSchemaErrorRange(
    document: vscode.TextDocument,
    text: string,
    error: ValidationError
  ): vscode.Range | undefined {
    const language = FrontMatterParser.getLanguageFromContent(text);

    if (language === 'yaml') {
      const yamlRange = StatusListener.findYamlSchemaErrorRange(document, text, error);
      if (yamlRange) {
        return yamlRange;
      }
    }

    return StatusListener.findTextSchemaErrorRange(document, text, error);
  }

  private static findYamlSchemaErrorRange(
    document: vscode.TextDocument,
    text: string,
    error: ValidationError
  ): vscode.Range | undefined {
    const frontMatter = StatusListener.getYamlFrontMatter(text);
    if (!frontMatter) {
      return undefined;
    }

    const path = StatusListener.getValidationPath(error);
    if (path.length === 0) {
      return undefined;
    }

    const doc = yaml.parseDocument(frontMatter.content);
    const node = doc.getIn(path, true) as { range?: [number, number, number] } | null;

    if (!node?.range || node.range.length < 2) {
      return undefined;
    }

    const normalizedRange = StatusListener.normalizeYamlNodeRange(frontMatter.content, node.range);
    if (!normalizedRange) {
      return undefined;
    }

    return new vscode.Range(
      document.positionAt(frontMatter.startOffset + normalizedRange.start),
      document.positionAt(frontMatter.startOffset + normalizedRange.end)
    );
  }

  private static findTextSchemaErrorRange(
    document: vscode.TextDocument,
    text: string,
    error: ValidationError
  ): vscode.Range | undefined {
    const path = StatusListener.getValidationPath(error);
    const fieldName = path.length > 0 ? String(path[path.length - 1]) : '';
    const arrayIndex =
      typeof path[path.length - 1] === 'number' ? (path[path.length - 1] as number) : undefined;
    const searchFieldName =
      arrayIndex !== undefined ? String(path[path.length - 2] || '') : fieldName;

    if (!searchFieldName || searchFieldName === 'root') {
      return undefined;
    }

    const frontMatterMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const frontMatterEnd = frontMatterMatch ? frontMatterMatch[0].length : text.length;
    const searchText = text.substring(0, frontMatterEnd);
    const fieldIdx = searchText.indexOf(`${searchFieldName}:`);

    if (fieldIdx === -1) {
      return undefined;
    }

    let posStart = document.positionAt(fieldIdx);
    let posEnd = document.positionAt(fieldIdx + searchFieldName.length);

    if (arrayIndex !== undefined) {
      const afterField = text.indexOf('\n', fieldIdx) + 1;
      let remaining = arrayIndex;
      let searchFrom = afterField;
      while (searchFrom < frontMatterEnd) {
        const lineEnd = text.indexOf('\n', searchFrom);
        const line = text.substring(searchFrom, lineEnd === -1 ? frontMatterEnd : lineEnd);
        if (/^\s*-\s/.test(line)) {
          if (remaining === 0) {
            const valueOffset = line.indexOf('- ') + 2;
            const rawItemValue = line.substring(valueOffset).trim();
            const isQuoted =
              rawItemValue.length > 1 &&
              ((rawItemValue.startsWith('"') && rawItemValue.endsWith('"')) ||
                (rawItemValue.startsWith("'") && rawItemValue.endsWith("'")));
            const itemValue = isQuoted ? rawItemValue.slice(1, -1) : rawItemValue;
            const valueStartOffset = searchFrom + valueOffset + (isQuoted ? 1 : 0);
            posStart = document.positionAt(valueStartOffset);
            posEnd = document.positionAt(valueStartOffset + itemValue.length);
            break;
          }
          remaining--;
        } else if (line.trim() && !/^\s/.test(line)) {
          break;
        }
        searchFrom = (lineEnd === -1 ? frontMatterEnd : lineEnd) + 1;
      }
    }

    return new vscode.Range(posStart, posEnd);
  }

  private static getValidationPath(error: ValidationError): Array<string | number> {
    const path =
      error.field && error.field !== 'root'
        ? error.field
            .split('.')
            .filter(Boolean)
            .map((segment) => (/^\d+$/.test(segment) ? parseInt(segment, 10) : segment))
        : [];

    if (error.keyword === 'required' && typeof error.params?.missingProperty === 'string') {
      return [...path, error.params.missingProperty];
    }

    if (
      error.keyword === 'additionalProperties' &&
      typeof error.params?.additionalProperty === 'string'
    ) {
      return [...path, error.params.additionalProperty];
    }

    return path;
  }

  private static getYamlFrontMatter(
    text: string
  ): { content: string; startOffset: number } | undefined {
    const openMatch = text.match(/^---\r?\n/);
    if (!openMatch) {
      return undefined;
    }

    const startOffset = openMatch[0].length;
    const closeMatch = /\r?\n---/.exec(text.slice(startOffset));
    const endOffset = closeMatch ? startOffset + closeMatch.index : text.length;

    return {
      content: text.slice(startOffset, endOffset),
      startOffset
    };
  }

  private static normalizeYamlNodeRange(
    source: string,
    range: [number, number, number]
  ): { start: number; end: number } | undefined {
    let start = range[0];
    let end = range[1];

    if (start >= end) {
      return undefined;
    }

    let value = source.slice(start, end);
    const leadingWhitespace = value.match(/^\s*/)?.[0].length || 0;
    const trailingWhitespace = value.match(/\s*$/)?.[0].length || 0;

    start += leadingWhitespace;
    end -= trailingWhitespace;
    value = source.slice(start, end);

    if (
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      start += 1;
      end -= 1;
    }

    return start < end ? { start, end } : undefined;
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
