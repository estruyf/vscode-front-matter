import * as React from 'react';
import { BlockFieldData, Field, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { Collapsible } from './Collapsible';
import 'react-datepicker/dist/react-datepicker.css';
import useContentType from '../../hooks/useContentType';
import { WrapperField } from './Fields/WrapperField';
import { ContentTypeValidator } from './ContentType/ContentTypeValidator';
import { FeatureFlag } from '../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

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

const Metadata: React.FunctionComponent<IMetadataProps> = ({
  settings,
  features,
  metadata,
  focusElm,
  unsetFocus
}: React.PropsWithChildren<IMetadataProps>) => {
  const contentType = useContentType(settings, metadata);

  const onSendUpdate = React.useCallback((field: string | undefined, value: any, parents: string[]) => {
    if (!field) {
      return;
    }

    Messenger.send(CommandToCode.updateMetadata, {
      field,
      parents,
      value,
      filePath: metadata.filePath
    });
  }, [metadata.filePath]);

  const renderFields = (
    ctFields: Field[],
    parent: IMetadata,
    parentFields: string[] = [],
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void,
    parentBlock?: string | null
  ): (JSX.Element | null)[] | undefined => {
    if (!ctFields || !settings) {
      return;
    }

    return ctFields.map((field) => (
      <WrapperField
        key={field.name}
        field={field}
        allFields={ctFields}
        parent={parent}
        parentFields={parentFields}
        metadata={metadata}
        contentType={contentType}
        settings={settings}
        blockData={blockData}
        parentBlock={parentBlock}
        focusElm={focusElm}
        onSendUpdate={onFieldUpdate || onSendUpdate}
        unsetFocus={unsetFocus}
        renderFields={renderFields}
      />
    ));
  };

  const allFields = React.useMemo(() => renderFields(contentType?.fields || [], metadata), [contentType?.fields, JSON.stringify(metadata)]);

  if (!settings) {
    return null;
  }

  return (
    <Collapsible
      id={`tags`}
      title={`${l10n.t(LocalizationKey.panelMetadataTitle)}${contentType?.name ? ` (${contentType?.name})` : ""}`}
      className={`inherit z-20`}>
      <FeatureFlag features={features || []} flag={FEATURE_FLAG.panel.contentType}>
        <ContentTypeValidator fields={contentType?.fields || []} metadata={metadata} />
      </FeatureFlag>

      {allFields}
    </Collapsible>
  );
};

Metadata.displayName = 'Metadata';
export { Metadata };
