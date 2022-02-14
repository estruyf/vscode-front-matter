import { CollectionIcon, PlusIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';
import { JsonFieldRecord } from '.';
import { SortableContainer, SortEnd } from 'react-sortable-hoc';
export interface IJsonFieldRecordsProps {
  records: any[];
  selectedIndex: number | null;
  onAdd: () => void;
  onSort: (obj: SortEnd) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const Container = SortableContainer(({children}: React.PropsWithChildren<any>) => {
  return <ul>{children}</ul>;
});

export const JsonFieldRecords = ({ records, selectedIndex, onSort, onAdd, onEdit, onDelete }: React.PropsWithChildren<IJsonFieldRecordsProps>) => {

  if (!records || !records.length) {
    return null;
  }

  return (
    <div className='data_block__list'>
      <VsLabel>
        <div className={`metadata_field__label`} >
          <div>
            <CollectionIcon style={{ width: "16px", height: "16px" }} />
            <span style={{ lineHeight: "16px"}}>Records</span>
          </div>

          <button title='Add new record' className='data_block__list__button' onClick={onAdd}>
            <PlusIcon style={{ width: "16px", height: "16px" }} /> 
          </button>
        </div>
      </VsLabel>

      <Container onSortEnd={onSort} useDragHandle>
      {
        records.map((v: any, idx: number) => (
          <JsonFieldRecord 
            key={idx} 
            id={idx}
            index={idx}
            label={v?.dataType ?? 'Record'}
            isSelected={idx === selectedIndex}
            onEdit={onEdit}
            onDelete={onDelete}  /> 
        ))
      }
      </Container>
    </div>
  );
};