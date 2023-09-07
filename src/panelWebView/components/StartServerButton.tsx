import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import useStartCommand from '../hooks/useStartCommand';
import { LocalizationKey } from '../../localization';
import * as l10n from "@vscode/l10n"
import { EventData } from '@estruyf/vscode/dist/models';
import { Command } from '../Command';

export interface IStartServerButtonProps {
  settings: PanelSettings | undefined;
}

export const StartServerButton: React.FunctionComponent<IStartServerButtonProps> = ({
  settings
}: React.PropsWithChildren<IStartServerButtonProps>) => {
  const [isStarted, setIsStarted] = React.useState(false);
  const { startCommand } = useStartCommand(settings);

  const startLocalServer = (command: string) => {
    Messenger.send(CommandToCode.frameworkCommand, { command });
  };

  const stopLocalServer = () => {
    Messenger.send(CommandToCode.stopServer);
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command, payload } = message.data;

    if (command === Command.serverStarted) {
      setIsStarted(payload);
    }
  };

  React.useEffect(() => {
    Messenger.listen(messageListener);

    messageHandler.request<boolean>(CommandToCode.isServerStarted).then((isStarted) => {
      setIsStarted(isStarted);
    });

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  return startCommand ? (
    <>
      {
        !isStarted ? (
          <button
            title={l10n.t(LocalizationKey.panelStartServerbuttonStart)}
            type={`button`}
            onClick={() => startLocalServer(startCommand)}>
            {l10n.t(LocalizationKey.panelStartServerbuttonStart)}
          </button>
        ) : (
          <button
            title={l10n.t(LocalizationKey.panelStartServerbuttonStop)}
            type={`button`}
            onClick={() => stopLocalServer()}>
            {l10n.t(LocalizationKey.panelStartServerbuttonStop)}
          </button>
        )}
    </>
  ) : null;
};
