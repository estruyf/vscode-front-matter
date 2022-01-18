import * as React from 'react';
import { DEFAULT_FILE_TYPES } from '../../constants/DefaultFileTypes';
import { MessageHelper } from '../../helpers/MessageHelper';
import { CommandToCode } from '../CommandToCode';
import { FileIcon } from './Icons/FileIcon';
import { MarkdownIcon } from './Icons/MarkdownIcon';

export interface IFileItemProps {
  name: string;
  path: string;
}

const FileItem: React.FunctionComponent<IFileItemProps> = ({ name, path }: React.PropsWithChildren<IFileItemProps>) => {
  
  const openFile = () => {
    MessageHelper.sendMessage(CommandToCode.openInEditor, path);
  };

  // File extension
  const fileExtension = `.${name.split('.').pop()}`;

  return (
    <li className={`file_list__items__item`}
        onClick={openFile}>
      {
        (DEFAULT_FILE_TYPES.includes(fileExtension)) ? (
          <MarkdownIcon />
        ) : (
          <FileIcon />
        )
      }

      <span>{name}</span>
    </li>
  );
};

FileItem.displayName = 'FileItem';
export { FileItem };