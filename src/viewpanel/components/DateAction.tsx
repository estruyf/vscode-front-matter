import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';

export interface IDateActionProps {}

export const DateAction: React.FunctionComponent<IDateActionProps> = (props: React.PropsWithChildren<IDateActionProps>) => {

  const setDate = () => {
    MessageHelper.sendMessage(CommandToCode.updateDate);
  };
  
  const setLastMod = () => {
    MessageHelper.sendMessage(CommandToCode.updateLastMod);
  };

  return (
    <>
      <div className={`article__action`}>
        <button onClick={setDate}>Set publish date</button>
      </div>
      <div className={`article__action`}>
        <button onClick={setLastMod}>Set modified date</button>
      </div>
    </>
  );
};