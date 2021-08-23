import * as React from 'react';
import { FileInfo } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { FileIcon } from './Icons/FileIcon';
import { MarkdownIcon } from './Icons/MarkdownIcon';
import { VsLabel } from './VscodeComponents';

export interface IFileListProps {
  folderName: string;
  files: FileInfo[];
  totalFiles: number;
}

export const FileList: React.FunctionComponent<IFileListProps> = ({files, folderName, totalFiles}: React.PropsWithChildren<IFileListProps>) => {
  
  const openFile = (filePath: string) => {
    MessageHelper.sendMessage(CommandToCode.openInEditor, filePath);
  };

  if (!files || files.length === 0) {
    return null;
  }
  
  return (
    <div className={`file_list`}>
      <VsLabel>{folderName} - file{files.length === 1 ? '' : 's'}: {totalFiles}</VsLabel>

      <ul className="file_list__items">
        {
          files.map(file => (
            <li key={file.fileName}
                className={`file_list__items__item`}
                onClick={() => openFile(file.filePath)}>
              {
                (file.fileName.endsWith('.md') || file.fileName.endsWith('.mdx')) ? (
                  <MarkdownIcon />
                ) : (
                  <FileIcon />
                )
              }

              <span>{file.fileName}</span>
            </li>
          ))
        }
      </ul>
    </div>
  );
};