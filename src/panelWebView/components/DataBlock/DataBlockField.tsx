import * as React from 'react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { BlockFieldData, Field, FieldGroup, PanelSettings } from '../../../models';
import { PencilIcon } from '@heroicons/react/24/outline';
import { DataBlockRecords, DataBlockSelector } from '.';
import { SortEnd } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { IMetadata } from '../Metadata';
import { FieldTitle } from '../Fields/FieldTitle';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

// How long a local update keeps precedence over incoming values that are not the echo of our own update
const EXTERNAL_UPDATE_GRACE = 1500;

export interface IDataBlockFieldProps {
  label: string;
  description?: string;
  settings: PanelSettings;
  field: Field;
  parentFields: string[];
  value: unknown[];
  blockData: BlockFieldData | undefined;
  filePath: string;
  fieldsRenderer: (
    ctFields: Field[],
    parent: IMetadata,
    parentFields: string[],
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: unknown, parents: string[]) => void,
    parentBlock?: string | null
  ) => (JSX.Element | null)[] | undefined;
  onSubmit: (data: unknown) => void;
  parentBlock: string | null | undefined;
  required?: boolean;
}

export const DataBlockField: React.FunctionComponent<IDataBlockFieldProps> = ({
  label,
  description,
  filePath,
  settings,
  field,
  parentFields = [],
  value,
  blockData,
  fieldsRenderer,
  onSubmit,
  parentBlock,
  required
}: React.PropsWithChildren<IDataBlockFieldProps>) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<FieldGroup | undefined | null>(null);
  const [selectedBlockData, setSelectedBlockData] = useState<unknown | null>(null);
  const [hideSubBlock, setHideSubBlock] = useState<boolean>(true);
  // Changes when another record gets edited, so that the record fields do not keep the state of the previous record
  const [recordKey, setRecordKey] = useState<number>(0);
  const recordKeyRef = useRef<number>(recordKey);
  recordKeyRef.current = recordKey;
  // Record of which the changes were cancelled, pending updates of its fields are ignored
  const cancelledRecordRef = useRef<number | null>(null);
  // Last data we submitted. Updates build on it until the extension host sends it back, otherwise
  // a second update before the echo of the first one would drop the first one.
  const localValueRef = useRef<{ data: unknown[]; time: number } | null>(null);

  const SELECTION_STATE_KEY = useMemo(
    () => `${filePath}-data-selection-${field.name}`,
    [filePath, field.name]
  );
  const DATA_STATE_KEY = useMemo(
    () => `${filePath}-data-state-${field.name}`,
    [filePath, field.name]
  );

  /**
   * Retrieve the most recent data, which is the local data when the echo of our update did not come back yet
   */
  const getCurrentValue = useCallback((): unknown[] => {
    const localValue = localValueRef.current;
    if (localValue && Date.now() - localValue.time < EXTERNAL_UPDATE_GRACE) {
      return localValue.data;
    }

    return value;
  }, [value]);

  const submitValue = useCallback(
    (data: unknown[]) => {
      localValueRef.current = { data, time: Date.now() };
      onSubmit(data);
    },
    [onSubmit]
  );

  const onFieldUpdate = useCallback(
    (crntField: string | undefined, crntValue: unknown, parents: string[]) => {
      const dataClone: unknown[] = Object.assign([], getCurrentValue());

      if (!crntField || cancelledRecordRef.current === recordKey) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = {};
      if (selectedIndex !== null && selectedIndex !== undefined) {
        data = Object.assign({}, dataClone[selectedIndex]);
      }

      let parentObj: { [key: string]: unknown } = data;

      if (parents.length > 1) {
        // Get last parent
        const lastParent = parents[parents.length - 1];

        // Check if the last parent is not the same as the field.
        // If it is, then we need to skip it.
        if (lastParent !== field.name) {
          if (!parentObj[lastParent]) {
            parentObj[lastParent] = {};
          }
          parentObj = parentObj[lastParent] as { [key: string]: unknown };
        }
      }

      // Set the current field to the data object
      parentObj[crntField] = crntValue;

      // Delete the field group to have it added at the end
      delete data['fieldGroup'];

      // Remove the empty fields
      Object.keys(data).forEach((key) => {
        const currentValue = data[key];
        const isObjectValue =
          typeof currentValue === 'object' && currentValue !== null;
        const isEmptyArray = Array.isArray(currentValue) && currentValue.length === 0;
        const isEmptyObject =
          isObjectValue && !Array.isArray(currentValue) && Object.keys(currentValue).length === 0;

        if (currentValue === undefined || currentValue === null || isEmptyArray || isEmptyObject) {
          delete data[key];
        }
      });

      if (selectedIndex !== null && selectedIndex !== undefined && dataClone.length > 0) {
        dataClone[selectedIndex] = {
          ...data,
          fieldGroup: selectedGroup?.id
        };
      } else {
        dataClone.push({
          ...data,
          fieldGroup: selectedGroup?.id
        });

        // Only select the new record when it is still being edited (the update can be sent
        // by its fields when they unmount, after another record got selected)
        if (recordKey === recordKeyRef.current) {
          const newIndex = dataClone.length - 1;
          setSelectedIndex(newIndex);
          updateSelectionState(newIndex);
        }
      }

      submitValue(dataClone);
    },
    [selectedGroup?.id, selectedIndex, recordKey, getCurrentValue, submitValue]
  );

  const deleteItem = useCallback(
    (index: number) => {
      const crntValue = getCurrentValue();
      const dataClone: unknown[] = Object.assign([], crntValue);

      if (!crntValue) {
        return;
      }

      dataClone.splice(index, 1);
      submitValue(dataClone);
      onAdd();
    },
    [getCurrentValue, selectedIndex, submitValue]
  );

  /**
   * On group change
   * @param group
   */
  const onGroupChange = (group: FieldGroup | null | undefined) => {
    setSelectedGroup(group);

    if (!group) {
      // Clear the selected index
      onAdd();
    }
  };

  /**
   * Store the current state + show the form
   */
  const onShowForm = () => {
    const dataClone = Object.assign([], getCurrentValue());
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
      cancelledRecordRef.current = recordKey;
      submitValue(dataClone);
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

  /**
   * Add a new item to the list
   */
  const onAdd = useCallback(() => {
    setSelectedIndex(null);
    setSelectedGroup(null);
    setSelectedBlockData({});
    setRecordKey((prevKey) => prevKey + 1);

    updateSelectionState(undefined);
  }, [setSelectedIndex, setSelectedGroup, setSelectedBlockData]);

  /**
   * Update an item from the list
   */
  const onEdit = useCallback(
    (index: number) => {
      updateSelectionState(index);
      setSelectedIndex(index);
      setRecordKey((prevKey) => prevKey + 1);

      // Show the form
      onShowForm();

      const fieldData = value[index] as { fieldGroup?: string };
      if (index !== null && settings?.fieldGroups) {
        const fieldGroup = fieldData?.fieldGroup;
        const group = settings?.fieldGroups.find((group) => group.id === fieldGroup);
        setSelectedGroup(group);
        setSelectedBlockData(fieldData);
      }
    },
    [setSelectedIndex, setSelectedBlockData, value]
  );

  /**
   * On sort of an item
   */
  const onSort = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      const crntValue = getCurrentValue();
      if (!crntValue || crntValue.length === 0) {
        return null;
      }

      if (selectedIndex !== null && selectedIndex !== undefined) {
        setSelectedIndex(newIndex);
      }

      const newEntries = arrayMoveImmutable(crntValue, oldIndex, newIndex);
      submitValue(newEntries);
    },
    [getCurrentValue, selectedIndex, submitValue]
  );

  // Retrieving the state from local storage (does not need to be persistent)
  const retrieveSelectionState = useCallback(() => {
    const prevState = localStorage.getItem(SELECTION_STATE_KEY);
    const prevStateValue = prevState ? parseInt(prevState) : null;
    return prevStateValue === null || isNaN(prevStateValue) ? undefined : prevStateValue;
  }, [SELECTION_STATE_KEY]);

  // Storing the state to local storage (does not need to be persistent)
  const updateSelectionState = useCallback(
    (value: number | undefined) => {
      localStorage.setItem(SELECTION_STATE_KEY, value?.toString() || '');
    },
    [SELECTION_STATE_KEY]
  );

  const getSelectedIndex = useCallback(() => {
    const crntValue = [];

    if (blockData?.selectedIndex !== null && blockData?.selectedIndex !== undefined) {
      crntValue.push(blockData.selectedIndex);
    }

    if (selectedIndex !== null && selectedIndex !== undefined) {
      crntValue.push(selectedIndex);
    }

    return crntValue.join('.');
  }, [blockData, selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== null) {
      const fieldData = value[selectedIndex];
      setSelectedBlockData(fieldData);
    }
  }, [selectedIndex, value, setSelectedBlockData]);

  useEffect(() => {
    // The echo of our last update, the incoming value is up to date again
    if (localValueRef.current && JSON.stringify(localValueRef.current.data) === JSON.stringify(value)) {
      localValueRef.current = null;
    }
  }, [value]);

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

  if (parentBlock === null && field.type !== 'block') {
    return null;
  }

  return (
    <div className="block_field">
      <FieldTitle label={label} icon={<PencilIcon />} required={required} />

      {description && <div className={`metadata_field__description`}>{description}</div>}

      {!hideSubBlock ? (
        <div className="block_field__form">
          <h3>
            {selectedGroup?.id
              ? selectedIndex !== null
                ? l10n.t(LocalizationKey.panelDataBlockDataBlockFieldGroupSelectedEdit, `${selectedGroup.id} ${selectedIndex + 1}`)
                : l10n.t(LocalizationKey.panelDataBlockDataBlockFieldGroupSelectedCreate, selectedGroup?.id)
              : l10n.t(LocalizationKey.panelDataBlockDataBlockFieldGroupSelect)}
          </h3>

          <DataBlockSelector
            field={field}
            selectedGroup={selectedGroup?.id}
            fieldGroups={settings.fieldGroups}
            onGroupChange={onGroupChange}
          />

          {selectedGroup?.fields && (
            <React.Fragment key={recordKey}>
              {fieldsRenderer(
                selectedGroup?.fields,
                Object.assign({}, selectedBlockData) || {},
                [...parentFields, field.name],
                {
                  parentFields: [...parentFields, field.name],
                  blockType: selectedGroup?.id || undefined,
                  selectedIndex: getSelectedIndex()
                },
                onFieldUpdate,
                `${field.name}-${selectedGroup?.id}-${selectedIndex || 0}`
              )}
            </React.Fragment>
          )}

          <div className={`block_field__form__buttons`}>
            <button
              className={`block_field__form__button__save`}
              title={l10n.t(LocalizationKey.commonSave)}
              onClick={onSaveForm}
            >
              {l10n.t(LocalizationKey.commonSave)}
            </button>
            <button
              className={`block_field__form__button__cancel`}
              title={l10n.t(LocalizationKey.commonCancel)}
              onClick={onCancelForm}
            >
              {l10n.t(LocalizationKey.commonCancel)}
            </button>
          </div>
        </div>
      ) : (
        <button title={l10n.t(LocalizationKey.panelDataBlockDataBlockFieldAdd, field.name)} onClick={onShowForm}>
          {l10n.t(LocalizationKey.panelDataBlockDataBlockFieldAdd, field.name)}
        </button>
      )}

      <DataBlockRecords
        fieldGroups={settings.fieldGroups}
        records={value}
        selectedIndex={selectedIndex}
        onAdd={onAdd}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={deleteItem}
      />
    </div>
  );
};
