import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { BlockFieldData, Field, FieldGroup, PanelSettings } from '../../../models';
import { PencilIcon } from '@heroicons/react/24/outline';
import { DataBlockRecords, DataBlockSelector } from '.';
import { SortEnd } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { IMetadata } from '../Metadata';
import { FieldTitle } from '../Fields/FieldTitle';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

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

  const SELECTION_STATE_KEY = useMemo(
    () => `${filePath}-data-selection-${field.name}`,
    [filePath, field.name]
  );
  const DATA_STATE_KEY = useMemo(
    () => `${filePath}-data-state-${field.name}`,
    [filePath, field.name]
  );

  const onFieldUpdate = useCallback(
    (crntField: string | undefined, crntValue: unknown, parents: string[]) => {
      const dataClone: unknown[] = Object.assign([], value);

      if (!crntField) {
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
        if (data[key] === undefined || data[key] === null || Object.keys(data[key]).length === 0) {
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

        const newIndex = dataClone.length - 1;
        setSelectedIndex(newIndex);
        updateSelectionState(newIndex);
      }

      onSubmit(dataClone);
    },
    [selectedGroup?.id, selectedIndex, value, onSubmit]
  );

  const deleteItem = useCallback(
    (index: number) => {
      const dataClone: unknown[] = Object.assign([], value);

      if (!value) {
        return;
      }

      dataClone.splice(index, 1);
      onSubmit(dataClone);
      onAdd();
    },
    [value, selectedIndex, onSubmit]
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
    const dataClone = Object.assign([], value);
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
      onSubmit(dataClone);
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

    updateSelectionState(undefined);
  }, [setSelectedIndex, setSelectedGroup, setSelectedBlockData]);

  /**
   * Update an item from the list
   */
  const onEdit = useCallback(
    (index: number) => {
      updateSelectionState(index);
      setSelectedIndex(index);

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
      if (!value || value.length === 0) {
        return null;
      }

      if (selectedIndex !== null && selectedIndex !== undefined) {
        setSelectedIndex(newIndex);
      }

      const newEntries = arrayMoveImmutable(value, oldIndex, newIndex);
      onSubmit(newEntries);
    },
    [value, selectedIndex]
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

          {selectedGroup?.fields &&
            fieldsRenderer(
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
