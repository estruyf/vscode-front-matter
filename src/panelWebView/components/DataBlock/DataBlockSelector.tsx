import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Field, FieldGroup } from '../../../models';
import { LocalizationKey, localize } from '../../../localization';
import { Dropdown as VSCodeDropdown, DropdownOption } from 'vscrui';

export interface IDataBlockSelectorProps {
  field: Field;
  fieldGroups: FieldGroup[] | undefined;
  selectedGroup: string | undefined;
  onGroupChange: (group: FieldGroup | undefined | null) => void;
}

const EMPTY_OPTION = 'EMPTY_OPTION';

export const DataBlockSelector: React.FunctionComponent<IDataBlockSelectorProps> = ({
  field,
  fieldGroups,
  selectedGroup,
  onGroupChange
}: React.PropsWithChildren<IDataBlockSelectorProps>) => {
  const [options, setOptions] = useState<string[]>([]);

  const onGroupSet = useCallback((fieldGroup: string) => {
    if (fieldGroups && fieldGroup !== EMPTY_OPTION) {
      const group = fieldGroups.find((group) => group.id === fieldGroup);
      onGroupChange(group);
    } else {
      onGroupChange(null);
    }
  }, []);

  const onGroupSelect = useCallback(
    (selection: DropdownOption) => {
      const group = selection.value === EMPTY_OPTION ? null : selection.value;

      if (group) {
        onGroupSet(group);
      } else {
        onGroupChange(null);
      }
    },
    [onGroupSet]
  );

  useEffect(() => {
    if (field.fieldGroup && fieldGroups) {
      if (typeof field.fieldGroup === 'string') {
        onGroupSet(field.fieldGroup);
      } else if (field.fieldGroup instanceof Array && field.fieldGroup.length === 1) {
        onGroupSet(field.fieldGroup[0]);
      } else {
        setOptions([...field.fieldGroup]);
      }
    }
  }, [field.fieldGroup, fieldGroups, onGroupChange]);

  useEffect(() => {
    if (fieldGroups && selectedGroup) {
      if (selectedGroup !== EMPTY_OPTION) {
        onGroupSet(selectedGroup);
      } else {
        onGroupChange(null);
      }
    }
  }, [selectedGroup, fieldGroups, onGroupChange]);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="json_data__selector">
      <h3>{localize(LocalizationKey.panelDataBlockDataBlockSelectorLabel)}</h3>

      <VSCodeDropdown
        value={selectedGroup ?? EMPTY_OPTION}
        onChange={(value) => onGroupSelect(value as DropdownOption)}
        className='!block mb-4'
        options={[
          { value: EMPTY_OPTION, label: '\u00A0' },
          ...options.map((o) => ({ value: o, label: o }))
        ]}
      />
    </div>
  );
};
