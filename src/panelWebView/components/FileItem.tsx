import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useMemo } from 'react';
import { DEFAULT_FILE_TYPES } from '../../constants/DefaultFileTypes';
import { CommandToCode } from '../CommandToCode';
import { FileIcon } from './Icons/FileIcon';
import { MarkdownIcon } from './Icons/MarkdownIcon';

export interface IFileItemProps {
  name: string;
  path: string;
  folderName: string | undefined;
}

const FileItem: React.FunctionComponent<IFileItemProps> = ({ name, folderName, path }: React.PropsWithChildren<IFileItemProps>) => {

  const openFile = () => {
    Messenger.send(CommandToCode.openInEditor, path);
  };

  /*  
      File names which would not give any info about the content.
      by themselves, e.g.: index | +page | etc…
      Ideally we should have access to the `defaultFileName`
      property of the contentType here to check.
  */
  const vagueFileNamesList = ['index', '+page']

  const itemName = useMemo(() => {
    if (folderName && vagueFileNamesList.some(vagueFileName => name.includes(vagueFileName + '.'))) {
      return folderName;
    }

    return name;
  }, [name, folderName]);

  // File extension
  const fileExtension = useMemo(() => `.${name.split('.').pop()}`, [name]);

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

      <span>{itemName}</span>
    </li>
  );
};

FileItem.displayName = 'FileItem';
export { FileItem };