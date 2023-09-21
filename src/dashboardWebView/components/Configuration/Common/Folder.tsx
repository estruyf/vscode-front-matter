import * as React from 'react';
import { join } from 'path';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../../localization';
import { ContentFolder } from '../../../../models';
import { SelectItem } from '../../Steps/SelectItem';

export interface IFolderProps {
  wsFolder: string;
  folder: string;
  folders: ContentFolder[];
  addFolder: (folder: string) => void;
}

export const Folder: React.FunctionComponent<IFolderProps> = ({
  wsFolder,
  folder,
  folders,
  addFolder
}: React.PropsWithChildren<IFolderProps>) => {

  const isAdded = React.useMemo(
    () => folders.find((f) => f.path.toLowerCase() === join(wsFolder, folder).toLowerCase()),
    [folder, folders, wsFolder]
  );

  return (
    <SelectItem
      title={folder}
      buttonTitle={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedButtonAddFolderTitle)}
      isSelected={!!isAdded}
      onClick={() => addFolder(folder)} />
  );
};