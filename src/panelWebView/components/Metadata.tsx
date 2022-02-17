import * as React from 'react';
import { BlockFieldData, Field, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import { Toggle } from './Fields/Toggle';
import { SymbolKeywordIcon } from './Icons/SymbolKeywordIcon';
import { TagIcon } from './Icons/TagIcon';
import { TagPicker } from './TagPicker';
import { DateTimeField } from './Fields/DateTimeField';
import { TextField } from './Fields/TextField';
import "react-datepicker/dist/react-datepicker.css";
import { PreviewImageField, PreviewImageValue } from './Fields/PreviewImageField';
import { ListUnorderedIcon } from './Icons/ListUnorderedIcon';
import { NumberField } from './Fields/NumberField';
import { ChoiceField } from './Fields/ChoiceField';
import useContentType from '../../hooks/useContentType';
import { DateHelper } from '../../helpers/DateHelper';
import FieldBoundary from './ErrorBoundary/FieldBoundary';
import { DraftField } from './Fields/DraftField';
import { VsLabel } from './VscodeComponents';
import { DataBlockField } from './DataBlock';
import { JsonField } from './JsonField';

export interface IMetadata {
  [prop: string]: string[] | string | null | IMetadata;
}
export interface IMetadataProps {
  settings: PanelSettings | undefined;
  metadata: IMetadata;
  focusElm: TagType | null;
  unsetFocus: () => void;
}

const Metadata: React.FunctionComponent<IMetadataProps> = ({settings, metadata, focusElm, unsetFocus}: React.PropsWithChildren<IMetadataProps>) => {
  const contentType = useContentType(settings, metadata);

  const sendUpdate = (field: string | undefined, value: any, parents: string[]) => {
    if (!field) {
      return;
    }

    MessageHelper.sendMessage(CommandToCode.updateMetadata, {
      field,
      parents,
      value
    });
  };

  const getDate = (date: string | Date): Date | null => {
    const parsedDate = DateHelper.tryParse(date, settings?.date?.format);
    return parsedDate || date as Date | null;
  }

  if (!settings) {
    return null;
  }

  const renderFields = (
    ctFields: Field[], 
    parent: IMetadata, 
    parentFields: string[] = [], 
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void,
    parentBlock?: string | null
  ) => {
    if (!ctFields) {
      return;
    }

    const onSendUpdate = (field: string | undefined, value: any, parents: string[]) => {
      if (onFieldUpdate) {
        onFieldUpdate(field, value, parents);
      } else {
        sendUpdate(field, value, parents);
      }
    };

    return ctFields.map(field => {
      if (field.hidden) {
        return null;
      }

      if (field.type === 'datetime') {
        const dateValue = parent[field.name] ? getDate(parent[field.name] as string) : null;

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <DateTimeField
              label={field.title || field.name}
              date={dateValue}
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
              checked={!!parent[field.name] as any} 
              onChanged={(checked) => onSendUpdate(field.name, checked, parentFields)} />
          </FieldBoundary>
        );
      } else if (field.type === 'string') {
        const textValue = parent[field.name];

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
              value={textValue as string || null} />
          </FieldBoundary>
        );
      } else if (field.type === 'number') {
        const fieldValue = parent[field.name];
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
              value={parent[field.name] as PreviewImageValue | PreviewImageValue[] | null}
              multiple={field.multiple}
              blockData={blockData}
              onChange={(value) => onSendUpdate(field.name, value, parentFields)} />
          </FieldBoundary>
        );
      } else if (field.type === 'choice') {
        const choices = field.choices || [];
        const choiceValue = parent[field.name];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <ChoiceField
              label={field.title || field.name}
              selected={choiceValue as string}
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
              crntSelected={parent[field.name] as string[] || []} 
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
        const selectedValues = parent[field.name] || [];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <TagPicker 
              type={TagType.custom}
              label={field.title || field.name}
              icon={<ListUnorderedIcon />}
              crntSelected={selectedValues as string[] || []} 
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
        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <TagPicker 
              type={TagType.categories}
              label={field.title || field.name}
              icon={<ListUnorderedIcon />}
              crntSelected={parent.categories as string[] || []} 
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
        const value = parent[field.name];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <DraftField
              label={field.title || field.name}
              type={draftField?.type || "boolean"}
              choices={draftField?.choices || []}
              value={value as boolean | string | null | undefined}
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

                { renderFields(field.fields, subMetadata, [...parentFields, field.name], blockData, onFieldUpdate) }
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
    });
  };

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>
      
      {
        renderFields(contentType?.fields, metadata)
      }

      {
        <FieldBoundary fieldName={`Keywords`}>
          <TagPicker 
            type={TagType.keywords} 
            icon={<SymbolKeywordIcon />}
            crntSelected={metadata.keywords as string[] || []} 
            options={[]} 
            freeform={true} 
            focussed={focusElm === TagType.keywords}
            unsetFocus={unsetFocus}
            disableConfigurable />
        </FieldBoundary>
      }
    </Collapsible>
  );
};

Metadata.displayName = 'Metadata';
export { Metadata };