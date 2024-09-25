import * as React from 'react';
import useSelectedItems from '../../hooks/useSelectedItems';
import { Checkbox as VSCodeCheckbox } from 'vscrui';
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
        className={show ? "" : " shadow-[0_0_3px_var(--frontmatter-border-preserve)]"}
        onChange={() => {
          onMultiSelect(filePath);
        }}
        checked={selectedFiles.includes(filePath)} />
    </div>
  );
};