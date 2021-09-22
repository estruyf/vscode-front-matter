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
import { parseJSON } from 'date-fns';
import { DateTimeField } from './Fields/DateTimeField';
import { TextField } from './Fields/TextField';
import "react-datepicker/dist/react-datepicker.css";
import { PreviewImageField } from './Fields/PreviewImageField';
import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from '../../constants/ContentType';
import { ListUnorderedIcon } from './Icons/ListUnorderedIcon';
import { NumberField } from './Fields/NumberField';
import { ChoiceField } from './Fields/ChoiceField';

export interface IMetadataProps {
  settings: PanelSettings | undefined;
  metadata: { [prop: string]: string[] | string | null };
  focusElm: TagType | null;
  unsetFocus: () => void;
}

export const Metadata: React.FunctionComponent<IMetadataProps> = ({settings, metadata, focusElm, unsetFocus}: React.PropsWithChildren<IMetadataProps>) => {

  const sendUpdate = (field: string | undefined, value: any) => {
    if (!field) {
      return;
    }

    MessageHelper.sendMessage(CommandToCode.updateMetadata, {
      field,
      value
    });
  };

  const getDate = (date: string | Date) => {
    if (typeof date === 'string') {
      return parseJSON(date);
    }
    return date;
  }

  if (!settings) {
    return null;
  }

  const contentTypeName = metadata.type as string || DEFAULT_CONTENT_TYPE_NAME;
  let contentType = settings.contentTypes.find(ct => ct.name === contentTypeName);

  if (!contentType) {
    contentType = settings.contentTypes.find(ct => ct.name === DEFAULT_CONTENT_TYPE_NAME);
  }

  if (!contentType || !contentType.fields) {
    contentType = DEFAULT_CONTENT_TYPE;
  }

  const renderFields = (ctFields: Field[]) => {
    if (!ctFields) {
      return;
    }

    return ctFields.map(field => {
      if (field.type === 'datetime') {
        const dateValue = metadata[field.name] ? getDate(metadata[field.name] as string) : null;

        return (
          <DateTimeField
            key={field.name}
            label={field.title || field.name}
            date={dateValue}
            format={settings?.date?.format}
            onChange={(date => sendUpdate(field.name, date))} />
        );
      } else if (field.type === 'boolean') {
        return (
          <Toggle 
            key={field.name}
            label={field.title || field.name}
            checked={!!metadata[field.name] as any} 
            onChanged={(checked) => sendUpdate(field.name, checked)} />
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
          <TextField 
            key={field.name}
            label={field.title || field.name}
            limit={limit}
            rows={3}
            onChange={(value) => sendUpdate(field.name, value)}
            value={textValue as string || null} />
        );
      } else if (field.type === 'number') {
        const fieldValue = metadata[field.name];
        let nrValue: number | null = parseInt(fieldValue as string);
        if (isNaN(nrValue)) {
          nrValue = null;
        }

        return (
          <NumberField 
            key={field.name}
            label={field.title || field.name}
            onChange={(value) => sendUpdate(field.name, value)}
            value={nrValue} />
        );
      } else if (field.type === 'image') {
        return (
          <PreviewImageField 
            key={field.name}
            label={field.title || field.name}
            fieldName={field.name}
            filePath={metadata.filePath as string}
            value={metadata[field.name] as string}
            onChange={(value => sendUpdate(field.name, value))} />
        );
      } else if (field.type === 'choice') {
        const choices = field.choices || [];
        const choiceValue = metadata[field.name];

        return (
          <ChoiceField
            key={field.name}
            label={field.title || field.name}
            selected={choiceValue as string}
            choices={choices}
            onChange={(value => sendUpdate(field.name, value))} />
        );
      } else if (field.type === 'tags') {
        return (
          <TagPicker 
            key={field.name}
            type={TagType.tags} 
            label={field.title || field.name}
            icon={<TagIcon />}
            crntSelected={metadata[field.name] as string[] || []} 
            options={settings?.tags || []} 
            freeform={settings.freeform} 
            focussed={focusElm === TagType.tags}
            unsetFocus={unsetFocus} />
        );
      } else if (field.type === 'categories') {
        return (
          <TagPicker 
            key={field.name}
            type={TagType.categories}
            label={field.title || field.name}
            icon={<ListUnorderedIcon />}
            crntSelected={metadata.categories as string[] || []} 
            options={settings.categories} 
            freeform={settings.freeform} 
            focussed={focusElm === TagType.categories}
            unsetFocus={unsetFocus} />
        );
      }
    });
  };

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>

      {
        renderFields(contentType?.fields)
      }

      {
        <TagPicker type={TagType.keywords} 
                   icon={<SymbolKeywordIcon />}
                   crntSelected={metadata.keywords as string[] || []} 
                   options={[]} 
                   freeform={true} 
                   focussed={focusElm === TagType.keywords}
                   unsetFocus={unsetFocus}
                   disableConfigurable />
      }
    </Collapsible>
  );
};