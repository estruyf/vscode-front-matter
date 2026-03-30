import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISmartRenameActionProps { }

const SmartRenameAction: React.FunctionComponent<
  ISmartRenameActionProps
> = () => {
  const smartRename = () => {
    Messenger.send(CommandToCode.smartRename);
  };

  return (
    <ActionButton onClick={smartRename} title={l10n.t(LocalizationKey.panelSmartRenameActionTitle)}>
      {l10n.t(LocalizationKey.panelSmartRenameActionTitle)}
    </ActionButton>
  );
};

SmartRenameAction.displayName = 'SmartRenameAction';
export { SmartRenameAction };
