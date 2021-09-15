import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import { Toggle } from './Fields/Toggle';
import { ListUnorderedIcon } from './Icons/ListUnorderedIcon';
import { RocketIcon } from './Icons/RocketIcon';
import { SymbolKeywordIcon } from './Icons/SymbolKeywordIcon';
import { TagIcon } from './Icons/TagIcon';
import { TagPicker } from './TagPicker';
import { VsLabel } from './VscodeComponents';
import { useState } from 'react';

import "react-datepicker/dist/react-datepicker.css";
import { parseJSON } from 'date-fns';
import { DateTime } from './Fields/DateTime';

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

  let publishing: Date | null = null;
  let modifying: Date | null = null;

  if (settings?.date) {
    const { modDate, pubDate } = settings.date;
    publishing = metadata[pubDate] ? getDate(metadata[pubDate] as string) : null;
    modifying = metadata[modDate] ? getDate(metadata[modDate] as string) : null;
  }

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>

      <DateTime
        label={`Article date`}
        date={publishing}
        format={settings?.date?.format}
        onChange={(date => sendUpdate(settings?.date?.pubDate, date))} />

      {
        modifying && (
          <DateTime
            label={`Modified date`}
            date={modifying}
            format={settings?.date?.format}
            onChange={(date => sendUpdate(settings?.date?.modDate, date))} />
        )
      }

      <div className={`metadata_field`}>
        <VsLabel>
          <div className={`metadata_field__label`}>
            <RocketIcon /> <span style={{ lineHeight: "16px"}}>Published</span>
          </div>
        </VsLabel>

        <Toggle 
          checked={!metadata.draft as any} 
          onChanged={(checked) => sendUpdate("draft", !checked)} />
      </div>

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

      {
        (settings) && (
          <TagPicker type={TagType.tags} 
                     icon={<TagIcon />}
                     crntSelected={metadata.tags as string[] || []} 
                     options={settings?.tags || []} 
                     freeform={settings.freeform} 
                     focussed={focusElm === TagType.tags}
                     unsetFocus={unsetFocus} />
        )
      }
      {
        (settings && settings.categories && settings.categories.length > 0) && (
          <TagPicker type={TagType.categories}
                     icon={<ListUnorderedIcon />}
                     crntSelected={metadata.categories as string[] || []} 
                     options={settings.categories} 
                     freeform={settings.freeform} 
                     focussed={focusElm === TagType.categories}
                     unsetFocus={unsetFocus} />
        )
      }
    </Collapsible>
  );
};