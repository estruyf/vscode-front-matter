import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { ActionButton } from './ActionButton';

export interface IPreviewProps {
  slug: string;
}

export const Preview: React.FunctionComponent<IPreviewProps> = ({slug}: React.PropsWithChildren<IPreviewProps>) => {

  const open = () => {
    MessageHelper.sendMessage(CommandToCode.openPreview);
  };

  if (!slug) {
    return null;
  }

  return (
    <ActionButton onClick={open} title={`Open preview`} />
  );
};