import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Field } from '../../../models';
import { DataType } from '../../../models/DataType';
import { Dropdown as VSCodeDropdown, DropdownOption } from 'vscrui';

export interface IJsonFieldSelectorProps {
  field: Field;
  dataTypes: DataType[] | undefined;
  selectedDataType: string | null;
  onSetDataType: (dataType: string | null) => void;
  onSchemaUpdate: (schema: any) => void;
}

const EMPTY_OPTION = 'EMPTY_OPTION';

export const JsonFieldSelector: React.FunctionComponent<IJsonFieldSelectorProps> = ({
  field,
  dataTypes,
  selectedDataType,
  onSetDataType,
  onSchemaUpdate
}: React.PropsWithChildren<IJsonFieldSelectorProps>) => {
  const [options, setOptions] = useState<string[]>([]);

  const onChange = (selection: DropdownOption) => {
    onSetDataType(
      selection.value === EMPTY_OPTION ? null : selection.value
    );
  };

  const onSchemaSet = useCallback((dataType: string) => {
    if (dataTypes && dataType !== EMPTY_OPTION) {
      const schema = dataTypes.find((dt) => dt.id === dataType);
      onSchemaUpdate(schema);
    } else {
      onSchemaUpdate(null);
    }
  }, []);

  useEffect(() => {
    if (field.dataType && dataTypes) {
      if (typeof field.dataType === 'string') {
        onSchemaSet(field.dataType);
      } else if (field.dataType instanceof Array && field.dataType.length === 1) {
        onSchemaSet(field.dataType[0]);
      } else {
        setOptions([...field.dataType]);
      }
    }
  }, [field.dataType, dataTypes, onSchemaUpdate]);

  useEffect(() => {
    if (dataTypes && selectedDataType) {
      if (selectedDataType !== EMPTY_OPTION) {
        onSchemaSet(selectedDataType);
      } else {
        onSchemaUpdate(null);
      }
    }
  }, [selectedDataType, dataTypes, onSchemaUpdate]);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="json_data__selector">
      <h3>Block type</h3>
      <VSCodeDropdown
        value={selectedDataType ?? EMPTY_OPTION}
        onChange={(selection) => onChange(selection as DropdownOption)}
        className='!block mb-4'
        options={[
          { value: EMPTY_OPTION, label: '\u00A0' },
          ...options.map((o) => ({ value: o, label: o }))
        ]} />
    </div>
  );
};
