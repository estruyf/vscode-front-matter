import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Field } from '../../../models';
import { DataType } from '../../../models/DataType';

export interface IDataBlockSelectorProps {
  field: Field;
  dataTypes: DataType[] | undefined;
  selectedDataType: string | null;
  onSetDataType: (dataType: string | null) => void;
  onSchemaUpdate: (schema: any) => void;
}

const EMPTY_OPTION = "EMPTY_OPTION";

export const DataBlockSelector: React.FunctionComponent<IDataBlockSelectorProps> = ({ field, dataTypes, selectedDataType, onSetDataType, onSchemaUpdate }: React.PropsWithChildren<IDataBlockSelectorProps>) => {
  const [ options, setOptions ] = useState<string[]>([]);

  const onSchemaSet = useCallback((blockType: string) => {
    if (dataTypes && blockType !== EMPTY_OPTION) {
      const schema = dataTypes.find(dataType => dataType.id === blockType);
      onSchemaUpdate(schema);
    } else {
      onSchemaUpdate(null);
    }
  }, []);

  useEffect(() => {
    if (field.blockType && dataTypes) {
      if (typeof field.blockType === "string") {
        onSchemaSet(field.blockType);
      } else if (field.blockType instanceof Array && field.blockType.length === 1) {
        onSchemaSet(field.blockType[0]);
      } else {
        setOptions([...field.blockType]);
      }
    }
  }, [field.blockType, dataTypes, onSchemaUpdate]);

  useEffect(() => {
    if (dataTypes && selectedDataType) {
      if (selectedDataType !== EMPTY_OPTION) {
        onSchemaSet(selectedDataType);
      } else {
        onSchemaUpdate(null);
      }
    }
  }, [selectedDataType, dataTypes, onSchemaUpdate])

  if (options.length === 0) {
    return null;
  }

  return (
    <div className='data_block__selector'>
      <h3>Block type</h3>
      <select
        value={selectedDataType ?? EMPTY_OPTION}
        onChange={event => onSetDataType(event.currentTarget.value === EMPTY_OPTION ? null : event.currentTarget.value)}
        style={{
          width: "100%",
          marginBottom: "1rem"
        }}>
        <option value={EMPTY_OPTION}></option>
        {
          options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))
        }
      </select>
    </div>
  );
};