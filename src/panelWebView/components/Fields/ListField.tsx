import { PencilIcon, TrashIcon, ViewListIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { BaseFieldProps } from '../../../models';
import { FieldTitle } from './FieldTitle';
import { RequiredMessage } from './RequiredMessage';

export interface IListFieldProps extends BaseFieldProps<string[] | null> {
  onChange: (value: string | string[]) => void;
}

export const ListField: React.FunctionComponent<IListFieldProps> = ({ label, value, required, onChange }: React.PropsWithChildren<IListFieldProps>) => {
  const [ text, setText ] = React.useState<string | null>("");
  const [ list, setList ] = React.useState<string[] | null>(null);
  const [ itemToEdit, setItemToEdit ] = React.useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const onTextChange = (txtValue: string) => {
    setText(txtValue);
  };

  const onSaveForm = useCallback(() => {
    if (itemToEdit !== null) {
      if (list && text) {
        const newList = [...(list || [])];
        newList[itemToEdit] = text;
        setList(newList);
        onChange(newList);
      }
    } else {
      if (text) {
        const newList = list ? [ ...list, text ] : [ text ];
        setList(newList);
        onChange(newList);
      }
    }
    
    onCancelForm();
  }, [list, text]);

  const onEdit = useCallback((index: number) => {
    setItemToEdit(index);
    setText(list ? list[index] : "");
    inputRef.current?.focus();
  }, [list]);

  const onCancelForm = useCallback(() => {
    setText("");
    setItemToEdit(null);
  }, []);

  const onDelete = useCallback((index: number) => {
    if (list) {
      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);
      onChange(newList);
    }
  }, [list]);

  const showRequiredState = useMemo(() => {
    return required && (!list || list?.length === 0);
  }, [required, list]);

  useEffect(() => {
    if (value) {
      if (typeof value === "string") {
        setList([value]);
      } else {
        setList(value);
      }
    }
  }, [value]);

  return (
    <div className={`list_field ${showRequiredState ? "required" : ""}`}>
      <FieldTitle 
        label={label}
        icon={<ViewListIcon />}
        required={required} />

      <input
        ref={inputRef}
        className={`metadata_field__input`}
        value={text || ""}
        onChange={(e) => onTextChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSaveForm();
          }
        }} />

      <RequiredMessage name={label} show={showRequiredState} />

      <div className={`list_field__form__buttons`}>
        <button 
          className={`list_field__form__button__save`} 
          title={`Save`}
          onClick={onSaveForm}
          disabled={!text}>
            {itemToEdit !== null ? `Update` : `Add`}
        </button>
        <button 
          className={`list_field__form__button__cancel`} 
          title={`Cancel`}
          onClick={onCancelForm}>
          Cancel
        </button>
      </div>

      <ul className='list_field__list'>
        {
          list && list.length > 0 && list.map((item, index) => (
            <li className='list_field__list__item' key={index}>
              <div>
                {item}
              </div>

              <div>
                <button title='Edit record' className='list_field__list__button list_field__list__button_edit' onClick={() => onEdit(index)}>
                  <PencilIcon className='list_field__list__button_icon' />
                  <span className='sr-only'>Edit</span>
                </button>
                <button title='Delete record' className='list_field__list__button list_field__list__button_delete' onClick={() => onDelete(index)}>
                  <TrashIcon className='list_field__list__button_icon' />
                  <span className='sr-only'>Delete</span>
                </button>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  );
};