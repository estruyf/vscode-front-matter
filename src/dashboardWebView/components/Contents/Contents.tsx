import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { NavigationType, Page } from '../../models';
import { DashboardViewAtom, SettingsSelector } from '../../state';
import { Overview } from './Overview';
import { Spinner } from '../Common/Spinner';
import { SponsorMsg } from '../Layout/SponsorMsg';
import usePages from '../../hooks/usePages';
import { useEffect } from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { TelemetryEvent } from '../../../constants';
import { PageLayout } from '../Layout/PageLayout';

export interface IContentsProps {
  pages: Page[];
  loading: boolean;
}

export const Contents: React.FunctionComponent<IContentsProps> = ({
  pages,
  loading
}: React.PropsWithChildren<IContentsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const { pageItems } = usePages(pages);
  const [, setView] = useRecoilState(DashboardViewAtom);

  const pageFolders = [...new Set(pageItems.map((page) => page.fmFolder))];

  useEffect(() => {
    setView(NavigationType.Contents);

    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewContentsView
    });
  }, []);

  return (
    <PageLayout folders={pageFolders} totalPages={pageItems.length}>
      <div className="w-full flex-grow max-w-full mx-auto pb-6 px-4">
        {loading ? <Spinner /> : <Overview pages={pageItems} settings={settings} />}
      </div>

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=content" alt="Content metrics" />
    </PageLayout>
  );
};
