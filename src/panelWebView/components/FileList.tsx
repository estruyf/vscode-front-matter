import * as React from 'react';
import { FileInfo } from '../../models';
import { FileItem } from './FileItem';
import { VsLabel } from './VscodeComponents';

export interface IFileListProps {
  folderName: string;
  files: FileInfo[];
  totalFiles: number;
}

const FileList: React.FunctionComponent<IFileListProps> = ({files, folderName, totalFiles}: React.PropsWithChildren<IFileListProps>) => {

  if (!files || files.length === 0) {
    return null;
  }
  
  return (
    <div className={`file_list`}>
      <VsLabel>{folderName} - file{files.length === 1 ? '' : 's'}: {totalFiles}</VsLabel>

      <ul className="file_list__items">
        {
          (files && files.length > 0) && files.map(file => (
            <FileItem key={file.filePath} name={file.fileName} path={file.filePath} />
          ))
        }
      </ul>
    </div>
  );
};

FileList.displayName = 'FileList';
export { FileList };