import * as React from 'react';
import useSelectedItems from '../../hooks/useSelectedItems';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { useMemo } from 'react';

export interface IItemSelectionProps {
  filePath: string;
  isRowItem?: boolean;
}

export const ItemSelection: React.FunctionComponent<IItemSelectionProps> = ({
  filePath,
  isRowItem
}: React.PropsWithChildren<IItemSelectionProps>) => {
  const { onMultiSelect, selectedFiles } = useSelectedItems();

  const cssNames = useMemo(() => {
    if (isRowItem) {
      return 'block';
    }
    return `${selectedFiles.includes(filePath) ? 'block' : 'hidden'} absolute top-2 left-2`;
  }, [isRowItem, selectedFiles]);

  return (
    <div className={`${cssNames} group-hover:block`}>
      <VSCodeCheckbox
        style={{
          boxShadow: isRowItem ? "" : "0 0 3px var(--frontmatter-border-preserve)"
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          onMultiSelect(filePath);
        }}
        checked={selectedFiles.includes(filePath)} />
    </div>
  );
};