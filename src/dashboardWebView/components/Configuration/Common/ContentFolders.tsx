import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../../localization';
import { Settings } from '../../../models';
import { Folder } from './Folder';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../../DashboardMessage';

export interface IContentFoldersProps {
  settings: Settings
  triggerLoading: (isLoading: boolean) => void;
}

export const ContentFolders: React.FunctionComponent<IContentFoldersProps> = ({
  settings
}: React.PropsWithChildren<IContentFoldersProps>) => {

  const addFolder = (folder: string) => {
    Messenger.send(DashboardMessage.addFolder, folder);
  };

  return (
    <>
      <p>
        {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersDescription)}
      </p>

      {settings?.dashboardState?.welcome?.contentFolders?.length > 0 && (
        <div className="mt-4">
          <div className="text-sm">{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersLabel)}</div>
          <div className="mt-1 space-y-1">
            {settings?.dashboardState?.welcome?.contentFolders?.map((folder: string) => (
              <Folder
                key={folder}
                folder={folder}
                addFolder={addFolder}
                wsFolder={settings.wsFolder}
                folders={settings.contentFolders}
              />
            ))}
          </div>
        </div>
      )}

      <p className={`mt-4`}>
        <b>{l10n.t(LocalizationKey.commonInformation)}</b>: {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersInformationDescription)}.
      </p>
    </>
  );
};