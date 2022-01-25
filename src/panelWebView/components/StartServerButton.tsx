import * as React from 'react';
import { FrameworkDetectors } from '../../constants/FrameworkDetectors';
import { MessageHelper } from '../../helpers/MessageHelper';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import useStartCommand from '../hooks/useStartCommand';

export interface IStartServerButtonProps {
  settings: PanelSettings | undefined;
}

export const StartServerButton: React.FunctionComponent<IStartServerButtonProps> = ({settings}: React.PropsWithChildren<IStartServerButtonProps>) => {
  const { startCommand } = useStartCommand(settings);

  const startLocalServer = (command: string) => {
    MessageHelper.sendMessage(CommandToCode.frameworkCommand, { command });
  };
  
  return (
    startCommand ? <button onClick={() => startLocalServer(startCommand)}>Start server</button> : null
  );
};