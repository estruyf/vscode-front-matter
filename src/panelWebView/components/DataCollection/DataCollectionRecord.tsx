import * as React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';

export interface IDataCollectionRecordProps {
  id: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DataCollectionRecord: React.FunctionComponent<IDataCollectionRecordProps> = ({ id, onEdit, onDelete }: React.PropsWithChildren<IDataCollectionRecordProps>) => {
  return (
    <li>
      <span>Record {id+1}</span>

      <div>
        <button title='Edit record' className='data_collection__list__button data_collection__list__button_edit' onClick={() => onEdit(id)}>
          <PencilIcon className='data_collection__list__button_icon' />
          <span className='sr-only'>Edit</span>
        </button>
        <button title='Delete record' className='data_collection__list__button data_collection__list__button_delete' onClick={() => onDelete(id)}>
          <TrashIcon className='data_collection__list__button_icon' />
          <span className='sr-only'>Delete</span>
        </button>
      </div>
    </li>
  );
};