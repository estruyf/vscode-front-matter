import { PencilIcon, SelectorIcon, XIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { SortableHandle, SortableElement } from 'react-sortable-hoc';
import { Alert } from '../Modals/Alert';

export interface ISortableItemProps {
  value: string;
  index: number;
  crntIndex: number;
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
  onDeleteItem: (index: number) => void;
}

const DragHandle = SortableHandle(() => <SelectorIcon className={`w-6 h-6 cursor-move`} />);

export const SortableItem = SortableElement(({ value, selectedIndex, crntIndex, onSelectedIndexChange, onDeleteItem }: ISortableItemProps) => {
  const [ showAlert, setShowAlert ] = React.useState(false);

  const deleteItemConfirm = () => {
    setShowAlert(true);
  };
  
  return (
    <>
      <li data-test={`${selectedIndex}-${crntIndex}`} className={`py-2 px-2 w-full flex justify-between content-center hover:bg-gray-200 dark:hover:bg-vulcan-400 ${selectedIndex === crntIndex ? `bg-gray-300 dark:bg-vulcan-300` : ``}`}>
        <div className='flex items-center'>
          <DragHandle />
          <span>{value}</span>
        </div>
        
        <div className={`space-x-2 flex items-center`}>
          <button 
            type='button' 
            className={`text-gray-500 dark:text-whisper-900 hover:text-gray-600 dark:hover:text-whisper-500`}
            title={`Edit "${value}"`}
            onClick={() => onSelectedIndexChange(crntIndex)}>
            <PencilIcon className='w-4 h-4' />
            <span className='sr-only'>Edit</span>
          </button>
          <button 
            type='button' 
            className={`text-gray-500 dark:text-whisper-900 hover:text-gray-600 dark:hover:text-whisper-500`}
            title={`Delete "${value}"`}
            onClick={() => deleteItemConfirm()}>
            <XIcon className='w-4 h-4' />
            <span className='sr-only'>Delete</span>
          </button>
        </div>
      </li>

      {
        showAlert && (
          <Alert 
            title={`Delete data entry`}
            description={`Are you sure you want to delete the data entry?`}
            okBtnText={`Delete`}
            cancelBtnText={`Cancel`}
            dismiss={() => setShowAlert(false)}
            trigger={() => onDeleteItem(crntIndex)} />
        )
      }
    </>
  );
});