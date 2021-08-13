import { CancellationToken, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, Range, TextDocument, window, TextEditorDecorationType, Position } from 'vscode';
import { FrontMatterDecorationProvider } from './FrontMatterDecorationProvider';

export class MarkdownFoldingProvider implements FoldingRangeProvider {

  public async provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): Promise<FoldingRange[]> {
    const ranges: FoldingRange[] = [];

    const lines = document.getText().split('\n');
    let start: number | null = null;
    let end: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('---')) {
        if (i === 0 && start === null) {
          start = i;
        } else if (start !== null && end === null) {
          end = i;

          const range = new Range(new Position(start, 0), new Position(end, line.length));
          const decoration = new FrontMatterDecorationProvider().get();
          window.activeTextEditor?.setDecorations(decoration, [range]);

          ranges.push(new FoldingRange(start, end, FoldingRangeKind.Region));
          return ranges;
        }
      }
    }

    return ranges;
  }
}