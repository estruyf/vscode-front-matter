

import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import useMessages from '../hooks/useMessages';

export interface IDateActionProps {}

export const DateAction: React.FunctionComponent<IDateActionProps> = (props: React.PropsWithChildren<IDateActionProps>) => {
  const { sendMessage } = useMessages(); 

  const setDate = () => {
    sendMessage(CommandToCode.updateDate);
  };

  return (
    <div className={`article__action`}>
      <button onClick={setDate}>Set current date</button>
    </div>
  );
};