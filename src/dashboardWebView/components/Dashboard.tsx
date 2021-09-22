import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import useDarkMode from '../../hooks/useDarkMode';
import usePages from '../hooks/usePages';
import { WelcomeScreen } from './WelcomeScreen';
import { useRecoilValue } from 'recoil';
import { DashboardViewSelector, ViewDataAtom } from '../state';
import { Contents } from './Contents/Contents';
import { Media } from './Media/Media';

export interface IDashboardProps {
  showWelcome: boolean;
}

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({showWelcome}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const { pageItems } = usePages(pages);
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

  if (view === 'media') {
    return <Media />;
  }

  return <Contents pages={pageItems} loading={loading} />;
};