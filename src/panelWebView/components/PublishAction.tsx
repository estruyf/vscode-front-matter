import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';

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
      title={draft ? 'Publish' : 'Revert to draft'}
    />
  );
};

PublishAction.displayName = 'PublishAction';
export { PublishAction };
