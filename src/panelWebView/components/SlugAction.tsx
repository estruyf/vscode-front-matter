import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISlugActionProps { }

const SlugAction: React.FunctionComponent<
  ISlugActionProps
> = ({ }: React.PropsWithChildren<ISlugActionProps>) => {
  const optimize = () => {
    Messenger.send(CommandToCode.updateSlug);
  };

  return (
    <ActionButton onClick={optimize} title={l10n.t(LocalizationKey.panelSlugActionTitle)}>
      {l10n.t(LocalizationKey.panelSlugActionTitle)}
    </ActionButton>
  );
};

SlugAction.displayName = 'SlugAction';
export { SlugAction };
