import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { ActionButton } from './ActionButton';

export interface ICustomScriptProps {
  title: string;
  script: string;
}

export const CustomScript: React.FunctionComponent<ICustomScriptProps> = ({title, script}: React.PropsWithChildren<ICustomScriptProps>) => {

  const runCustomScript = () => {
    MessageHelper.sendMessage(CommandToCode.runCustomScript, { title, script });
  };

  return (
    <ActionButton onClick={runCustomScript} title={title} />
  );
};