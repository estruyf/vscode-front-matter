import Ajv from 'ajv';
import * as React from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { AutoFields, AutoForm, ErrorsField } from '../../../components/uniforms-frontmatter';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { Field, PanelSettings } from '../../../models';
import { DataCollectionControls } from './DataCollectionControls';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { VsLabel } from '../VscodeComponents';

export interface IDataCollectionFieldProps {
  label: string;
  settings: PanelSettings;
  field: Field;
  value: any;
  onSubmit: (data: any) => void;
}

export const DataCollectionField: React.FunctionComponent<IDataCollectionFieldProps> = ({ label, settings, field, value, onSubmit }: React.PropsWithChildren<IDataCollectionFieldProps>) => {
  const [ schema, setSchema ] = useState<JSONSchemaBridge | null>(null);
  const [ bridge, setBridge ] = useState<JSONSchemaBridge | null>(null);
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);

  const ajv = new Ajv({ allErrors: true, useDefaults: true });

  const jsonValidator = (schema: object) => {
    const validator = ajv.compile(schema);

    return (crntModel: object) => {
      validator(crntModel);
      return validator.errors?.length ? { details: validator.errors } : null;
    };
  };

  useEffect(() => {
    if (schema) {
      const schemaValidator = jsonValidator(schema);
      const bridge = new JSONSchemaBridge(schema, schemaValidator);
      setBridge(bridge);
    }
  }, [schema]);

  useEffect(() => {
    if (field?.dataType && settings.dataTypes) {
      const crntSchema = settings.dataTypes.find(dataType => dataType.id === field.dataType);
      if (crntSchema?.schema) {
        setSchema(crntSchema.schema);
      }
    }
  }, [settings?.dataTypes, field?.dataType]);

  const model = useMemo(() => (value && selectedIndex !== null && selectedIndex !== undefined) ? value[selectedIndex] : null, [value, selectedIndex]);

  const onUpdate = useCallback((data: any) => {
    const dataClone: any[] = Object.assign([], value);
    if (selectedIndex !== null && selectedIndex !== undefined) {
      dataClone[selectedIndex] = data;
    } else {
      dataClone.push(data);
    }
    onSubmit(dataClone);
  }, [value, selectedIndex, onSubmit]);

  const deleteItem = useCallback((index: number) => {
    const dataClone: any[] = Object.assign([], value);

    if (!value) {
      return;
    }

    dataClone.splice(index, 1);
    onSubmit(dataClone);
  }, [value, selectedIndex, onSubmit]);

  if (!bridge) {
    return null;
  }
  
  return (
    <div className='data_collection__field'>

      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      <div className='autoform'>
        <AutoForm 
          schema={bridge} 
          model={model || {}}
          onSubmit={onUpdate}
          ref={form => form?.reset()}>
          {
            (model && selectedIndex !== null) && (
              <h3>Editing: Record {selectedIndex + 1}</h3>
            )
          }

          <div className={`fields`}>
            <AutoFields />
          </div>
          
          <div className={`errors`}>
            <ErrorsField />
          </div>

          <DataCollectionControls model={model} onClear={() => setSelectedIndex(null)} />
        </AutoForm>
      </div>

      {
        value && (
          <div className='data_collection__list'>
            <label>Data</label>
            <ul>
            {
              value.map((v: any, i: number) => (
                <li key={i}>
                  <span>Record {i+1}</span>

                  <button className='data_collection__list__button data_collection__list__button_edit' onClick={() => setSelectedIndex(i)}>
                    <PencilIcon className='data_collection__list__button_icon' />
                    <span className='sr-only'>Edit</span>
                  </button>
                  <button className='data_collection__list__button data_collection__list__button_delete' onClick={() => deleteItem(i)}>
                    <TrashIcon className='data_collection__list__button_icon' />
                    <span className='sr-only'>Delete</span>
                  </button>
                </li>
              ))
            }
            </ul>
          </div>
        )
      }
    </div>
  );
};