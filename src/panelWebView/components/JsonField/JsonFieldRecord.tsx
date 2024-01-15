import * as React from 'react';
import { PencilIcon, ChevronUpDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SortableHandle, SortableElement } from 'react-sortable-hoc';
export interface IJsonFieldRecordProps {
  id: number;
  index: number;
  label: string;
  isSelected?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DragHandle = SortableHandle(() => (
  <span className="drag_handler">
    <ChevronUpDownIcon />
  </span>
));

export const JsonFieldRecord = SortableElement(
  ({ label, id, onEdit, onDelete, isSelected }: React.PropsWithChildren<IJsonFieldRecordProps>) => {
    return (
      <li className={`json_data__record ${isSelected ? `json_data__record_selected` : ``}`}>
        <div>
          <DragHandle />

          <span>
            {label} - {id + 1}
          </span>
        </div>

        <div>
          <button
            title="Edit record"
            className="json_data__list__button json_data__list__button_edit"
            onClick={() => onEdit(id)}
          >
            <PencilIcon className="json_data__list__button_icon" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            title="Delete record"
            className="json_data__list__button json_data__list__button_delete"
            onClick={() => onDelete(id)}
          >
            <TrashIcon className="json_data__list__button_icon" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </li>
    );
  }
);
