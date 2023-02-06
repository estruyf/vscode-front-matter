import * as React from 'react';
import { FolderAddIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { useRecoilValue } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import {
  AllContentFoldersAtom,
  AllStaticFoldersAtom,
  SelectedMediaFolderAtom,
  SettingsSelector,
  ViewDataSelector
} from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ChoiceButton } from '../ChoiceButton';
import { CustomScript, ScriptType } from '../../../models';
import { STATIC_FOLDER_PLACEHOLDER } from '../../../constants';
import { useCallback, useMemo } from 'react';
import { extname } from 'path';
import { parseWinPath } from '../../../helpers/parseWinPath';
import useThemeColors from '../../hooks/useThemeColors';

export interface IFolderCreationProps {}

export const FolderCreation: React.FunctionComponent<IFolderCreationProps> = (
  props: React.PropsWithChildren<IFolderCreationProps>
) => {
  const selectedFolder = useRecoilValue(SelectedMediaFolderAtom);
  const settings = useRecoilValue(SettingsSelector);
  const allStaticFolders = useRecoilValue(AllStaticFoldersAtom);
  const allContentFolders = useRecoilValue(AllContentFoldersAtom);
  const viewData = useRecoilValue(ViewDataSelector);
  const { getColors } = useThemeColors();

  const hexoAssetFolderPath = useMemo(() => {
    const path = viewData?.data?.filePath?.replace(extname(viewData.data.filePath), '');
    return parseWinPath(path);
  }, [viewData?.data?.filePath]);

  const onAssetFolderCreation = useCallback(() => {
    Messenger.send(DashboardMessage.createHexoAssetFolder, {
      hexoAssetFolderPath
    });
  }, [hexoAssetFolderPath]);

  const onFolderCreation = () => {
    Messenger.send(DashboardMessage.createMediaFolder, {
      selectedFolder
    });
  };

  const runCustomScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, {
      script,
      path: selectedFolder
    });
  };

  const isHexoPostAssetsEnabled = useMemo(() => {
    if (
      allStaticFolders &&
      allContentFolders &&
      settings?.staticFolder === STATIC_FOLDER_PLACEHOLDER.hexo.placeholder &&
      hexoAssetFolderPath
    ) {
      return ![...allStaticFolders, ...allContentFolders].some((f) =>
        f.startsWith(hexoAssetFolderPath)
      );
    }
    return false;
  }, [settings?.staticFolder, allStaticFolders, allContentFolders, hexoAssetFolderPath]);

  const scripts = (settings?.scripts || []).filter(
    (script) => script.type === ScriptType.MediaFolder && !script.hidden
  );

  const renderPostAssetsButton = useMemo(() => {
    if (isHexoPostAssetsEnabled) {
      return (
        <button
          className={`mr-2 inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium  focus:outline-none ${
            getColors(
              `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`, 
              `text-[var(--vscode-button-foreground)] bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
            )
          }`}
          title={`Create post asset folder`}
          onClick={onAssetFolderCreation}
        >
          <FolderAddIcon className={`mr-2 h-6 w-6`} />
          <span className={``}>Create post asset folder</span>
        </button>
      );
    }
    return null;
  }, [isHexoPostAssetsEnabled]);

  if (scripts.length > 0) {
    return (
      <div className="flex flex-1 justify-end">
        {renderPostAssetsButton}
        <ChoiceButton
          title={`Create new folder`}
          choices={scripts.map((s) => ({
            title: s.title,
            icon: <LightningBoltIcon className="w-4 h-4 mr-2" />,
            onClick: () => runCustomScript(s)
          }))}
          onClick={onFolderCreation}
          disabled={!settings?.initialized}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-end">
      {renderPostAssetsButton}
      <button
        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium focus:outline-none ${
          getColors(
            `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`, 
            `text-[var(--vscode-button-foreground)] bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
          )
        }`}
        title={`Create new folder`}
        onClick={onFolderCreation}
      >
        <FolderAddIcon className={`mr-2 h-6 w-6`} />
        <span className={``}>Create new folder</span>
      </button>
    </div>
  );
};
