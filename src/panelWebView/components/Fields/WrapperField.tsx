import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { BlockFieldData, CustomPanelViewResult, Field, PanelSettings, WhenOperator } from '../../../models';
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
import {
  ChoiceField,
  DataFileField,
  DateTimeField,
  DraftField,
  FieldTitle,
  FileField,
  ListField,
  Toggle,
  TextField,
  SlugField,
  PreviewImageField,
  PreviewImageValue,
  NumberField,
  CustomField
} from '.';
import { fieldWhenClause } from '../../../utils/fieldWhenClause';
import { ContentTypeRelationshipField } from './ContentTypeRelationshipField';

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
  ) => (JSX.Element | null)[] | undefined;
}

export const WrapperField: React.FunctionComponent<IWrapperFieldProps> = ({
  field,
  parent,
  parentFields,
  metadata,
  settings,
  blockData,
  focusElm,
  parentBlock,
  onSendUpdate,
  unsetFocus,
  renderFields
}: React.PropsWithChildren<IWrapperFieldProps>) => {
  const [fieldValue, setFieldValue] = useState<any | undefined>(undefined);
  const [customFields, setCustomFields] = useState<{
    name: string;
    html: (data: any, onChange: (value: any) => void) => Promise<CustomPanelViewResult | undefined>;
  }[]>([]);

  const listener = useCallback(
    (event: any) => {
      const message = event.data;

      if (message.command === Command.updatePlaceholder) {
        const data = message.payload;
        if (data.field === field.name) {
          setFieldValue(data.value);
          onSendUpdate(field.name, data.value, parentFields);
        }
      }
    },
    [field]
  );

  const getDate = (date: string | Date): Date | null => {
    const parsedDate = DateHelper.tryParse(date, settings?.date?.format);
    return parsedDate || (date as Date | null);
  };

  useEffect(() => {
    let value: any = parent[field.name];

    if (field.type === 'tags' || field.type === 'categories' || field.type === 'taxonomy') {
      setFieldValue(value || []);
      return;
    }

    if (field.type === 'datetime') {
      value = getDate(value) || undefined;
    }

    if (value === undefined && field.default) {
      value = field.default;

      if (field.type === 'datetime') {
        if (value === '{{now}}') {
          value = new Date();
        }

        value = getDate(value) || null;
      }

      //onSendUpdate(field.name, value, parentFields);
    }

    // Check if the field value contains a placeholder
    if (value && typeof value === 'string' && value.includes(`{{`) && value.includes(`}}`)) {
      window.addEventListener('message', listener);
      Messenger.send(CommandToCode.updatePlaceholder, {
        field: field.name,
        title: metadata['title'],
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
    };
  }, [field, parent]);

  useEffect(() => {
    if (window.fmExternal && window.fmExternal.getCustomFields) {
      setCustomFields(window.fmExternal.getCustomFields || []);
    } else {
      setCustomFields([]);
    }
  }, []);

  if (field.hidden || fieldValue === undefined) {
    if (field.hidden && fieldValue === undefined && field.default && parentFields.length > 0) {
      onSendUpdate(field.name, field.default, parentFields);
    }

    return null;
  }

  // Conditional fields
  if (typeof field.when !== 'undefined') {
    const shouldRender = fieldWhenClause(field, parent);

    if (!shouldRender) {
      return null;
    }
  }

  if (field.type === 'divider') {
    return <div key={field.name} className="metadata_field__divider" />;
  } else if (field.type === 'heading') {
    return (
      <div key={field.name} className="metadata_field__heading">
        <h3>{field.title}</h3>
        {field.description && <p className="metadata_field__description">{field.description}</p>}
      </div>
    );
  } else if (field.type === 'datetime') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DateTimeField
          label={field.title || field.name}
          description={field.description}
          value={fieldValue}
          required={!!field.required}
          format={field.dateFormat || settings?.date?.format}
          onChange={(date) => onSendUpdate(field.name, date, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'boolean') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <Toggle
          key={field.name}
          label={field.title || field.name}
          description={field.description}
          value={fieldValue}
          required={!!field.required}
          onChanged={(checked) => onSendUpdate(field.name, checked, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'string') {
    let limit = -1;
    if (field.name === settings.seo.titleField) {
      limit = settings?.seo.title;
    } else if (field.name === settings.seo.descriptionField) {
      limit = settings?.seo.description;
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TextField
          name={field.name}
          label={field.title || field.name}
          description={field.description}
          singleLine={field.single}
          limit={limit}
          wysiwyg={field.wysiwyg}
          rows={3}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
          value={(fieldValue as string) || null}
          required={!!field.required}
          settings={settings}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'number') {
    let nrValue: number | null = field.numberOptions?.isDecimal ? parseFloat(fieldValue as string) : parseInt(fieldValue as string);
    if (isNaN(nrValue)) {
      nrValue = null;
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <NumberField
          label={field.title || field.name}
          description={field.description}
          options={field.numberOptions}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
          value={nrValue}
          required={!!field.required}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'image') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <PreviewImageField
          label={field.title || field.name}
          description={field.description}
          fieldName={field.name}
          filePath={metadata.filePath as string}
          parents={parentFields}
          value={fieldValue as PreviewImageValue | PreviewImageValue[] | null}
          required={!!field.required}
          multiple={field.multiple}
          blockData={blockData}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'file') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <FileField
          label={field.title || field.name}
          description={field.description}
          fieldName={field.name}
          multiple={field.multiple}
          fileExtensions={field.fileExtensions}
          filePath={metadata.filePath as string}
          value={fieldValue as string | string[] | null}
          required={!!field.required}
          parents={parentFields}
          blockData={blockData}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'choice') {
    const choices = field.choices || [];

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <ChoiceField
          label={field.title || field.name}
          description={field.description}
          value={fieldValue as string}
          required={!!field.required}
          choices={choices}
          multiSelect={field.multiple}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'tags') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker
          type={TagType.tags}
          label={field.title || field.name}
          description={field.description}
          fieldName={field.name}
          icon={<TagIcon />}
          crntSelected={(fieldValue as string[]) || []}
          options={settings?.tags || []}
          freeform={settings.freeform || false}
          focussed={focusElm === TagType.tags}
          unsetFocus={unsetFocus}
          parents={parentFields}
          blockData={blockData}
          limit={field.taxonomyLimit}
          required={!!field.required}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'taxonomy') {
    const taxonomyData = settings.customTaxonomy.find((ct) => ct.id === field.taxonomyId);

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker
          type={TagType.custom}
          label={field.title || field.name}
          description={field.description}
          icon={<ListUnorderedIcon />}
          crntSelected={(fieldValue as string[]) || []}
          options={taxonomyData?.options || []}
          freeform={settings.freeform || false}
          focussed={focusElm === TagType.custom}
          unsetFocus={unsetFocus}
          fieldName={field.name}
          taxonomyId={field.taxonomyId}
          parents={parentFields}
          blockData={blockData}
          limit={field.taxonomyLimit}
          required={!!field.required}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'categories') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <TagPicker
          type={TagType.categories}
          label={field.title || field.name}
          description={field.description}
          fieldName={field.name}
          icon={<ListUnorderedIcon />}
          crntSelected={(fieldValue as string[]) || []}
          options={settings.categories}
          freeform={settings.freeform || false}
          focussed={focusElm === TagType.categories}
          unsetFocus={unsetFocus}
          parents={parentFields}
          blockData={blockData}
          limit={field.taxonomyLimit}
          required={!!field.required}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'draft') {
    const draftField = settings?.draftField;
    let draftValue = parent[field.name];

    if (!draftValue && typeof parent[field.name] === 'undefined' && field.default) {
      draftValue = field.default;
      onSendUpdate(field.name, draftValue, parentFields);
    }

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DraftField
          label={field.title || field.name}
          description={field.description}
          type={draftField?.type || 'boolean'}
          choices={draftField?.choices || []}
          value={draftValue as boolean | string | null | undefined}
          required={!!field.required}
          onChanged={(value: boolean | string) => onSendUpdate(field.name, value, parentFields)}
        />
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
            <FieldTitle
              className={`metadata_field__label_parent`}
              label={field.title || field.name}
              icon={undefined}
              required={field.required}
            />

            {field.description && (
              <p className={`metadata_field__description`}>{field.description}</p>
            )}

            {renderFields(
              field.fields,
              subMetadata,
              [...parentFields, field.name],
              blockData,
              onSendUpdate
            )}
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
          onSubmit={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'block') {
    const fieldData = Object.assign([], parent[field.name]);

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DataBlockField
          label={field.title || field.name}
          description={field.description}
          settings={settings}
          field={field}
          value={fieldData}
          blockData={blockData}
          fieldsRenderer={renderFields}
          parentFields={parentFields}
          filePath={metadata.filePath as string}
          parentBlock={parentBlock}
          required={!!field.required}
          onSubmit={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'dataFile') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <DataFileField
          label={field.title || field.name}
          description={field.description}
          dataFileId={field.dataFileId}
          dataFileKey={field.dataFileKey}
          dataFileValue={field.dataFileValue}
          selected={fieldValue as string}
          required={!!field.required}
          multiSelect={field.multiple}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'list') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <ListField
          label={field.title || field.name}
          description={field.description}
          value={fieldValue}
          required={!!field.required}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'contentRelationship') {
    const pages: string[] = [];

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <ContentTypeRelationshipField
          label={field.title || field.name}
          description={field.description}
          value={fieldValue as string}
          required={!!field.required}
          contentTypeName={field.contentTypeName}
          contentTypeValue={field.contentTypeValue}
          multiSelect={field.multiple}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'slug') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <SlugField
          label={field.title || field.name}
          description={field.description}
          titleValue={metadata.title as string}
          value={fieldValue}
          required={!!field.required}
          editable={field.editable}
          onChange={(value) => onSendUpdate(field.name, value, parentFields)}
        />
      </FieldBoundary>
    );
  } else if (customFields.find(f => f.name === field.type)) {
    const fieldData = customFields.find(f => f.name === field.type);
    if (fieldData) {
      return (
        <CustomField
          key={field.name}
          label={field.title || field.name}
          description={field.description}
          value={fieldValue}
          required={!!field.required}
          onChange={(value: any) => onSendUpdate(field.name, value, parentFields)}
          fieldData={fieldData} />
      );
    } else {
      return null;
    }
  } else {
    console.warn(`Unknown field type: ${field.type}`);
    return null;
  }
};
