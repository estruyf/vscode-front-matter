import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { BlockFieldData, Field, FieldGroup, PanelSettings } from '../../../models';
import { PencilIcon } from '@heroicons/react/outline';
import { VsLabel } from '../VscodeComponents';
import { DataBlockRecords, DataBlockSelector } from '.';
import { SortEnd } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { IMetadata } from '../Metadata';
import { MessageHelper } from '../../../helpers/MessageHelper';

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
    parentFields?: string[], 
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void
  ) => (JSX.Element | null)[] | undefined
  onSubmit: (data: any) => void;
}

export const DataBlockField: React.FunctionComponent<IDataBlockFieldProps> = ({ label, filePath, settings, field, parentFields = [], value, fieldsRenderer, onSubmit }: React.PropsWithChildren<IDataBlockFieldProps>) => {
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
  const [ selectedGroup, setSelectedGroup ] = useState<FieldGroup | undefined | null>(null);
  const [ selectedBlockData, setSelectedBlockData ] = useState<any | null>(null);

  const stateKey = useMemo(() => `${filePath}-data_block-${field.name}`, [filePath, field.name]);

  const onFieldUpdate = useCallback((crntField: string | undefined, crntValue: any, parents: string[]) => {
    const dataClone: any[] = Object.assign([], value);

    if (!crntField) {
      return;
    }

    if (selectedIndex !== null && selectedIndex !== undefined) {
      const data = Object.assign({}, dataClone[selectedIndex]);

      let parentObj: any = data;
      if (parents.length > 1) {
        parents.shift();
        for (const parent of parents) {
          if (!data[parent]) {
            data[parent] = {};
          }

          parentObj = data[parent];
        }
      }

      parentObj[crntField] = crntValue;

      dataClone[selectedIndex] = {
        ...data,
        fieldGroup: selectedGroup?.id
      };
    } else {
      const data: any = {};
      let parentObj: any = data;
      if (parents.length > 1) {
        parents.shift();
        for (const parent of parents) {
          data[parent] = {};
          parentObj = data[parent];
        }
      }

      parentObj[crntField] = crntValue;

      dataClone.push({
        ...data,
        fieldGroup: selectedGroup?.id
      });

      const newIndex = dataClone.length - 1;
      setSelectedIndex(newIndex);
      updateState(newIndex);
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
  }, [value, selectedIndex, onSubmit]);

  const onGroupChange = (group: FieldGroup | null | undefined) => {
    setSelectedGroup(group);

    if (!group) {
      // Clear the selected index
      onAdd();
    }
  }

  const onAdd = useCallback(() => {
    setSelectedIndex(null);
    setSelectedGroup(null);
    setSelectedBlockData({});

    updateState(undefined);
  }, [setSelectedIndex, setSelectedGroup, setSelectedBlockData]); 
  
  const onEdit = useCallback((index: number) => {
    updateState(index);

    setSelectedIndex(index);

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
  const retrieveState = useCallback(() => {
    const prevState = localStorage.getItem(stateKey);
    return prevState ? parseInt(prevState) : undefined;
  }, [stateKey]);

  // Storing the state to local storage (does not need to be persistent)
  const updateState = useCallback((value: number | undefined) => {
    localStorage.setItem(stateKey, value as any);
  }, [stateKey]);

  useEffect(() => {
    if (selectedIndex !== null) {
      const fieldData = value[selectedIndex];
      setSelectedBlockData(fieldData);
    }
  } , [selectedIndex, value, setSelectedBlockData]);

  useEffect(() => {
    const stateIdx = retrieveState();
    if (stateIdx !== undefined) {
      onEdit(stateIdx);
    }
  }, []);
  
  return (
    <div className='json_data__field'>

      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      <DataBlockSelector
        field={field}
        selectedGroup={selectedGroup?.id}
        fieldGroups={settings.fieldGroups}
        onGroupChange={onGroupChange} />

      {
        selectedGroup?.fields && (
          <div className='block_field__form'>
            <h3>
              {selectedIndex !== null ? `Editing: ${selectedGroup.id} ${selectedIndex + 1}` : `Create a new ${selectedGroup?.id}`}
            </h3>

            { 
              fieldsRenderer(
                selectedGroup?.fields, 
                selectedBlockData || {}, 
                [...parentFields, field.name], 
                {
                  parentFields: [...parentFields, field.name],
                  blockType: selectedGroup?.id || undefined,
                  selectedIndex: selectedIndex === null ? undefined : selectedIndex
                }, 
                onFieldUpdate
              ) 
            }
          </div>
        )
      }

      <DataBlockRecords
        records={value}
        selectedIndex={selectedIndex}
        onAdd={onAdd}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={deleteItem} />
    </div>
  );
};