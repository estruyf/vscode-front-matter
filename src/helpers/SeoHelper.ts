import * as vscode from 'vscode';
import { ArticleHelper } from '.';
import { ParsedFrontMatter } from '../parsers';
import { EXTENSION_NAME } from '../constants';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class SeoHelper {
  public static checkLength(
    editor: vscode.TextEditor,
    collection: vscode.DiagnosticCollection,
    article: ParsedFrontMatter,
    fieldName: string,
    length: number
  ) {
    const value = article.data[fieldName];
    if (value.length > length) {
      const text = editor.document.getText();

      const markdown = ArticleHelper.stringifyFrontMatter('', article.data);

      const txtIdx = text.indexOf(value);
      if (txtIdx !== -1 && txtIdx < markdown.length) {
        const posStart = editor.document.positionAt(txtIdx);
        const posEnd = editor.document.positionAt(txtIdx + 1 + value.length);

        const diagnostic: vscode.Diagnostic = {
          code: '',
          message: l10n.t(
            LocalizationKey.helpersSeoHelperCheckLengthDiagnosticMessage,
            fieldName,
            length,
            value.length
          ),
          range: new vscode.Range(posStart, posEnd),
          severity: vscode.DiagnosticSeverity.Warning,
          source: EXTENSION_NAME
        };

        if (collection.has(editor.document.uri)) {
          const otherDiag = collection.get(editor.document.uri) || [];
          collection.set(editor.document.uri, [...otherDiag, diagnostic]);
        } else {
          collection.set(editor.document.uri, [diagnostic]);
        }
      }
    }
  }
}
