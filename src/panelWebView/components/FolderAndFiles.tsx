import * as React from 'react';
import { FolderInfo } from '../../models';
import { Collapsible } from './Collapsible';
import { FileList } from './FileList';
import { VsLabel } from './VscodeComponents';

export interface IFolderAndFilesProps {
  data: FolderInfo[] | undefined;
  isBase?: boolean;
}

const FolderAndFiles: React.FunctionComponent<IFolderAndFilesProps> = ({data, isBase}: React.PropsWithChildren<IFolderAndFilesProps>) => {

  if (!data) {
    return null;
  }

  return (
    <>
      {
        (data && data.length > 0) && (
          <Collapsible id={`${isBase ? "base_" : ""}content`} title="Recently modified">
            <div className="information">
              {
                data.map((folder: FolderInfo, idx) => (
                  <div key={`container-${folder.title}-${idx}`}>
                    {folder.lastModified ? (
                      <div key={`${folder.title}-${idx}`}>
                        <FileList folderName={folder.title} totalFiles={folder.files} files={folder.lastModified} />
                      </div>
                    ) : (
                      isBase ? (
                        <VsLabel key={`${folder.title}-${idx}`}>{folder.title}: {folder.files} file{folder.files > 1 ? 's' : ''}</VsLabel>
                      ) : null
                    )}
                  </div>
                ))
              }
            </div>
          </Collapsible>
        )
      }
    </>
  );
};

FolderAndFiles.displayName = 'FolderAndFiles';
export { FolderAndFiles };