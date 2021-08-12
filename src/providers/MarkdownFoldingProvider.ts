import { CancellationToken, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, TextDocument } from 'vscode';

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
          ranges.push(new FoldingRange(start, end, FoldingRangeKind.Region));
          return ranges;
        }
      }
    }
    return ranges;
  }
}