import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Field, FieldGroup } from '../../../models';
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';

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
    (event: any) => {
      const group = event.currentTarget.value === EMPTY_OPTION ? null : event.currentTarget.value;

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
      <h3>Block type</h3>
      <VSCodeDropdown
        value={selectedGroup ?? EMPTY_OPTION}
        onChange={onGroupSelect}
        style={{
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        <VSCodeOption value={EMPTY_OPTION}>&nbsp;</VSCodeOption>
        {options.map((o) => (
          <VSCodeOption key={o} value={o}>
            {o}
          </VSCodeOption>
        ))}
      </VSCodeDropdown>
    </div>
  );
};
