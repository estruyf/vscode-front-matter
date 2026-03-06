import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Page } from '../../models';
import { LoadingAtom, SelectedItemActionAtom, SettingsSelector } from '../../state';
import { Overview } from './Overview';
import { Spinner } from '../Common/Spinner';
import { SponsorMsg } from '../Layout/SponsorMsg';
import usePages from '../../hooks/usePages';
import { useCallback, useEffect, useState } from 'react';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { GeneralCommands } from '../../../constants';
import { PageLayout } from '../Layout/PageLayout';
import { FilesProvider } from '../../providers/FilesProvider';
import { Alert } from '../Modals/Alert';
import { MoveFileDialog } from '../Modals/MoveFileDialog';
import { LocalizationKey } from '../../../localization';
import { deletePage } from '../../utils';

export interface IContentsProps {
  pages: Page[];
}

export const Contents: React.FunctionComponent<IContentsProps> = ({
  pages
}: React.PropsWithChildren<IContentsProps>) => {
  const loading = useRecoilValue(LoadingAtom);
  const settings = useRecoilValue(SettingsSelector);
  const { pageItems } = usePages(pages);
  const [showDeletionAlert, setShowDeletionAlert] = React.useState(false);
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [page, setPage] = useState<Page | undefined>(undefined);
  const [selectedItemAction, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);

  const pageFolders = [...new Set(pageItems.map((page) => page.fmFolder))];

  const onDismiss = useCallback(() => {
    setShowMoveDialog(false);
    setShowDeletionAlert(false);
    setSelectedItemAction(undefined);
  }, []);

  const onDeleteConfirm = useCallback(() => {
    if (page) {
      deletePage(page.fmFilePath);
    }
    setShowDeletionAlert(false);
    setSelectedItemAction(undefined);
  }, [page]);

  const onMoveConfirm = useCallback((destinationFolder: string) => {
    if (page) {
      Messenger.send(DashboardMessage.moveFile, {
        filePath: page.fmFilePath,
        destinationFolder
      });
    }
    setShowMoveDialog(false);
    setSelectedItemAction(undefined);
  }, [page]);

  useEffect(() => {
    if (selectedItemAction && selectedItemAction.path) {
      const pageItem = pageItems.find((p) => p.fmFilePath === selectedItemAction.path);

      if (pageItem) {
        setPage(pageItem);
        
        if (selectedItemAction.action === 'delete') {
          setShowDeletionAlert(true);
        } else if (selectedItemAction.action === 'move') {
          setShowMoveDialog(true);
        }
      }

      setSelectedItemAction(undefined);
    }
  }, [pageItems, selectedItemAction]);

  useEffect(() => {
    messageHandler.send(GeneralCommands.toVSCode.logging.info, {
      message: `Contents view loaded with ${pageItems.length} pages`,
      location: 'DASHBOARD'
    });
  }, [JSON.stringify(pageItems)]);

  useEffect(() => {
    Messenger.send(DashboardMessage.setTitle, l10n.t(LocalizationKey.dashboardHeaderTabsContents));
  }, []);

  return (
    <FilesProvider files={pageItems}>
      <PageLayout folders={pageFolders} totalPages={pageItems.length}>
        <div className="w-full flex-grow max-w-full mx-auto pb-6">
          {loading ? <Spinner type={loading} /> : <Overview pages={pageItems} settings={settings} />}
        </div>

        <SponsorMsg
          beta={settings?.beta}
          version={settings?.versionInfo}
          isBacker={settings?.isBacker}
        />

        <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=content" alt="Content metrics" />

        {showMoveDialog && page && (
          <MoveFileDialog
            page={page}
            availableFolders={pageFolders}
            dismiss={onDismiss}
            trigger={onMoveConfirm}
          />
        )}

        {showDeletionAlert && page && (
          <Alert
            title={l10n.t(LocalizationKey.dashboardContentsContentActionsAlertTitle, page.title)}
            description={l10n.t(LocalizationKey.dashboardContentsContentActionsAlertDescription, page.title)}
            okBtnText={l10n.t(LocalizationKey.commonDelete)}
            cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
            dismiss={onDismiss}
            trigger={onDeleteConfirm}
          />
        )}
      </PageLayout>
    </FilesProvider>
  );
};
