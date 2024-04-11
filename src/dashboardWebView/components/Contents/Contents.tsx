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
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { TelemetryEvent } from '../../../constants';
import { PageLayout } from '../Layout/PageLayout';
import { FilesProvider } from '../../providers/FilesProvider';
import { Alert } from '../Modals/Alert';
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
  const [page, setPage] = useState<Page | undefined>(undefined);
  const [selectedItemAction, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);

  const pageFolders = [...new Set(pageItems.map((page) => page.fmFolder))];

  const onDismiss = useCallback(() => {
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

  useEffect(() => {
    if (selectedItemAction && selectedItemAction.path && selectedItemAction.action === 'delete') {
      const page = pageItems.find((p) => p.fmFilePath === selectedItemAction.path);

      if (page) {
        setPage(page);
        setShowDeletionAlert(true);
      }

      setSelectedItemAction(undefined);
    }
  }, [pageItems, selectedItemAction]);

  useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewContentsView
    });
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
