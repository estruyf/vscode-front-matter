import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../DashboardMessage';
import { GeneralCommands } from '../../constants';
import { CustomScript } from '../../models';

export const openFile = (filePath?: string) => {
  if (!filePath) {
    return;
  }

  messageHandler.send(DashboardMessage.openFile, filePath);
};

export const deletePage = (filePath?: string) => {
  if (!filePath) {
    return;
  }

  messageHandler.send(DashboardMessage.deleteFile, filePath);
};

export const openOnWebsite = (websiteUrl?: string, filePath?: string) => {
  if (!websiteUrl) {
    return;
  }

  messageHandler.send(GeneralCommands.toVSCode.openOnWebsite, {
    websiteUrl,
    filePath
  });
};

export const copyToClipboard = (value: string) => {
  if (!value) {
    return;
  }

  messageHandler.send(DashboardMessage.copyToClipboard, value);
};

export const runCustomScript = (script: CustomScript, path: string) => {
  if (!script) {
    return;
  }

  messageHandler.send(DashboardMessage.runCustomScript, { script, path });
};
