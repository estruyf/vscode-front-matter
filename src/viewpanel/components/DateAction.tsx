import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { ActionButton } from './ActionButton';

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
      <ActionButton onClick={setDate} title={`Set publish date`} />
      <ActionButton onClick={setLastMod} title={`Set modified date`} />
    </>
  );
};