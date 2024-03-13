import { CircleStackIcon, PlusIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { JsonFieldRecord } from '.';
import { SortableContainer, SortEnd } from 'react-sortable-hoc';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { VSCodeLabel } from '../VSCode';

export interface IJsonFieldRecordsProps {
  records: any[];
  selectedIndex: number | null;
  onAdd: () => void;
  onSort: (obj: SortEnd) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const Container = SortableContainer(({ children }: React.PropsWithChildren<any>) => {
  return <ul>{children}</ul>;
});

export const JsonFieldRecords = ({
  records,
  selectedIndex,
  onSort,
  onAdd,
  onEdit,
  onDelete
}: React.PropsWithChildren<IJsonFieldRecordsProps>) => {
  if (!records || !records.length) {
    return null;
  }

  return (
    <div className="json_data__list">
      <VSCodeLabel>
        <div className={`metadata_field__label`}>
          <div>
            <CircleStackIcon style={{ width: '16px', height: '16px' }} />
            <span style={{ lineHeight: '16px' }}>Records</span>
          </div>

          <button title={l10n.t(LocalizationKey.commonAdd)} className="json_data__list__button" onClick={onAdd}>
            <PlusIcon style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </VSCodeLabel>

      <Container onSortEnd={onSort} useDragHandle>
        {records.map((v: any, idx: number) => (
          <JsonFieldRecord
            key={idx}
            id={idx}
            index={idx}
            label={v?.dataType ?? 'Record'}
            isSelected={idx === selectedIndex}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Container>
    </div>
  );
};
