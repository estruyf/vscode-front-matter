import * as React from 'react';
import useSelectedItems from '../../hooks/useSelectedItems';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { useMemo } from 'react';

export interface IItemSelectionProps {
  filePath: string;
  show?: boolean;
}

export const ItemSelection: React.FunctionComponent<IItemSelectionProps> = ({
  filePath,
  show
}: React.PropsWithChildren<IItemSelectionProps>) => {
  const { onMultiSelect, selectedFiles } = useSelectedItems();

  const cssNames = useMemo(() => {
    if (show) {
      return 'block';
    }
    return `${selectedFiles.includes(filePath) ? 'block' : 'hidden'} absolute top-2 left-2`;
  }, [show, selectedFiles]);

  return (
    <div className={`${cssNames} group-hover:block`}>
      <VSCodeCheckbox
        style={{
          boxShadow: show ? "" : "0 0 3px var(--frontmatter-border-preserve)"
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          onMultiSelect(filePath);
        }}
        checked={selectedFiles.includes(filePath)} />
    </div>
  );
};