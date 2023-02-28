import * as React from 'react';
import { Spinner } from './Common/Spinner';
import useMessages from '../hooks/useMessages';
import useDarkMode from '../../hooks/useDarkMode';
import { WelcomeScreen } from './WelcomeView/WelcomeScreen';
import { useRecoilValue } from 'recoil';
import { DashboardViewSelector, ModeAtom } from '../state';
import { Contents } from './Contents/Contents';
import { Media } from './Media/Media';
import { DataView } from './DataView';
import { Snippets } from './SnippetsView/Snippets';
import { FEATURE_FLAG } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import { TaxonomyView } from './TaxonomyView';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { routePaths } from '..';
import { useEffect, useMemo, useState } from 'react';
import { UnknownView } from './UnknownView';
import { ErrorBoundary } from '@sentry/react';
import { ErrorView } from './ErrorView';
import { DashboardMessage } from '../DashboardMessage';

export interface IAppProps {
  showWelcome: boolean;
}

export const App: React.FunctionComponent<IAppProps> = ({
  showWelcome
}: React.PropsWithChildren<IAppProps>) => {
  const { loading, pages, settings } = useMessages();
  const view = useRecoilValue(DashboardViewSelector);
  const mode = useRecoilValue(ModeAtom);
  const [isDevMode, setIsDevMode] = useState(false);
  const navigate = useNavigate();
  useDarkMode();

  const viewState: any = Messenger.getState() || {};

  const isAllowed = (features: string[], flag: string) => {
    if (!features || (features.length > 0 && !features.includes(flag))) {
      return false;
    }

    return true;
  };

  const allowDataView = useMemo(() => {
    return isAllowed(mode?.features || [], FEATURE_FLAG.dashboard.data.view);
  }, [mode?.features]);

  const allowTaxonomyView = useMemo(() => {
    return isAllowed(mode?.features || [], FEATURE_FLAG.dashboard.taxonomy.view);
  }, [mode?.features]);

  useEffect(() => {
    if (view && routePaths[view]) {
      navigate(routePaths[view]);
      return;
    }

    navigate(routePaths[view]);
  }, [view]);

  useEffect(() => {
    console.log(window.fmExternal)
    if (window.fmExternal.isDevelopment) {
      setIsDevMode(true);
    }
  }, []);

  if (!settings) {
    return <Spinner />;
  }

  if (showWelcome || viewState.isWelcomeConfiguring) {
    return <WelcomeScreen settings={settings} />;
  }

  if (!settings.initialized || settings.contentFolders?.length === 0) {
    return <WelcomeScreen settings={settings} />;
  }

  return (
    <ErrorBoundary
      fallback={<ErrorView />}
      onError={(error: Error, componentStack: string, eventId: string) => {
        Messenger.send(
          DashboardMessage.logError,
          `Event ID: ${eventId}
Message: ${error.message}

Stack: ${componentStack}`
        );
      }}
    >
      <main className={`h-full w-full`}>
        {
          isDevMode && (
            <div className="relative p-2 flex justify-center items-center bg-[var(--vscode-statusBar-debuggingBackground)] text-[var(--vscode-statusBar-debuggingForeground)]">
              <span className='absolute left-2'>Development mode</span>

              <a
                className="ml-2 px-2 hover:text-[var(--vscode-statusBarItem-hoverForeground)] hover:bg-[var(--vscode-statusBarItem-hoverBackground)] hover:outline-none focus:outline-none"
                href={`command:workbench.action.webview.reloadWebviewAction`}
                title="Reload the dashboard">
                Reload
              </a>
            </div>
          )
        }

        <Routes>
          <Route path={routePaths.welcome} element={<WelcomeScreen settings={settings} />} />
          <Route
            path={routePaths.contents}
            element={<Contents pages={pages} loading={loading} />}
          />
          <Route path={routePaths.media} element={<Media />} />
          <Route path={routePaths.snippets} element={<Snippets />} />

          {allowDataView && <Route path={routePaths.data} element={<DataView />} />}

          {allowTaxonomyView && (
            <Route path={routePaths.taxonomy} element={<TaxonomyView pages={pages} />} />
          )}

          <Route path={`*`} element={<UnknownView />} />
        </Routes>
      </main>
    </ErrorBoundary >
  );
};
