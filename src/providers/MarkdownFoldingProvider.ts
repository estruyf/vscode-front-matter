import { SETTING_CONTENT_HIDE_FRONTMATTER, SETTING_CONTENT_HIDE_FRONTMATTER_MESSAGE } from './../constants/settings';
import { ThemeColor } from 'vscode';
import { ArticleHelper } from '../helpers';
import { commands, DecorationOptions, languages, TextEditorDecorationType } from 'vscode';
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
  private static crntDecoration: TextEditorDecorationType | null = null;

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

  public static triggerHighlighting(configChange: boolean = false) {
    const activeDoc = window.activeTextEditor?.document;

    if (configChange && this.crntDecoration) {
      this.resetDecoration();
    }

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

      const hideFrontMatter = Settings.get<boolean>(SETTING_CONTENT_HIDE_FRONTMATTER);
      if (hideFrontMatter) {
        this.hideFrontMatterFromDocument(range);
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

  /**
   * Hide the front matter on the page
   * @param range 
   * @returns 
   */
  private static hideFrontMatterFromDocument = async (range: Range| null) => {
  
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
  
    const decorators: DecorationOptions[] = [];
    
    if (range) {
      decorators.push({
        range: range
      });
    }

    if (!this.crntDecoration) {
      this.crntDecoration = this.getHiddenDecoration();
    }

    editor.setDecorations(
      this.crntDecoration,
      decorators
    );
  
    commands.executeCommand('editor.fold', {selectionLines: [range?.start.line],direction: "up"});
  }

  /**
   * Resets the decoration in the document
   * @returns 
   */
  private static resetDecoration() {
    if (!this.crntDecoration) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    editor.setDecorations(
      this.crntDecoration,
      []
    );

    this.crntDecoration = null;
  }

  /**
   * Retrieve the hidden decoration for the text to hide
   * @returns 
   */
  private static getHiddenDecoration(): TextEditorDecorationType {
    const contentText = Settings.get<string>(SETTING_CONTENT_HIDE_FRONTMATTER_MESSAGE);

    return window.createTextEditorDecorationType({
      after: {
        contentText,
        fontStyle: 'italic',
        color: new ThemeColor('editorInfo.foreground'),
      },
      textDecoration: "none; display: none;"
    });
  }
}