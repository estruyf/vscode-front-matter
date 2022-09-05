import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import useStartCommand from '../hooks/useStartCommand';

export interface IStartServerButtonProps {
  settings: PanelSettings | undefined;
}

export const StartServerButton: React.FunctionComponent<IStartServerButtonProps> = ({settings}: React.PropsWithChildren<IStartServerButtonProps>) => {
  const { startCommand } = useStartCommand(settings);

  const startLocalServer = (command: string) => {
    Messenger.send(CommandToCode.frameworkCommand, { command });
  };

  const stopLocalServer = () => {
    Messenger.send(CommandToCode.stopServer);
  };
  
  return (
    startCommand ? (
      <>
        <button onClick={() => startLocalServer(startCommand)}>Start server</button>
        <button onClick={() => stopLocalServer()}>Stop server</button>
      </>
    ) : null
  );
};