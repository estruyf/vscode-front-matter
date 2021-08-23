import * as React from 'react';
import { FileInfo } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';

export interface IFileListProps {
  files: FileInfo[];
}

export const FileList: React.FunctionComponent<IFileListProps> = ({files}: React.PropsWithChildren<IFileListProps>) => {
  
  const openFile = (filePath: string) => {
    MessageHelper.sendMessage(CommandToCode.openInEditor, filePath);
  };
  
  return (
    <>
      {
        files && (
          <ul>
            {
              files.map(file => (
                <li key={file.fileName} onClick={() => openFile(file.filePath)}>{file.fileName}</li>
              ))
            }
          </ul>
        )
      }
    </>
  );
};