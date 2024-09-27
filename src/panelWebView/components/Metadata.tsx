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
import { FEATURE_FLAG, GeneralCommands } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { DEFAULT_PANEL_FEATURE_FLAGS } from '../../constants/DefaultFeatureFlags';

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

  const focusProblems = () => {
    Messenger.send(GeneralCommands.toVSCode.runCommand, {
      command: `workbench.panel.markers.view.focus`
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      id={`metadata`}
      title={`${l10n.t(LocalizationKey.panelMetadataTitle)}${contentType?.name ? ` (${contentType?.name})` : ""}`}
      className={`inherit z-20`}>
      <FeatureFlag features={features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.contentType}>
        <ContentTypeValidator fields={contentType?.fields || []} metadata={metadata} />
      </FeatureFlag>

      <div className='metadata_fields space-y-6'>
        {
          metadata.fmError && metadata.fmErrorMessage ? (
            <div className={`space-y-4`}>
              <p className={`text-[var(--vscode-errorForeground)]`}>{metadata.fmError}</p>

              <button
                title={l10n.t(LocalizationKey.panelMetadataFocusProblems)}
                onClick={focusProblems}
                type={`button`}>
                {l10n.t(LocalizationKey.panelMetadataFocusProblems)}
              </button>
            </div>
          ) : allFields
        }
      </div>
    </Collapsible>
  );
};

Metadata.displayName = 'Metadata';
export { Metadata };
