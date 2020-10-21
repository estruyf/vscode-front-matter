import * as vscode from 'vscode';
import { ArticleHelper } from '.';
import matter = require('gray-matter');

export class SeoHelper {

  public static checkLength(editor: vscode.TextEditor, collection: vscode.DiagnosticCollection, article: matter.GrayMatterFile<string>, fieldName: string, length: number) {
    const value = article.data[fieldName];
    if (value.length > length) {
      const text = editor.document.getText();
      
      const markdown = ArticleHelper.stringifyFrontMatter("", article.data);

      const txtIdx = text.indexOf(value);
      if (txtIdx !== -1 && txtIdx < markdown.length) {
        const posStart = editor.document.positionAt(txtIdx);
        const posEnd = editor.document.positionAt(txtIdx + 1 + value.length);

        const diagnostic: vscode.Diagnostic = {
          code: '',
          message: `Article ${fieldName} is longer than ${length} characters (current length: ${value.length}). For SEO reasons, it would be better to make it less than ${length} characters.`,
          range: new vscode.Range(posStart, posEnd),
          severity: vscode.DiagnosticSeverity.Warning,
          source: 'Front Matter'
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