import { CollectionIcon, PlusIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';
import { DataBlockRecord } from '.';
import { SortableContainer, SortEnd } from 'react-sortable-hoc';
import { useCallback } from 'react';
import { FieldGroup } from '../../../models';
export interface IDataBlockRecordsProps {
  fieldGroups?: FieldGroup[];
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

export const DataBlockRecords = ({ fieldGroups, records, selectedIndex, onSort, onAdd, onEdit, onDelete }: React.PropsWithChildren<IDataBlockRecordsProps>) => {

  const getLabel = useCallback((record: any) => {
    if (record.fieldGroup) {
      if (fieldGroups) {
        const fieldGroup = fieldGroups.find(f => f.id === record.fieldGroup);
        if (fieldGroup && fieldGroup.labelField && record[fieldGroup.labelField]) {
          return record[fieldGroup.labelField];
        }
      }

      return record.fieldGroup;
    }
    
    return 'Block';
  }, []);

  if (!records || !records.length) {
    return null;
  }

  return (
    <div className='json_data__list'>
      <VsLabel>
        <div className={`metadata_field__label`} >
          <div>
            <CollectionIcon style={{ width: "16px", height: "16px" }} />
            <span style={{ lineHeight: "16px"}}>Records</span>
          </div>

          <button title='Add new record' className='json_data__list__button' onClick={onAdd}>
            <PlusIcon style={{ width: "16px", height: "16px" }} /> 
          </button>
        </div>
      </VsLabel>

      <Container onSortEnd={onSort} useDragHandle>
      {
        records.map((v: any, idx: number) => (
          <DataBlockRecord 
            key={idx} 
            id={idx}
            index={idx}
            label={getLabel(v)}
            isSelected={idx === selectedIndex}
            onEdit={onEdit}
            onDelete={onDelete}  /> 
        ))
      }
      </Container>
    </div>
  );
};