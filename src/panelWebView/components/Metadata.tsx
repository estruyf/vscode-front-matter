import * as React from 'react';
import { BlockFieldData, Field, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import "react-datepicker/dist/react-datepicker.css";
import useContentType from '../../hooks/useContentType';
import { WrapperField } from './Fields/WrapperField';
import { ContentTypeValidator } from './ContentType/ContentTypeValidator';
import { FeatureFlag } from '../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';

export interface IMetadata {
  [prop: string]: string[] | string | null | IMetadata;
}
export interface IMetadataProps {
  settings: PanelSettings | undefined;
  metadata: IMetadata;
  focusElm: TagType | null;
  features: string[];
  unsetFocus: () => void;
}

const Metadata: React.FunctionComponent<IMetadataProps> = ({settings, features, metadata, focusElm, unsetFocus}: React.PropsWithChildren<IMetadataProps>) => {
  const contentType = useContentType(settings, metadata);

  const sendUpdate = (field: string | undefined, value: any, parents: string[]) => {
    if (!field) {
      return;
    }

    Messenger.send(CommandToCode.updateMetadata, {
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
      <FeatureFlag features={features || []} flag={FEATURE_FLAG.panel.contentType}>
        <ContentTypeValidator
          fields={contentType?.fields || []}
          metadata={metadata} />
      </FeatureFlag>

      {
        renderFields(contentType?.fields || [], metadata)
      }
    </Collapsible>
  );
};

Metadata.displayName = 'Metadata';
export { Metadata };