import { ArticleHelper } from '../helpers';
import { languages, TextEditorDecorationType } from 'vscode';
import { CancellationToken, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, Range, TextDocument, window, Position } from 'vscode';
import { SETTING_CONTENT_FRONTMATTER_HIGHLIGHT, SETTING_CONTENT_SUPPORTED_FILETYPES, SETTING_FRONTMATTER_TYPE } from '../constants';
import { Settings } from '../helpers';
import { FrontMatterDecorationProvider } from './FrontMatterDecorationProvider';
import { FrontMatterParser } from '../parsers';

export class MarkdownFoldingProvider implements FoldingRangeProvider {
  private static start: number | null = null;
  private static end: number | null = null;
  private static endLine: number | null = null;
  private static decType: TextEditorDecorationType | null = null;

  public static register() {
    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES);

    languages.registerFoldingRangeProvider({ language: 'markdown', scheme: 'file' }, new MarkdownFoldingProvider());

    for (const fileExt of (supportedFiles || [])) {
      if (fileExt !== "md" && fileExt !== "markdown") {
        languages.registerFoldingRangeProvider({ pattern: `**/*.${fileExt}`, scheme: 'file' }, new MarkdownFoldingProvider());
      }
    }
  }

  public async provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): Promise<FoldingRange[]> {
    const ranges: FoldingRange[] = [];

    const range = MarkdownFoldingProvider.getFrontMatterRange(document);
    if (range) {
      MarkdownFoldingProvider.triggerHighlighting();

      ranges.push(new FoldingRange(range.start.line, range.end.line, FoldingRangeKind.Region));
    }

    return ranges;
  }

  public static triggerHighlighting() {
    const activeDoc = window.activeTextEditor?.document;

    const isSupported = ArticleHelper.isSupportedFile(activeDoc);
    if (isSupported) {
      const fmHighlight = Settings.get<boolean>(SETTING_CONTENT_FRONTMATTER_HIGHLIGHT);

      const range = MarkdownFoldingProvider.getFrontMatterRange();

      if (range) {
        if (MarkdownFoldingProvider.decType !== null) {
          MarkdownFoldingProvider.decType.dispose();
        }

        if (fmHighlight) {
          MarkdownFoldingProvider.decType = new FrontMatterDecorationProvider().get();
          window.activeTextEditor?.setDecorations(MarkdownFoldingProvider.decType, [range]);
        }
      }
    }
  }

  /**
   * Retrieve the range of the current Front Matter page
   * @param document 
   * @returns 
   */
  public static getFrontMatterRange(document?: TextDocument) {
    const content = document?.getText();
    const language = FrontMatterParser.getLanguageFromContent(content);

    let lineStart = "---";
    let lineEnd = lineStart;

    if (language.toLowerCase() === "toml") {
      lineStart = "+++";
      lineEnd = lineStart;
    } else if (language.toLowerCase() === "json") {
      lineStart = "{";
      lineEnd = "}";
    }

    if (content) {
      const lines = content.split('\n');

      let start = null;
      let end = null;
      let endLine = null;

      MarkdownFoldingProvider.start = null;
      MarkdownFoldingProvider.end = null;
      MarkdownFoldingProvider.endLine = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith(lineStart) || line.startsWith(lineEnd)) {
          if (i === 0 && start === null) {
            start = i;
            MarkdownFoldingProvider.start = start;
          } else if (start !== null && end === null) {
            end = i;
            endLine = line.length;

            MarkdownFoldingProvider.end = end;
            MarkdownFoldingProvider.endLine = endLine;  

            MarkdownFoldingProvider.triggerHighlighting();

            return new Range(new Position(start, 0), new Position(end, endLine));
          }
        }
      }
    }

    if (MarkdownFoldingProvider.start !== null && MarkdownFoldingProvider.end !== null && MarkdownFoldingProvider.endLine !== null) {
      const range = new Range(new Position(MarkdownFoldingProvider.start, 0), new Position(MarkdownFoldingProvider.end, MarkdownFoldingProvider.endLine));

      return range;
    }

    return null;
  }
}