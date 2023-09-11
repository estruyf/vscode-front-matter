import * as React from 'react';
import { PanelSettings } from '../../models';
import * as l10n from "@vscode/l10n"
import { LocalizationKey } from '../../localization';
import { Messenger } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../CommandToCode';

export interface IInitializeActionProps {
  settings: PanelSettings | undefined;
}

export const InitializeAction: React.FunctionComponent<IInitializeActionProps> = ({ settings }: React.PropsWithChildren<IInitializeActionProps>) => {

  const initProject = () => {
    Messenger.send(CommandToCode.initProject);
  };

  if (settings?.isInitialized) {
    return null;
  }

  return (
    <div className={`initialize_actions`}>
      <button
        title={l10n.t(LocalizationKey.panelBaseViewInitialize)}
        onClick={initProject}
        type={`button`}>
        {l10n.t(LocalizationKey.panelBaseViewInitialize)}
      </button>
    </div>
  );
};