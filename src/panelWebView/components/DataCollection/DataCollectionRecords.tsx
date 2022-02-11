import { CollectionIcon, PlusIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';
import { DataCollectionRecord } from './DataCollectionRecord';

export interface IDataCollectionRecordsProps {
  records: any[];
  onAdd: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DataCollectionRecords: React.FunctionComponent<IDataCollectionRecordsProps> = ({ records, onAdd, onEdit, onDelete }: React.PropsWithChildren<IDataCollectionRecordsProps>) => {

  if (!records || !records.length) {
    return null;
  }

  return (
    <div className='data_collection__list'>
      <VsLabel>
        <div className={`metadata_field__label`} >
          <div>
            <CollectionIcon style={{ width: "16px", height: "16px" }} />
            <span style={{ lineHeight: "16px"}}>Records</span>
          </div>

          <button title='Add new record' className='data_collection__list__button' onClick={onAdd}>
            <PlusIcon style={{ width: "16px", height: "16px" }} /> 
          </button>
        </div>
      </VsLabel>

      <ul>
      {
        records.map((v: any, i: number) => (
          <DataCollectionRecord 
            key={i} 
            id={i} 
            onEdit={onEdit}
            onDelete={onDelete}  /> 
        ))
      }
      </ul>
    </div>
  );
};