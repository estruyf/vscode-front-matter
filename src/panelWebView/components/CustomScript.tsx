import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';
import { Messenger } from '@estruyf/vscode/dist/client';

export interface ICustomScriptProps {
  title: string;
  script: string;
}

const CustomScript: React.FunctionComponent<ICustomScriptProps> = ({
  title,
  script
}: React.PropsWithChildren<ICustomScriptProps>) => {
  const runCustomScript = () => {
    Messenger.send(CommandToCode.runCustomScript, { title, script });
  };

  return (
    <ActionButton onClick={runCustomScript} title={title}>
      {title}
    </ActionButton>
  );
};

CustomScript.displayName = 'CustomScript';
export { CustomScript };
