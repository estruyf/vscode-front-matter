import * as React from 'react';
import { FolderInfo } from '../../models';
import { Collapsible } from './Collapsible';
import { FileList } from './FileList';
import { VsLabel } from './VscodeComponents';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IFolderAndFilesProps {
  data: FolderInfo[] | undefined;
  isBase?: boolean;
}

const FolderAndFiles: React.FunctionComponent<IFolderAndFilesProps> = ({
  data,
  isBase
}: React.PropsWithChildren<IFolderAndFilesProps>) => {
  if (!data) {
    return null;
  }

  return (
    <>
      {data && data.length > 0 && (
        <Collapsible id={`${isBase ? 'base_' : ''}content`} title={l10n.t(LocalizationKey.panelFolderAndFilesTitle)}>
          <div className="information">
            {data.map((folder: FolderInfo, idx) => (
              <div key={`container-${folder.title}-${idx}`}>
                {folder.lastModified ? (
                  <div key={`${folder.title}-${idx}`}>
                    <FileList
                      folderName={folder.localeTitle ? `${folder.title} (${folder.localeTitle})` : folder.title}
                      totalFiles={folder.files}
                      files={folder.lastModified}
                    />
                  </div>
                ) : isBase ? (
                  <VsLabel key={`${folder.title}-${idx}`}>
                    {folder.title}: {folder.files} {folder.files > 1 ? l10n.t(LocalizationKey.panelFileListLabelPlural) : l10n.t(LocalizationKey.panelFileListLabelSingular)}
                  </VsLabel>
                ) : null}
              </div>
            ))}
          </div>
        </Collapsible>
      )}
    </>
  );
};

FolderAndFiles.displayName = 'FolderAndFiles';
export { FolderAndFiles };
