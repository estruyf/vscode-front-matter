import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { BlockFieldData, ContentType, CustomPanelViewResult, Field, PanelSettings } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { TagType } from '../../TagType';
import { DataBlockField } from '../DataBlock';
import FieldBoundary from '../ErrorBoundary/FieldBoundary';
import { ListUnorderedIcon } from '../Icons/ListUnorderedIcon';
import { TagIcon } from '../Icons/TagIcon';
import { JsonField } from '../JsonField';
import { IMetadata } from '../Metadata';
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
  CustomField,
  FieldCollection,
  TagPicker,
  WYSIWYGType
} from '.';
import { fieldWhenClause } from '../../../utils/fieldWhenClause';
import { ContentTypeRelationshipField } from './ContentTypeRelationshipField';
import { LocalizationKey, localize } from '../../../localization';
import { GeneralCommands } from '../../../constants';
const WysiwygField = React.lazy(() => import('./WysiwygField'));

export interface IWrapperFieldProps {
  field: Field;
  allFields: Field[];
  parent: IMetadata;
  parentFields: string[];
  metadata: IMetadata;
  settings: PanelSettings;
  contentType: ContentType | null;
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
    parentBlock?: string | null,
    triggerUpdateOnDefault?: boolean
  ) => (JSX.Element | null)[] | undefined;
  triggerUpdateOnDefault?: boolean;
}

export const WrapperField: React.FunctionComponent<IWrapperFieldProps> = ({
  field,
  allFields,
  parent,
  parentFields,
  metadata,
  settings,
  contentType,
  blockData,
  focusElm,
  parentBlock,
  onSendUpdate,
  unsetFocus,
  renderFields,
  triggerUpdateOnDefault
}: React.PropsWithChildren<IWrapperFieldProps>) => {
  const [fieldValue, setFieldValue] = useState<any | undefined>(undefined);
  const [customFields, setCustomFields] = useState<{
    name: string;
    html: (data: any, onChange: (value: any) => void) => Promise<CustomPanelViewResult | undefined>;
  }[]>([]);

  const getDate = (date: string | Date): Date | null => {
    const parsedDate = DateHelper.tryParse(date, settings?.date?.format);
    return parsedDate || (date as Date | null);
  };

  const onFieldChange = useCallback((value: any) => onSendUpdate(field.name, value, parentFields), [field.name, parentFields, onSendUpdate]);

  useEffect(() => {
    let value: any = parent[field.name];

    if (field.type === 'tags' || field.type === 'categories' || field.type === 'taxonomy') {
      setFieldValue(value || []);
      return;
    }

    if (field.type === 'datetime') {
      value = value ? getDate(value) : undefined;
    }

    if (value === undefined && field.default) {
      value = field.default;

      if (field.type === 'datetime') {
        if (value === '{{now}}') {
          value = new Date();
        }

        value = getDate(value) || null;
      }

      if (triggerUpdateOnDefault) {
        onSendUpdate(field.name, value, parentFields);
      }
    }

    // Check if the field value contains a placeholder
    if (value && typeof value === 'string' && value.includes(`{{`) && value.includes(`}}`)) {
      messageHandler.request<{ field: string; value: any; }>(CommandToCode.updatePlaceholder, {
        field: field.name,
        value,
        data: metadata,
        contentType
      }).then((data) => {
        if (data.field === field.name) {
          setFieldValue(data.value);
          onSendUpdate(field.name, data.value, parentFields);
        }
      }).catch((err) => {
        console.error(err);
      });
    } else {
      // Did not contain a placeholder, so value can be set
      if (fieldValue === undefined || value !== fieldValue) {
        if (typeof value === 'number') {
          setFieldValue(value);
        } else if (field.type === "slug") {
          setFieldValue(value);
        } else {
          setFieldValue(value || null);
        }
      }
    }
  }, [field, parent, triggerUpdateOnDefault]);

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

    if (field.hidden) {
      return null;
    }
  }

  // Conditional fields
  if (typeof field.when !== 'undefined') {
    const shouldRender = fieldWhenClause(field, parent, allFields);

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
          onChange={onFieldChange}
          timezone={settings?.date?.timezone}
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
          onChanged={onFieldChange}
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

    if (field.wysiwyg) {
      return (
        <FieldBoundary key={field.name} fieldName={field.title || field.name}>
          <React.Suspense
            fallback={<div>{localize(LocalizationKey.panelFieldsTextFieldLoading)}</div>}
          >
            <WysiwygField
              name={field.name}
              label={field.title || field.name}
              description={field.description}
              limit={limit}
              type={typeof field.wysiwyg === 'boolean' ? 'html' : field.wysiwyg.toLowerCase() as WYSIWYGType}
              onChange={onFieldChange}
              value={(fieldValue as string) || null}
              required={!!field.required} />
          </React.Suspense>
        </FieldBoundary>
      );
    } else {
      return (
        <FieldBoundary key={field.name} fieldName={field.title || field.name}>
          <TextField
            name={field.name}
            label={field.title || field.name}
            description={field.description}
            singleLine={field.single}
            limit={limit}
            rows={4}
            onChange={onFieldChange}
            value={(fieldValue as string) || null}
            required={!!field.required}
            settings={settings}
            actions={field.actions}
          />
        </FieldBoundary>
      );
    }
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
          onChange={onFieldChange}
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
          onChange={onFieldChange}
          actions={field.actions}
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
          onChange={onFieldChange}
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
          onChange={onFieldChange}
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
          renderAsString={field.singleValueAsString}
          required={!!field.required}
          actions={field.actions}
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
          renderAsString={field.singleValueAsString}
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
          renderAsString={field.singleValueAsString}
          required={!!field.required}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'draft') {
    const draftField = settings?.draftField;
    let draftValue = parent[field.name];

    if (!draftValue && typeof parent[field.name] === 'undefined' && field.default) {
      draftValue = field.default as string;
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
          onChanged={onFieldChange}
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
              onSendUpdate,
              null,
              true
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
          onSubmit={onFieldChange}
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
          onSubmit={onFieldChange}
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
          onChange={onFieldChange}
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
          onChange={onFieldChange}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'contentRelationship') {
    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <ContentTypeRelationshipField
          label={field.title || field.name}
          description={field.description}
          value={fieldValue as string}
          required={!!field.required}
          contentTypeName={field.contentTypeName}
          contentTypeValue={field.contentTypeValue}
          sameContentLocale={field.sameContentLocale}
          multiSelect={field.multiple}
          onChange={onFieldChange}
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
          slugTemplate={contentType?.slugTemplate}
          required={!!field.required}
          editable={field.editable}
          onChange={onFieldChange}
        />
      </FieldBoundary>
    );
  } else if (field.type === 'customField') {
    const fieldData = customFields.find(f => f.name === field.customType);
    if (fieldData) {
      return (
        <CustomField
          key={field.name}
          label={field.title || field.name}
          description={field.description}
          value={fieldValue}
          required={!!field.required}
          onChange={onFieldChange}
          fieldData={fieldData} />
      );
    } else {
      return null;
    }
  } else if (field.type === "fieldCollection") {
    if (!parent[field.name]) {
      parent[field.name] = {};
    }

    const subMetadata = parent[field.name] as IMetadata;

    return (
      <FieldBoundary key={field.name} fieldName={field.title || field.name}>
        <FieldCollection
          key={field.name}
          field={field}
          parent={subMetadata}
          parentFields={parentFields}
          renderFields={renderFields}
          settings={settings}
          blockData={blockData}
          onChange={onSendUpdate}
        />
      </FieldBoundary>
    );
  } else {
    messageHandler.send(GeneralCommands.toVSCode.logging.verbose, {
      message: localize(LocalizationKey.panelFieldsWrapperFieldUnknown, field.type),
      location: 'PANEL'
    });
    return null;
  }
};
