import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IPublishActionProps {
  draft: boolean;
}

const PublishAction: React.FunctionComponent<IPublishActionProps> = (
  props: React.PropsWithChildren<IPublishActionProps>
) => {
  const { draft } = props;

  const publish = () => {
    Messenger.send(CommandToCode.publish);
  };

  return (
    <ActionButton
      onClick={publish}
      className={`${draft ? '' : 'secondary'}`}
      title={draft ? l10n.t(LocalizationKey.panelPublishActionPublish) : l10n.t(LocalizationKey.panelPublishActionUnpublish)}
    >
      {draft ? l10n.t(LocalizationKey.panelPublishActionPublish) : l10n.t(LocalizationKey.panelPublishActionUnpublish)}
    </ActionButton>
  );
};

PublishAction.displayName = 'PublishAction';
export { PublishAction };
