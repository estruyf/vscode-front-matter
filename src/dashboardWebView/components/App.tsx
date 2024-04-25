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
import { FEATURE_FLAG, GeneralCommands } from '../../constants';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { TaxonomyView } from './TaxonomyView';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { routePaths } from '..';
import { useEffect, useMemo, useState } from 'react';
import { UnknownView } from './UnknownView';
import { ErrorBoundary } from '@sentry/react';
import { ErrorView } from './ErrorView';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { SettingsView } from './SettingsView/SettingsView';

export interface IAppProps {
  showWelcome: boolean;
}

export const App: React.FunctionComponent<IAppProps> = ({
  showWelcome
}: React.PropsWithChildren<IAppProps>) => {
  const { pages, settings } = useMessages();
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

  const checkDevMode = (retry: number = 0) => {
    if (!window.fmExternal) {
      if (retry < 5) {
        setTimeout(() => checkDevMode(retry + 1), 150);
      } else {
        setIsDevMode(false);
        return;
      }
    }

    if (window.fmExternal && window.fmExternal.isDevelopment) {
      setIsDevMode(true);
    }
  }

  useEffect(() => {
    messageHandler.send(GeneralCommands.toVSCode.logging.info, {
      message: `Loaded with view ${view}`,
      location: 'DASHBOARD'
    });

    if (view && routePaths[view]) {
      navigate(routePaths[view]);
      return;
    }

    navigate(routePaths[view]);
  }, [view]);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      messageHandler.send(GeneralCommands.toVSCode.logging.info, {
        message: `Settings loaded`,
        location: 'DASHBOARD'
      });
    }

    if (pages) {
      messageHandler.send(GeneralCommands.toVSCode.logging.info, {
        message: `Pages loaded - ${pages.length} pages`,
        location: 'DASHBOARD'
      });
    }
  }, [JSON.stringify(settings), JSON.stringify(pages)]);

  useEffect(() => {
    checkDevMode();
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
          GeneralCommands.toVSCode.logging.error,
          {
            message: `Event ID: ${eventId}
Message: ${error.message}

Stack: ${componentStack}`,
            location: 'DASHBOARD'
          }
        );
      }}
    >
      <main className={`h-full w-full`}>
        {
          isDevMode && (
            <div className="relative p-2 flex justify-center items-center bg-[var(--vscode-statusBar-debuggingBackground)] text-[var(--vscode-statusBar-debuggingForeground)]">
              <span className='absolute left-2'>
                {l10n.t(LocalizationKey.developerTitle)}
              </span>

              <a
                className="ml-2 px-2 hover:text-[var(--vscode-statusBar-debuggingForeground)] hover:bg-[var(--vscode-statusBarItem-hoverBackground)] hover:outline-none focus:outline-none"
                href={`command:workbench.action.webview.reloadWebviewAction`}
                title={l10n.t(LocalizationKey.developerReloadTitle)}>
                {l10n.t(LocalizationKey.developerReloadLabel)}
              </a>
              <a
                className="ml-2 px-2 hover:text-[var(--vscode-statusBar-debuggingForeground)] hover:bg-[var(--vscode-statusBarItem-hoverBackground)] hover:outline-none focus:outline-none"
                href={`command:workbench.action.webview.openDeveloperTools`}
                title={l10n.t(LocalizationKey.developerDevToolsTitle)}>
                {l10n.t(LocalizationKey.developerDevToolsLabel)}
              </a>
            </div>
          )
        }

        <Routes>
          <Route path={routePaths.welcome} element={<WelcomeScreen settings={settings} />} />
          <Route
            path={routePaths.contents}
            element={<Contents pages={pages} />}
          />
          <Route path={routePaths.media} element={<Media />} />
          <Route path={routePaths.snippets} element={<Snippets />} />

          {allowDataView && <Route path={routePaths.data} element={<DataView />} />}

          {allowTaxonomyView && (
            <Route path={routePaths.taxonomy} element={<TaxonomyView pages={pages} />} />
          )}

          <Route path={routePaths.settings} element={<SettingsView />} />

          <Route path={`*`} element={<UnknownView />} />
        </Routes>
      </main>
    </ErrorBoundary >
  );
};
