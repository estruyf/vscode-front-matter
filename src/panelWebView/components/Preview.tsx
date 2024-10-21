import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IPreviewProps { }

const Preview: React.FunctionComponent<IPreviewProps> = () => {
  const open = () => {
    Messenger.send(CommandToCode.openPreview);
  };

  return (
    <ActionButton onClick={open} title={l10n.t(LocalizationKey.panelPreviewTitle)}>
      {l10n.t(LocalizationKey.panelPreviewTitle)}
    </ActionButton>
  );
};

Preview.displayName = 'Preview';
export { Preview };
