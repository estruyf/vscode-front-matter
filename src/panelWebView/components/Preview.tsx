import * as React from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';

export interface IPreviewProps {
  slug: string;
}

const Preview: React.FunctionComponent<IPreviewProps> = ({slug}: React.PropsWithChildren<IPreviewProps>) => {

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

Preview.displayName = 'Preview';
export { Preview };