import * as React from 'react';
import { PencilIcon, SelectorIcon, TrashIcon } from '@heroicons/react/outline';
import {  SortableHandle, SortableElement } from 'react-sortable-hoc';
export interface IDataBlockRecordProps {
  id: number;
  index: number;
  label: string;
  isSelected?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DragHandle = SortableHandle(() => <span className='drag_handler'><SelectorIcon /></span>);

export const DataBlockRecord = SortableElement(({ label, id, onEdit, onDelete, isSelected }: React.PropsWithChildren<IDataBlockRecordProps>) => {
  return (
    <li className={`json_data__record ${isSelected ? `json_data__record_selected` : ``}`}>
      <div>
        <DragHandle />

        <span>{label} - {id+1}</span>
      </div>

      <div>
        <button title='Edit record' className='json_data__list__button json_data__list__button_edit' onClick={() => onEdit(id)}>
          <PencilIcon className='json_data__list__button_icon' />
          <span className='sr-only'>Edit</span>
        </button>
        <button title='Delete record' className='json_data__list__button json_data__list__button_delete' onClick={() => onDelete(id)}>
          <TrashIcon className='json_data__list__button_icon' />
          <span className='sr-only'>Delete</span>
        </button>
      </div>
    </li>
  );
});