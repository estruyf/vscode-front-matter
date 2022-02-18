

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { BlockFieldData, Field, PanelSettings } from '../../../models';
import { Command } from '../../Command';
import { CommandToCode } from '../../CommandToCode';
import { TagType } from '../../TagType';
import { DataBlockField } from '../DataBlock';
import FieldBoundary from '../ErrorBoundary/FieldBoundary';
import { ListUnorderedIcon } from '../Icons/ListUnorderedIcon';
import { TagIcon } from '../Icons/TagIcon';
import { JsonField } from '../JsonField';
import { IMetadata } from '../Metadata';
import { TagPicker } from '../TagPicker';
import { VsLabel } from '../VscodeComponents';
import { ChoiceField } from './ChoiceField';
import { DateTimeField } from './DateTimeField';
import { DraftField } from './DraftField';
import { NumberField } from './NumberField';
import { PreviewImageField, PreviewImageValue } from './PreviewImageField';
import { TextField } from './TextField';
import { Toggle } from './Toggle';

export interface IWrapperFieldProps {
  field: Field;
  parent: IMetadata;
  parentFields: string[];
  metadata: IMetadata;
  settings: PanelSettings;
  blockData: BlockFieldData | undefined;
  focusElm: TagType | null;
  parentBlock: string | null | undefined;
  onSendUpdate: (field: string | undefined, value: any, parents: string[]) => void;
  unsetFocus: () => void;
  renderFields: (
    ctFields: Field[], 
    parent: IMetadata, 
    parentFields: string[], 
    blockData?: BlockFieldData, 
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void, 
    parentBlock?: string | null
  ) => (JSX.Element | null)[] | undefined
}

export const WrapperField: React.FunctionComponent<IWrapperFieldProps> = ({ 
  field, parent, parentFields, metadata, settings, blockData, focusElm, parentBlock, onSendUpdate, unsetFocus, renderFields 
}: React.PropsWithChildren<IWrapperFieldProps>) => {
  const [ fieldValue, setFieldValue ] = useState<any | undefined>(undefined);

  const listener = useCallback((event: any) => {
    const message = event.data;

    if (message.command === Command.updatePlaceholder) {
      const data = message.data;
      if (data.field === field.name) {
        setFieldValue(data.value);
        onSendUpdate(field.name, data.value, parentFields);
      }
    }
  }, [field]);


  const getDate = (date: string | Date): Date | null => {
    const parsedDate = DateHelper.tryParse(date, settings?.date?.format);
    return parsedDate || date as Date | null;
  }

  useEffect(() => {
    let value: any = parent[field.name];
    let shouldSetField = false;
    
    if (field.type === 'datetime') {
      value = getDate(value) || undefined;
    }

    if (value === undefined && field.default) {
      value = field.default;

      if (field.type === 'datetime') {
        value = getDate(value) || null;
      }

      onSendUpdate(field.name, value, parentFields);
    } else {
      if (field.type === "tags" || field.type === "categories" || field.type === "taxonomy") {
        value = [];
      }

      shouldSetField = true;
    }

    // Check if the field value contains a placeholder
    if (value && typeof value === "string" && value.includes(`{{`) && value.includes(`}}`)) {
      window.addEventListener('message', listener);
      MessageHelper.sendMessage(CommandToCode.updatePlaceholder, {
        field: field.name,
        title: metadata["title"],
        value
      });
    } else {
      // Did not contain a placeholder, so value can be set
      if (fieldValue === undefined || value !== fieldValue) {
        setFieldValue(value || null);
      }
    }

    return () => {
      window.removeEventListener('message', listener);
    }
  }, [field, parent]);

  if (field.hidden || fieldValue === undefined) {
    return null;
  }

  if (field.type === 'datetime') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DateTimeField
          label={field.title || field.name}
          date={fieldValue}
          format={settings?.date?.format}
          onChange={(date => onSendUpdate(field.name, date, parentFields))} />
      </FieldBoundary>
    );
  } else if (field.type === 'boolean') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <Toggle 
          key={field.name}
          label={field.title || field.name}
          checked={!!fieldValue} 
          onChanged={(checked) => onSendUpdate(field.name, checked, parentFields)} />
      </FieldBoundary>
    );
  } else if (field.type === 'string') {

    let limit = -1;
    if (field.name === 'title') {
      limit = settings?.seo.title;
    } else if (field.name === settings.seo.descriptionField) {
      limit = settings?.seo.description;
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TextField 
          label={field.title || field.name}
          singleLine={field.single}
          limit={limit}
          rows={3}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
          value={fieldValue as string || null} />
      </FieldBoundary>
    );
  } else if (field.type === 'number') {
    let nrValue: number | null = parseInt(fieldValue as string);
    if (isNaN(nrValue)) {
      nrValue = null;
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <NumberField 
          key={field.name}
          label={field.title || field.name}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
          value={nrValue} />
      </FieldBoundary>
    );
  } else if (field.type === 'image') {    
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <PreviewImageField 
          label={field.title || field.name}
          fieldName={field.name}
          filePath={metadata.filePath as string}
          parents={parentFields}
          value={fieldValue as PreviewImageValue | PreviewImageValue[] | null}
          multiple={field.multiple}
          blockData={blockData}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)} />
      </FieldBoundary>
    );
  } else if (field.type === 'choice') {
    const choices = field.choices || [];

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <ChoiceField
          label={field.title || field.name}
          selected={fieldValue as string}
          choices={choices}
          multiSelect={field.multiple}
          onChange={(value => onSendUpdate(field.name, value, parentFields))} />
      </FieldBoundary>
    );
  } else if (field.type === 'tags') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker 
          type={TagType.tags} 
          label={field.title || field.name}
          icon={<TagIcon />}
          crntSelected={fieldValue as string[] || []} 
          options={settings?.tags || []} 
          freeform={settings.freeform || false} 
          focussed={focusElm === TagType.tags}
          unsetFocus={unsetFocus}
          parents={parentFields}
          blockData={blockData} />
      </FieldBoundary>
    );
  } else if (field.type === 'taxonomy') {
    const taxonomyData = settings.customTaxonomy.find(ct => ct.id === field.taxonomyId);

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker 
          type={TagType.custom}
          label={field.title || field.name}
          icon={<ListUnorderedIcon />}
          crntSelected={fieldValue as string[] || []} 
          options={taxonomyData?.options || []} 
          freeform={settings.freeform || false} 
          focussed={focusElm === TagType.custom}
          unsetFocus={unsetFocus}
          fieldName={field.name}
          taxonomyId={field.taxonomyId}
          parents={parentFields}
          blockData={blockData} />
      </FieldBoundary>
    );
  } else if (field.type === 'categories') {
    let selectedValues = parent[field.name];
    if (!selectedValues && typeof parent[field.name] === "undefined" && field.default) {
      selectedValues = field.default;
      onSendUpdate(field.name, selectedValues, parentFields);
    } else {
      selectedValues = [];
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker 
          type={TagType.categories}
          label={field.title || field.name}
          icon={<ListUnorderedIcon />}
          crntSelected={selectedValues as string[] || []} 
          options={settings.categories} 
          freeform={settings.freeform || false} 
          focussed={focusElm === TagType.categories}
          unsetFocus={unsetFocus}
          parents={parentFields}
          blockData={blockData} />
      </FieldBoundary>
    );
  } else if (field.type === 'draft') {
    const draftField = settings?.draftField;
    let draftValue = parent[field.name];

    if (!draftValue && typeof parent[field.name] === "undefined" && field.default) {
      draftValue = field.default;
      onSendUpdate(field.name, draftValue, parentFields);
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DraftField
          label={field.title || field.name}
          type={draftField?.type || "boolean"}
          choices={draftField?.choices || []}
          value={draftValue as boolean | string | null | undefined}
          onChanged={(value: boolean | string) => onSendUpdate(field.name, value, parentFields)} />
      </FieldBoundary>
    );
  } else if (field.type === 'fields') {
    if (field.fields && parent) {
      if (!parent[field.name]) {
        parent[field.name] = {};
      }

      const subMetadata = parent[field.name] as IMetadata;
      return (
        <FieldBoundary key={field.name} fieldName={field.title || field.name}>
          <div className={`metadata_field__box`}>
            <VsLabel>
              <div className={`metadata_field__label metadata_field__label_parent`}>
                <span style={{ lineHeight: "16px"}}>{field.title || field.name}</span>
              </div>
            </VsLabel>

            { renderFields(field.fields, subMetadata, [...parentFields, field.name], blockData, onSendUpdate) }
          </div>
        </FieldBoundary>
      );
    }

    return null;
  } else if (field.type === 'json') {
    const collectionData = parent[field.name];

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <JsonField
          label={field.title || field.name}
          settings={settings}
          field={field}
          value={collectionData}
          onSubmit={(value) => onSendUpdate(field.name, value, parentFields)} />
      </FieldBoundary>
    );
  } else if (field.type === 'block') {
    const blockData = Object.assign([], parent[field.name]);
    
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DataBlockField
          label={field.title || field.name}
          settings={settings}
          field={field}
          value={blockData}
          fieldsRenderer={renderFields}
          parentFields={parentFields}
          filePath={metadata.filePath as string}
          parentBlock={parentBlock}
          onSubmit={(value) => onSendUpdate(field.name, value, parentFields)} />
      </FieldBoundary>
    );
  } else {
    console.warn(`Unknown field type: ${field.type}`);
    return null;
  }
};