import { messageHandler } from '@estruyf/vscode/dist/client';
import { ChevronDownIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandToCode } from '../../CommandToCode';
import Downshift from 'downshift';
import { ChoiceButton } from './ChoiceButton';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import useDropdownStyle from '../../hooks/useDropdownStyle';

export interface IDataFileFieldProps {
  label: string;
  description?: string;
  dataFileId?: string;
  dataFileKey?: string;
  dataFileValue?: string;
  selected: string | string[];
  multiSelect?: boolean;
  required?: boolean;
  onChange: (value: string | string[]) => void;
}

export const DataFileField: React.FunctionComponent<IDataFileFieldProps> = ({
  label,
  description,
  dataFileId,
  dataFileKey,
  dataFileValue,
  selected,
  multiSelect,
  onChange,
  required
}: React.PropsWithChildren<IDataFileFieldProps>) => {
  const [dataEntries, setDataEntries] = useState<string[] | null>(null);
  const [crntSelected, setCrntSelected] = React.useState<string | string[] | null>();
  const dsRef = React.useRef<Downshift<string> | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { getDropdownStyle } = useDropdownStyle(inputRef as any);

  const onValueChange = useCallback(
    (txtValue: string) => {
      if (multiSelect) {
        const newValue = [...((crntSelected || []) as string[]), txtValue];
        setCrntSelected(newValue);
        onChange(newValue);
      } else {
        setCrntSelected(txtValue);
        onChange(txtValue);
      }
    },
    [crntSelected, multiSelect, onChange]
  );

  const removeSelected = useCallback(
    (txtValue: string) => {
      if (multiSelect) {
        const newValue = [...(crntSelected || [])].filter((v) => v !== txtValue);
        setCrntSelected(newValue);
        onChange(newValue);
      } else {
        setCrntSelected('');
        onChange('');
      }
    },
    [crntSelected, multiSelect, onChange]
  );

  const allChoices = useMemo(() => {
    if (dataEntries && dataFileKey) {
      return dataEntries
        .map((r: any) => ({
          id: r[dataFileKey],
          title: r[dataFileValue || dataFileKey] || r[dataFileKey]
        }))
        .filter((r) => r.id);
    }
    return [];
  }, [crntSelected, dataEntries, dataFileKey, dataFileValue]);

  const availableChoices = useMemo(() => {
    if (allChoices) {
      return allChoices.filter((choice) => {
        if (choice) {
          if (typeof crntSelected === 'string') {
            return crntSelected !== choice.id;
          } else if (crntSelected instanceof Array) {
            return crntSelected.indexOf(choice.id) === -1;
          }

          return true;
        }

        return false;
      });
    }
    return [];
  }, [allChoices]);

  const getChoiceValue = useCallback(
    (id: string) => {
      const choice = allChoices.find((r) => r.id === id);
      if (choice) {
        return choice.title;
      }
      return '';
    },
    [allChoices]
  );

  const showRequiredState = useMemo(() => {
    return (
      required && ((crntSelected instanceof Array && crntSelected.length === 0) || !crntSelected)
    );
  }, [required, crntSelected]);

  useEffect(() => {
    if (selected) {
      if (multiSelect) {
        setCrntSelected(typeof selected === 'string' ? [selected] : selected);
        return;
      } else {
        setCrntSelected(selected instanceof Array ? selected[0] : selected);
        return;
      }
    }

    setCrntSelected(multiSelect ? [] : '');
  }, [selected, multiSelect]);

  useEffect(() => {
    if (dataFileId) {
      messageHandler.request<string[]>(CommandToCode.getDataEntries, dataFileId).then((entries) => {
        setDataEntries(entries || null);
      }).catch((_) => {
        setDataEntries(null);
      });
    }
  }, [dataFileId]);

  return (
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle label={label} icon={<CircleStackIcon />} required={required} />

      <Downshift
        ref={dsRef}
        onSelect={(selected) => onValueChange(selected || '')}
        itemToString={(item) => (item ? item : '')}
      >
        {({ getToggleButtonProps, getItemProps, getMenuProps, isOpen, getRootProps }) => (
          <div
            {...getRootProps(undefined, { suppressRefError: true })}
            ref={inputRef}
            className={`metadata_field__choice`}
          >
            <button
              {...getToggleButtonProps({
                className: `metadata_field__choice__toggle`,
                disabled: availableChoices.length === 0
              })}
            >
              <span>{`Select ${label}`}</span>
              <ChevronDownIcon className="icon" />
            </button>

            <ul
              className={`metadata_field__choice_list ${isOpen ? 'open' : 'closed'}`}
              style={{
                bottom: getDropdownStyle(isOpen)
              }}
              {...getMenuProps()}
            >
              {
                availableChoices.map((choice, index) => (
                  <li
                    {...getItemProps({
                      key: choice.id,
                      index,
                      item: choice.id
                    })}
                  >
                    {choice.title || (
                      <span className={`metadata_field__choice_list__item`}>
                        {l10n.t(LocalizationKey.commonClearValue)}
                      </span>
                    )}
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </Downshift>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />

      {crntSelected instanceof Array
        ? crntSelected.map((value: string) => (
          <ChoiceButton
            key={value}
            value={value}
            title={getChoiceValue(value)}
            onClick={removeSelected}
          />
        ))
        : crntSelected && (
          <ChoiceButton
            key={crntSelected}
            value={crntSelected}
            title={getChoiceValue(crntSelected)}
            onClick={removeSelected}
          />
        )}
    </div>
  );
};
