import * as React from 'react';
import { BlockFieldData, Field, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import { SymbolKeywordIcon } from './Icons/SymbolKeywordIcon';
import { TagPicker } from './TagPicker';
import "react-datepicker/dist/react-datepicker.css";
import useContentType from '../../hooks/useContentType';
import FieldBoundary from './ErrorBoundary/FieldBoundary';
import { WrapperField } from './Fields/WrapperField';

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
  ) : (JSX.Element | null)[] | undefined => {
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

    return ctFields.map(field => (
      <WrapperField
        key={field.name}
        field={field}
        parent={parent}
        parentFields={parentFields}
        metadata={metadata}
        settings={settings}
        blockData={blockData}
        parentBlock={parentBlock}
        focusElm={focusElm}
        onSendUpdate={onSendUpdate}
        unsetFocus={unsetFocus}
        renderFields={renderFields}
         />
    ));
  };

  return (
    <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>
      
      {
        renderFields(contentType?.fields || [], metadata)
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