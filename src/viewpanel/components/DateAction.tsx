

import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';

export interface IDateActionProps {}

export const DateAction: React.FunctionComponent<IDateActionProps> = (props: React.PropsWithChildren<IDateActionProps>) => {

  const setDate = () => {
    MessageHelper.sendMessage(CommandToCode.updateDate);
  };

  return (
    <div className={`article__action`}>
      <button onClick={setDate}>Set current date</button>
    </div>
  );
};