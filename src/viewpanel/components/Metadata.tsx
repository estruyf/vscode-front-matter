import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import { Toggle } from './Fields/Toggle';
import { ListUnorderedIcon } from './Icons/ListUnorderedIcon';
import { RocketIcon } from './Icons/RocketIcon';
import { SymbolKeywordIcon } from './Icons/SymbolKeywordIcon';
import { TagIcon } from './Icons/TagIcon';
import { TagPicker } from './TagPicker';
import { VsCheckbox, VsLabel } from './VscodeComponents';

export interface IMetadataProps {
  settings: PanelSettings | undefined;
  metadata: { [prop: string]: string[] | null };
  focusElm: TagType | null;
  unsetFocus: () => void;
}

export const Metadata: React.FunctionComponent<IMetadataProps> = ({settings, metadata, focusElm, unsetFocus}: React.PropsWithChildren<IMetadataProps>) => {

  const sendUpdate = (field: string, value: any) => {
    MessageHelper.sendMessage(CommandToCode.updateMetadata, {
      field,
      value
    });
  };

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>

      <div className={`metadata_field`}>
        <VsLabel>
          <div className={`metadata_field__label`}>
            <RocketIcon /> <span style={{ lineHeight: "16px"}}>Published</span>
          </div>
        </VsLabel>
        <Toggle checked={!metadata.draft as any} onChanged={(checked) => sendUpdate("draft", !checked)} />
      </div>

      {
        <TagPicker type={TagType.keywords} 
                   icon={<SymbolKeywordIcon />}
                   crntSelected={metadata.keywords || []} 
                   options={[]} 
                   freeform={true} 
                   focussed={focusElm === TagType.keywords}
                   unsetFocus={unsetFocus}
                   disableConfigurable />
      }
      {
        (settings && settings.tags && settings.tags.length > 0) && (
          <TagPicker type={TagType.tags} 
                     icon={<TagIcon />}
                     crntSelected={metadata.tags || []} 
                     options={settings.tags} 
                     freeform={settings.freeform} 
                     focussed={focusElm === TagType.tags}
                     unsetFocus={unsetFocus} />
        )
      }
      {
        (settings && settings.categories && settings.categories.length > 0) && (
          <TagPicker type={TagType.categories}
                     icon={<ListUnorderedIcon />}
                     crntSelected={metadata.categories || []} 
                     options={settings.categories} 
                     freeform={settings.freeform} 
                     focussed={focusElm === TagType.categories}
                     unsetFocus={unsetFocus} />
        )
      }
    </Collapsible>
  );
};