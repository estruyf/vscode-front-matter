import * as React from 'react';
import { Field, PanelSettings } from '../../models';
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

export interface IMetadataProps {
  settings: PanelSettings | undefined;
  metadata: { [prop: string]: string[] | string | null };
  focusElm: TagType | null;
  unsetFocus: () => void;
}

const Metadata: React.FunctionComponent<IMetadataProps> = ({settings, metadata, focusElm, unsetFocus}: React.PropsWithChildren<IMetadataProps>) => {
  const contentType = useContentType(settings, metadata);

  const sendUpdate = (field: string | undefined, value: any) => {
    if (!field) {
      return;
    }

    MessageHelper.sendMessage(CommandToCode.updateMetadata, {
      field,
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

  const renderFields = (ctFields: Field[]) => {
    if (!ctFields) {
      return;
    }

    return ctFields.map(field => {
      if (field.hidden) {
        return null;
      }

      if (field.type === 'datetime') {
        const dateValue = metadata[field.name] ? getDate(metadata[field.name] as string) : null;

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <DateTimeField
              label={field.title || field.name}
              date={dateValue}
              format={settings?.date?.format}
              onChange={(date => sendUpdate(field.name, date))} />
          </FieldBoundary>
        );
      } else if (field.type === 'boolean') {
        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <Toggle 
              key={field.name}
              label={field.title || field.name}
              checked={!!metadata[field.name] as any} 
              onChanged={(checked) => sendUpdate(field.name, checked)} />
          </FieldBoundary>
        );
      } else if (field.type === 'string') {
        const textValue = metadata[field.name];

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
              onChange={(value) => sendUpdate(field.name, value)}
              value={textValue as string || null} />
          </FieldBoundary>
        );
      } else if (field.type === 'number') {
        const fieldValue = metadata[field.name];
        let nrValue: number | null = parseInt(fieldValue as string);
        if (isNaN(nrValue)) {
          nrValue = null;
        }

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <NumberField 
              key={field.name}
              label={field.title || field.name}
              onChange={(value) => sendUpdate(field.name, value)}
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
              value={metadata[field.name] as PreviewImageValue | PreviewImageValue[] | null}
              multiple={field.multiple}
              onChange={(value => sendUpdate(field.name, value))} />
          </FieldBoundary>
        );
      } else if (field.type === 'choice') {
        const choices = field.choices || [];
        const choiceValue = metadata[field.name];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <ChoiceField
              label={field.title || field.name}
              selected={choiceValue as string}
              choices={choices}
              multiSelect={field.multiple}
              onChange={(value => sendUpdate(field.name, value))} />
          </FieldBoundary>
        );
      } else if (field.type === 'tags') {
        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <TagPicker 
              type={TagType.tags} 
              label={field.title || field.name}
              icon={<TagIcon />}
              crntSelected={metadata[field.name] as string[] || []} 
              options={settings?.tags || []} 
              freeform={settings.freeform} 
              focussed={focusElm === TagType.tags}
              unsetFocus={unsetFocus} />
          </FieldBoundary>
        );
      } else if (field.type === 'taxonomy') {
        const taxonomyData = settings.customTaxonomy.find(ct => ct.id === field.taxonomyId);
        const selectedValues = metadata[field.name] || [];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <TagPicker 
              type={TagType.custom}
              label={field.title || field.name}
              icon={<ListUnorderedIcon />}
              crntSelected={selectedValues as string[] || []} 
              options={taxonomyData?.options || []} 
              freeform={settings.freeform} 
              focussed={focusElm === TagType.custom}
              unsetFocus={unsetFocus}
              fieldName={field.name}
              taxonomyId={field.taxonomyId} />
          </FieldBoundary>
        );
      } else if (field.type === 'categories') {
        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <TagPicker 
              type={TagType.categories}
              label={field.title || field.name}
              icon={<ListUnorderedIcon />}
              crntSelected={metadata.categories as string[] || []} 
              options={settings.categories} 
              freeform={settings.freeform} 
              focussed={focusElm === TagType.categories}
              unsetFocus={unsetFocus} />
          </FieldBoundary>
        );
      } else if (field.type === 'draft') {
        const draftField = settings?.draftField;
        const value = metadata[field.name];

        return (
          <FieldBoundary key={field.name} fieldName={field.title || field.name}>
            <DraftField
              label={field.title || field.name}
              type={draftField.type}
              choices={draftField.choices || []}
              value={value as boolean | string | null | undefined}
              onChanged={(value: boolean | string) => sendUpdate(field.name, value)} />
          </FieldBoundary>
        );
      } else {
        return null;
      }
    });
  };

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>

      {
        renderFields(contentType?.fields)
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