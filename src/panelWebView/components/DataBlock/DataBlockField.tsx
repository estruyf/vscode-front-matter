import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { BlockFieldData, Field, FieldGroup, PanelSettings } from '../../../models';
import { PencilIcon } from '@heroicons/react/outline';
import { VsLabel } from '../VscodeComponents';
import { DataBlockRecords, DataBlockSelector } from '.';
import { SortEnd } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { IMetadata } from '../Metadata';

export interface IDataBlockFieldProps {
  label: string;
  settings: PanelSettings;
  field: Field;
  parentFields: string[];
  value: any;
  filePath: string;
  fieldsRenderer: (
    ctFields: Field[], 
    parent: IMetadata, 
    parentFields: string[], 
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void,
    parentBlock?: string | null
  ) => (JSX.Element | null)[] | undefined;
  onSubmit: (data: any) => void;
  parentBlock: string | null | undefined;
}

export const DataBlockField: React.FunctionComponent<IDataBlockFieldProps> = ({ label, filePath, settings, field, parentFields = [], value, fieldsRenderer, onSubmit, parentBlock }: React.PropsWithChildren<IDataBlockFieldProps>) => {
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
  const [ selectedGroup, setSelectedGroup ] = useState<FieldGroup | undefined | null>(null);
  const [ selectedBlockData, setSelectedBlockData ] = useState<any | null>(null);
  const [ hideSubBlock, setHideSubBlock ] = useState<boolean>(true);

  const SELECTION_STATE_KEY = useMemo(() => `${filePath}-data-selection-${field.name}`, [filePath, field.name]);
  const DATA_STATE_KEY = useMemo(() => `${filePath}-data-state-${field.name}`, [filePath, field.name]);

  const onFieldUpdate = useCallback((crntField: string | undefined, crntValue: any, parents: string[]) => {
    const dataClone: any[] = Object.assign([], value);

    if (!crntField) {
      return;
    }

    let data: any = {};
    if (selectedIndex !== null && selectedIndex !== undefined) {
      data = Object.assign({}, dataClone[selectedIndex]);
    }

    let parentObj: any = data;
    parentObj[crntField] = crntValue;


    if (selectedIndex !== null && selectedIndex !== undefined) {
      dataClone[selectedIndex] = {
        ...data,
        fieldGroup: selectedGroup?.id
      };
    } else {
      dataClone.push({
        ...data,
        fieldGroup: selectedGroup?.id
      });

      const newIndex = dataClone.length - 1;
      setSelectedIndex(newIndex);
      updateSelectionState(newIndex);
    }

    onSubmit(dataClone);
  }, [selectedGroup?.id, selectedIndex, value, onSubmit]);

  const deleteItem = useCallback((index: number) => {
    const dataClone: any[] = Object.assign([], value);

    if (!value) {
      return;
    }

    dataClone.splice(index, 1);
    onSubmit(dataClone);
    onAdd();
  }, [value, selectedIndex, onSubmit]);

  const onGroupChange = (group: FieldGroup | null | undefined) => {
    setSelectedGroup(group);

    if (!group) {
      // Clear the selected index
      onAdd();
    }
  }

  /**
   * Store the current state + show the form
   */
  const onShowForm = () => {
    const dataClone = Object.assign([], value);
    localStorage.setItem(DATA_STATE_KEY, JSON.stringify(dataClone));
    setHideSubBlock(false);
  };

  /**
   * Reset the state back to the state before editing
   */
  const onCancelForm = () => {
    const prevState = localStorage.getItem(DATA_STATE_KEY);
    if (prevState) {
      const dataClone = JSON.parse(prevState);
      onSubmit(dataClone);
    }
    setHideSubBlock(true);
    onAdd();
  };

  /**
   * Remove the previous state and hide the form
   */
  const onSaveForm = () => {
    localStorage.removeItem(DATA_STATE_KEY);
    setHideSubBlock(true);
    onAdd();
  };


  const onAdd = useCallback(() => {
    setSelectedIndex(null);
    setSelectedGroup(null);
    setSelectedBlockData({});

    updateSelectionState(undefined);
  }, [setSelectedIndex, setSelectedGroup, setSelectedBlockData]); 
  
  const onEdit = useCallback((index: number) => {
    updateSelectionState(index);
    setSelectedIndex(index);

    // Show the form
    onShowForm();

    const fieldData = value[index];
    if (index !== null && settings?.fieldGroups) {
      const fieldGroup = fieldData?.fieldGroup;
      const group = settings?.fieldGroups.find(group => group.id === fieldGroup);
      setSelectedGroup(group);
      setSelectedBlockData(fieldData);
    }
  }, [setSelectedIndex, setSelectedBlockData, value]);

  const onSort = useCallback(({ oldIndex, newIndex }: SortEnd) => {
    if (!value || value.length === 0) {
      return null;
    }

    if (selectedIndex !== null && selectedIndex !== undefined) {
      setSelectedIndex(newIndex);
    }

    const newEntries = arrayMoveImmutable(value, oldIndex, newIndex);
    onSubmit(newEntries);
  }, [value, selectedIndex]);

  // Retrieving the state from local storage (does not need to be persistent)
  const retrieveSelectionState = useCallback(() => {
    const prevState = localStorage.getItem(SELECTION_STATE_KEY);
    const prevStateValue = prevState ? parseInt(prevState) : null;
    return prevStateValue === null || isNaN(prevStateValue) ? undefined : prevStateValue;
  }, [SELECTION_STATE_KEY]);

  // Storing the state to local storage (does not need to be persistent)
  const updateSelectionState = useCallback((value: number | undefined) => {
    localStorage.setItem(SELECTION_STATE_KEY, value as any);
  }, [SELECTION_STATE_KEY]);

  useEffect(() => {
    if (selectedIndex !== null) {
      const fieldData = value[selectedIndex];
      setSelectedBlockData(fieldData);
    }
  } , [selectedIndex, value, setSelectedBlockData]);

  useEffect(() => {
    if (parentBlock) {
      onAdd();
    }
  }, [parentBlock]);
  
  useEffect(() => {
    const stateIdx = retrieveSelectionState();
    if (stateIdx !== undefined) {
      onEdit(stateIdx);
    }
  }, []);

  if (parentBlock === null) {
    return null;
  }
  
  return (
    <div className='block_field'>

      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      {
        (!hideSubBlock) ? (
          <div className='block_field__form'>
            <h3>
              {
                selectedGroup?.id ? (
                  selectedIndex !== null ? `Editing: ${selectedGroup.id} ${selectedIndex + 1}` : `Create a new ${selectedGroup?.id}`
                ) : (
                  `Select a group`
                )
              }
            </h3>

            <DataBlockSelector
              field={field}
              selectedGroup={selectedGroup?.id}
              fieldGroups={settings.fieldGroups}
              onGroupChange={onGroupChange} />

            { 
              selectedGroup?.fields && (
                fieldsRenderer(
                  selectedGroup?.fields, 
                  selectedBlockData || {}, 
                  [...parentFields, field.name], 
                  {
                    parentFields: [...parentFields, field.name],
                    blockType: selectedGroup?.id || undefined,
                    selectedIndex: selectedIndex === null ? undefined : selectedIndex
                  }, 
                  onFieldUpdate,
                  selectedIndex === null ? null : `${field.name}-${selectedGroup?.id}-${selectedIndex}`
                ) 
              )
            }

            <div className={`block_field__form__buttons`}>
              <button 
                className={`block_field__form__button__save`} 
                title={`Save`} 
                onClick={onSaveForm}>Save</button>
              <button 
                className={`block_field__form__button__cancel`} 
                title={`Cancel`} 
                onClick={onCancelForm}>Cancel</button>
            </div>
          </div>
        ) : (
          <button title={`Add ${field.name}`} onClick={onShowForm}>Add {field.name}</button>
        )
      }

      <DataBlockRecords
        fieldGroups={settings.fieldGroups}
        records={value}
        selectedIndex={selectedIndex}
        onAdd={onAdd}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={deleteItem} />
    </div>
  );
};