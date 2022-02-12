import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Field, PanelSettings } from '../../../models';
import { PencilIcon } from '@heroicons/react/outline';
import { VsLabel } from '../VscodeComponents';
import { DataBlockRecords, DataBlockForm, DataBlockSelector } from '.';
import { SortEnd } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

export interface IDataBlockFieldProps {
  label: string;
  settings: PanelSettings;
  field: Field;
  value: any;
  onSubmit: (data: any) => void;
}

export const DataBlockField: React.FunctionComponent<IDataBlockFieldProps> = ({ label, settings, field, value, onSubmit }: React.PropsWithChildren<IDataBlockFieldProps>) => {
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
  const [ selectedDataType, setSelectedDataType ] = useState<string | null>(null);
  const [ selectedSchema, setSelectedSchema ] = useState<any | null>(null);

  const onUpdate = useCallback((data: any) => {
    const dataClone: any[] = Object.assign([], value);
    if (selectedIndex !== null && selectedIndex !== undefined) {
      dataClone[selectedIndex] = {
        ...data,
        blockType: selectedSchema?.id
      };
    } else {
      dataClone.push({
        ...data,
        blockType: selectedSchema?.id
      });
    }
    onSubmit(dataClone);
  }, [value, selectedIndex, onSubmit, selectedSchema]);

  const deleteItem = useCallback((index: number) => {
    const dataClone: any[] = Object.assign([], value);

    if (!value) {
      return;
    }

    dataClone.splice(index, 1);
    onSubmit(dataClone);
  }, [value, selectedIndex, onSubmit]);

  const onSetDataType = (dataType: string | null) => {
    setSelectedDataType(dataType);

    if (!dataType) {
      setSelectedIndex(null);
      setSelectedSchema(null);
    }
  }

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

  const model = useMemo(() => (value && selectedIndex !== null && selectedIndex !== undefined) ? value[selectedIndex] : null, [value, selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== null && settings?.dataTypes) {
      const blockType = model["blockType"];
      const schema = settings?.dataTypes.find(dataType => dataType.id === blockType);
      setSelectedSchema(schema);
      setSelectedDataType(blockType);
    }
  }, [selectedIndex, model, settings?.dataTypes]);
  
  return (
    <div className='data_block__field'>

      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      <DataBlockSelector
        field={field}
        selectedDataType={selectedDataType}
        dataTypes={settings.dataTypes}
        onSetDataType={onSetDataType}
        onSchemaUpdate={setSelectedSchema} />

      <DataBlockForm
        label={(model && selectedIndex !== null) ? `Editing: Record ${selectedIndex + 1}` : `Create a new ${selectedSchema?.id}`}
        model={model}
        schema={selectedSchema?.schema}
        onUpdate={onUpdate}
        onClear={() => setSelectedIndex(null)} />

      <DataBlockRecords
        records={value}
        selectedIndex={selectedIndex}
        onAdd={() => setSelectedIndex(null)}
        onSort={onSort}
        onEdit={(index: number) => setSelectedIndex(index)}
        onDelete={deleteItem} />
    </div>
  );
};