import { GeneralCommands } from '../constants';

export const ignoreMsgCommand = (command: string) => {
  const toIgnore = [
    GeneralCommands.toVSCode.logging.verbose,
    GeneralCommands.toVSCode.logging.info,
    GeneralCommands.toVSCode.logging.warn,
    GeneralCommands.toVSCode.logging.error
  ];

  return toIgnore.includes(command);
};
