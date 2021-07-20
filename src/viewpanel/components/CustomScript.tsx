import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';

export interface ICustomScriptProps {
  title: string;
  script: string;
}

export const CustomScript: React.FunctionComponent<ICustomScriptProps> = ({title, script}: React.PropsWithChildren<ICustomScriptProps>) => {

  const runCustomScript = () => {
    MessageHelper.sendMessage(CommandToCode.runCustomScript, { title, script });
  };

  return (
    <div className={`article__action`}>
      <button onClick={runCustomScript}>{title}</button>
    </div>
  );
};