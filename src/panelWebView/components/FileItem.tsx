import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { DEFAULT_FILE_TYPES } from '../../constants/DefaultFileTypes';
import { CommandToCode } from '../CommandToCode';
import { PanelSettingsAtom } from '../state';
import { FileIcon } from './Icons/FileIcon';
import { MarkdownIcon } from './Icons/MarkdownIcon';

export interface IFileItemProps {
  name: string;
  path: string;
  folderName: string | undefined;
}

const FileItem: React.FunctionComponent<IFileItemProps> = ({
  name,
  folderName,
  path
}: React.PropsWithChildren<IFileItemProps>) => {
  const settings = useRecoilValue(PanelSettingsAtom);

  const openFile = () => {
    Messenger.send(CommandToCode.openInEditor, path);
  };

  const itemName = useMemo(() => {
    let vagueFileNamesList = ['index', '+page'];
    const contentTypes = settings?.contentTypes || [];
    const defaultNames = contentTypes.map(contentType => contentType.defaultFileName || "index");
    vagueFileNamesList = [...vagueFileNamesList, ...defaultNames];
    vagueFileNamesList = [...new Set(vagueFileNamesList)];

    if (folderName && vagueFileNamesList.some(vagueFileName => name.includes(vagueFileName + '.'))) {
      return folderName;
    }

    return name;
  }, [name, folderName, settings?.contentTypes]);

  // File extension
  const fileExtension = useMemo(() => `.${name.split('.').pop()}`, [name]);

  return (
    <li className={`file_list__items__item`} onClick={openFile}>
      {DEFAULT_FILE_TYPES.includes(fileExtension) ? <MarkdownIcon /> : <FileIcon />}

      <span>{itemName}</span>
    </li>
  );
};

FileItem.displayName = 'FileItem';
export { FileItem };
