import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import useDarkMode from '../../hooks/useDarkMode';
import { WelcomeScreen } from './WelcomeScreen';
import { useRecoilValue } from 'recoil';
import { DashboardViewSelector, ModeAtom } from '../state';
import { Contents } from './Contents/Contents';
import { Media } from './Media/Media';
import { NavigationType } from '../models';
import { DataView } from './DataView';
import { Snippets } from './SnippetsView/Snippets';
import { FeatureFlag } from '../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import { TaxonomyView } from './TaxonomyView';

export interface IAppProps {
  showWelcome: boolean;
}

export const App: React.FunctionComponent<IAppProps> = ({showWelcome}: React.PropsWithChildren<IAppProps>) => {
  const { loading, pages, settings } = useMessages();
  const view = useRecoilValue(DashboardViewSelector);
  const mode = useRecoilValue(ModeAtom);
  useDarkMode();

  const viewState: any = Messenger.getState() || {};

  if (!settings) {
    return <Spinner />;
  }

  if (showWelcome || viewState.isWelcomeConfiguring) {
    return <WelcomeScreen settings={settings} />;
  }

  if (!settings.initialized || settings.contentFolders?.length === 0) {
    return <WelcomeScreen settings={settings} />;
  }

  if (view === NavigationType.Snippets) {
    return (
      <main className={`h-full w-full`}>
        <Snippets />
      </main>
    );
  } 
  
  if (view === NavigationType.Media) {
    return (
      <main className={`h-full w-full`}>
        <Media />
      </main>
    );
  }

  if (view === NavigationType.Data) {
    return (
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.data.view}>
        <main className={`h-full w-full`}>
          <DataView />
        </main>
      </FeatureFlag>
    );
  }

  if (view === NavigationType.Taxonomy) {
    return (
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.taxonomy.view}>
        <main className={`h-full w-full`}>
          <TaxonomyView pages={pages} />
        </main>
      </FeatureFlag>
    );
  }

  return (
    <main className={`h-full w-full`}>
      <Contents pages={pages} loading={loading} />
    </main>
  );
};