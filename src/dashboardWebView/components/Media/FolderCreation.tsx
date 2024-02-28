import * as React from 'react';
import { FolderPlusIcon, BoltIcon } from '@heroicons/react/24/outline';
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
import { ChoiceButton } from '../Common/ChoiceButton';
import { CustomScript, ScriptType } from '../../../models';
import { STATIC_FOLDER_PLACEHOLDER } from '../../../constants';
import { useCallback, useMemo } from 'react';
import { extname } from 'path';
import { parseWinPath } from '../../../helpers/parseWinPath';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IFolderCreationProps { }

export const FolderCreation: React.FunctionComponent<IFolderCreationProps> = (
  props: React.PropsWithChildren<IFolderCreationProps>
) => {
  const selectedFolder = useRecoilValue(SelectedMediaFolderAtom);
  const settings = useRecoilValue(SettingsSelector);
  const allStaticFolders = useRecoilValue(AllStaticFoldersAtom);
  const allContentFolders = useRecoilValue(AllContentFoldersAtom);
  const viewData = useRecoilValue(ViewDataSelector);

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
          className={`mr-2 inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium  focus:outline-none text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
          title={l10n.t(LocalizationKey.dashboardMediaFolderCreationHexoCreate)}
          onClick={onAssetFolderCreation}
        >
          <FolderPlusIcon className={`mr-2 h-6 w-6`} />
          <span className={``}>{l10n.t(LocalizationKey.dashboardMediaFolderCreationHexoCreate)}</span>
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
          title={l10n.t(LocalizationKey.dashboardMediaFolderCreationFolderCreate)}
          choices={scripts.map((s) => ({
            title: s.title,
            icon: <BoltIcon className="w-4 h-4 mr-2" />,
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
        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium focus:outline-none rounded text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
        title={l10n.t(LocalizationKey.dashboardMediaFolderCreationFolderCreate)}
        onClick={onFolderCreation}
      >
        <FolderPlusIcon className={`mr-2 h-6 w-6`} />
        <span className={``}>{l10n.t(LocalizationKey.dashboardMediaFolderCreationFolderCreate)}</span>
      </button>
    </div>
  );
};
