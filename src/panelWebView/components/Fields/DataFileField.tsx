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
import useLocalChange from '../../hooks/useLocalChange';

export interface IDataFileFieldProps {
  label: string;
  description?: string;
  dataFileId?: string;
  dataFileKey?: string;
  dataFileValue?: string;
  dataFileAdditionalFields?: string[];
  selected: string | string[] | Record<string, unknown> | Record<string, unknown>[];
  multiSelect?: boolean;
  required?: boolean;
  onChange: (value: string | string[] | Record<string, unknown> | Record<string, unknown>[]) => void;
}

export const DataFileField: React.FunctionComponent<IDataFileFieldProps> = ({
  label,
  description,
  dataFileId,
  dataFileKey,
  dataFileValue,
  dataFileAdditionalFields,
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
  const { trackChange, isStaleValue } = useLocalChange();

  const hasAdditionalFields = useMemo(
    () => !!dataFileAdditionalFields && dataFileAdditionalFields.length > 0,
    [dataFileAdditionalFields]
  );

  // Extract the key string from a selected value (which may be a plain object when additionalFields is configured)
  const extractKey = useCallback(
    (value: unknown): string => {
      if (value && typeof value === 'object' && !Array.isArray(value) && dataFileKey) {
        return ((value as Record<string, unknown>)[dataFileKey] as string) || '';
      }
      return (value as string) || '';
    },
    [dataFileKey]
  );

  // Build the value to emit: an object when additionalFields is configured, otherwise just the key string
  const buildEmitValue = useCallback(
    (keyValue: string): string | Record<string, unknown> => {
      if (hasAdditionalFields && dataEntries && dataFileKey && dataFileAdditionalFields) {
        const entry = (dataEntries as any[]).find((r: any) => r[dataFileKey] === keyValue);
        if (entry) {
          const obj: Record<string, unknown> = { [dataFileKey]: entry[dataFileKey] };
          for (const field of dataFileAdditionalFields) {
            obj[field] = entry[field];
          }
          return obj;
        }
      }
      return keyValue;
    },
    [hasAdditionalFields, dataEntries, dataFileKey, dataFileAdditionalFields]
  );

  const emitValue = useCallback(
    (newValue: string | string[] | Record<string, unknown> | Record<string, unknown>[]) => {
      trackChange(newValue);
      onChange(newValue);
    },
    [onChange, trackChange]
  );

  const onValueChange = useCallback(
    (txtValue: string) => {
      if (multiSelect) {
        const newKeys = [...((crntSelected || []) as string[]), txtValue];
        setCrntSelected(newKeys);
        if (hasAdditionalFields) {
          emitValue(newKeys.map(buildEmitValue) as Record<string, unknown>[]);
        } else {
          emitValue(newKeys);
        }
      } else {
        setCrntSelected(txtValue);
        if (hasAdditionalFields) {
          emitValue(buildEmitValue(txtValue) as Record<string, unknown>);
        } else {
          emitValue(txtValue);
        }
      }
    },
    [crntSelected, multiSelect, emitValue, hasAdditionalFields, buildEmitValue]
  );

  const removeSelected = useCallback(
    (txtValue: string) => {
      if (multiSelect) {
        const newKeys = [...(crntSelected || [])].filter((v) => v !== txtValue) as string[];
        setCrntSelected(newKeys);
        if (hasAdditionalFields) {
          emitValue(newKeys.map(buildEmitValue) as Record<string, unknown>[]);
        } else {
          emitValue(newKeys);
        }
      } else {
        setCrntSelected('');
        emitValue('');
      }
    },
    [crntSelected, multiSelect, emitValue, hasAdditionalFields, buildEmitValue]
  );

  const allChoices = useMemo(() => {
    if (dataEntries && dataFileKey) {
      return (dataEntries as any[])
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
    if (isStaleValue(selected)) {
      return;
    }

    if (selected !== undefined && selected !== null && selected !== '') {
      if (multiSelect) {
        const keys = (Array.isArray(selected) ? selected : [selected]).map(extractKey);
        setCrntSelected(keys);
        return;
      } else {
        const key = extractKey(Array.isArray(selected) ? selected[0] : selected);
        setCrntSelected(key);
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
              className={`field_dropdown metadata_field__choice_list ${isOpen ? 'open' : 'closed'}`}
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
