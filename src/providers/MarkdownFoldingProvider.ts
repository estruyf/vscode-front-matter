import { workspace } from 'vscode';
import { CancellationToken, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, Range, TextDocument, window, Position } from 'vscode';
import { CONFIG_KEY, SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT } from '../constants';
import { FrontMatterDecorationProvider } from './FrontMatterDecorationProvider';

export class MarkdownFoldingProvider implements FoldingRangeProvider {
  private static start: number | null = null;
  private static end: number | null = null;
  private static endLine: number | null = null;

  public async provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): Promise<FoldingRange[]> {
    const ranges: FoldingRange[] = [];

    const lines = document.getText().split('\n');
    let start: number | null = null;
    let end: number | null = null;

    MarkdownFoldingProvider.start = null;
    MarkdownFoldingProvider.end = null;
    MarkdownFoldingProvider.endLine = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('---')) {
        if (i === 0 && start === null) {
          start = i;
          MarkdownFoldingProvider.start = start;
        } else if (start !== null && end === null) {
          end = i;
          MarkdownFoldingProvider.end = end;
          MarkdownFoldingProvider.endLine = line.length;

          MarkdownFoldingProvider.triggerHighlighting();

          ranges.push(new FoldingRange(start, end, FoldingRangeKind.Region));
          return ranges;
        }
      }
    }

    return ranges;
  }

  public static triggerHighlighting() {
    const config = workspace.getConfiguration(CONFIG_KEY);
    const fmHighlight = config.get<boolean>(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT);

    if (MarkdownFoldingProvider.start !== null && MarkdownFoldingProvider.end !== null && MarkdownFoldingProvider.endLine !== null) {
      const range = new Range(new Position(MarkdownFoldingProvider.start, 0), new Position(MarkdownFoldingProvider.end, MarkdownFoldingProvider.endLine));

      if (fmHighlight) {
        const decoration = new FrontMatterDecorationProvider().get();
        window.activeTextEditor?.setDecorations(decoration, [range]);
      }
    }
  }
}