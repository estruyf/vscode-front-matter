import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../DashboardMessage';
import { GeneralCommands } from '../../constants';

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
