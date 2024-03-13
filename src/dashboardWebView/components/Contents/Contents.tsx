import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { Page } from '../../models';
import { LoadingAtom, SettingsSelector } from '../../state';
import { Overview } from './Overview';
import { Spinner } from '../Common/Spinner';
import { SponsorMsg } from '../Layout/SponsorMsg';
import usePages from '../../hooks/usePages';
import { useEffect } from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { TelemetryEvent } from '../../../constants';
import { PageLayout } from '../Layout/PageLayout';
import { FilesProvider } from '../../providers/FilesProvider';

export interface IContentsProps {
  pages: Page[];
}

export const Contents: React.FunctionComponent<IContentsProps> = ({
  pages
}: React.PropsWithChildren<IContentsProps>) => {
  const loading = useRecoilValue(LoadingAtom);
  const settings = useRecoilValue(SettingsSelector);
  const { pageItems } = usePages(pages);

  const pageFolders = [...new Set(pageItems.map((page) => page.fmFolder))];

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
      </PageLayout>
    </FilesProvider>
  );
};
