import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import useDarkMode from '../../hooks/useDarkMode';
import { WelcomeScreen } from './WelcomeScreen';
import { useRecoilValue } from 'recoil';
import { DashboardViewSelector } from '../state';
import { Contents } from './Contents/Contents';
import { Media } from './Media/Media';
import { NavigationType } from '../models';
import { DataView } from './DataView';
import { Snippets } from './SnippetsView/Snippets';

export interface IDashboardProps {
  showWelcome: boolean;
}

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({showWelcome}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const view = useRecoilValue(DashboardViewSelector);
  useDarkMode();

  if (!settings) {
    return <Spinner />;
  }

  if (showWelcome) {
    return <WelcomeScreen settings={settings} />;
  }

  if (!settings.initialized || settings.folders?.length === 0) {
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
      <main className={`h-full w-full`}>
        <DataView />
      </main>
    );
  }

  return (
    <main className={`h-full w-full`}>
      <Contents pages={pages} loading={loading} />
    </main>
  );
};