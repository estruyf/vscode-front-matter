

import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import useMessages from '../hooks/useMessages';

export interface IPublishActionProps {
  draft: boolean;
}

export const PublishAction: React.FunctionComponent<IPublishActionProps> = (props: React.PropsWithChildren<IPublishActionProps>) => {
  const { sendMessage } = useMessages();
  const { draft } = props;

  const publish = () => {
    sendMessage(CommandToCode.publish);
  };

  return (
    <div className={`article__action`}>
      <button onClick={publish} className={`${draft ? "" : "secondary"}`}>{draft ? "Publish" : "Revert to draft"}</button>
    </div>
  );
};