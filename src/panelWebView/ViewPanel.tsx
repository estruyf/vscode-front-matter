import * as React from 'react';
import { Actions } from './components/Actions';
import { GlobalSettings } from './components/GlobalSettings';
import { OtherActions } from './components/OtherActions';
import { SeoStatus } from './components/SeoStatus';
import { Spinner } from './components/Spinner';
import { FolderAndFiles } from './components/FolderAndFiles';
import { Metadata } from './components/Metadata';
import { SponsorMsg } from './components/SponsorMsg';
import useMessages from './hooks/useMessages';
import { FeatureFlag } from '../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../constants/Features';
import { GitAction } from './components/Git/GitAction';
import { CustomView } from './components/CustomView';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrevious } from './hooks/usePrevious';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { InitializeAction } from './components/InitializeAction';
import { DEFAULT_PANEL_FEATURE_FLAGS } from '../constants/DefaultFeatureFlags';

export interface IViewPanelProps { }

export const ViewPanel: React.FunctionComponent<IViewPanelProps> = (
  { }: React.PropsWithChildren<IViewPanelProps>
) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const {
    loading,
    mediaSelecting,
    metadata,
    settings,
    folderAndFiles,
    focusElm,
    unsetFocus,
    mode
  } = useMessages();
  const prevMediaSelection = usePrevious(mediaSelecting);
  const [scrollY, setScrollY] = useState(0);

  const scollListener = useCallback((e: Event) => {
    if (!mediaSelecting) {
      setScrollY(window.scrollY);
    }
  }, [mediaSelecting]);

  const isSomethingShown = useMemo(() => {
    const panelModeValues = (mode?.features || DEFAULT_PANEL_FEATURE_FLAGS).filter(v => v.startsWith('panel.'));

    if (panelModeValues.length === 0) {
      return false;
    }

    if (panelModeValues.includes(FEATURE_FLAG.panel.globalSettings) ||
      panelModeValues.includes(FEATURE_FLAG.panel.actions) ||
      panelModeValues.includes(FEATURE_FLAG.panel.recentlyModified) ||
      panelModeValues.includes(FEATURE_FLAG.panel.otherActions) ||
      panelModeValues.includes(FEATURE_FLAG.panel.gitActions)) {
      return true;
    }
  }, [mode?.features]);

  useEffect(() => {
    if (prevMediaSelection && !mediaSelecting) {
      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
        })
      }, 10);
    }
  }, [mediaSelecting, prevMediaSelection]);

  useEffect(() => {
    window.addEventListener('scroll', scollListener, true);

    return () => {
      window.removeEventListener('scroll', scollListener, true);
    }
  }, [mediaSelecting]);

  useEffect(() => {
    if (window.fmExternal && window.fmExternal.isDevelopment) {
      setIsDevMode(true);
    }
  }, []);

  if (mediaSelecting) {
    return (
      <div className="frontmatter media_selection">
        <h1>
          {l10n.t(LocalizationKey.panelViewPanelMediaInsert)}
        </h1>
      </div>
    );
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="frontmatter">
      {
        isDevMode && (
          <div className="developer__bar">
            <a
              className="developer__bar__link"
              href={`command:workbench.action.webview.reloadWebviewAction`}
              title={l10n.t(LocalizationKey.developerReloadTitle)}>
              {l10n.t(LocalizationKey.developerReloadLabel)}
            </a>
            <a
              className="developer__bar__link"
              href={`command:workbench.action.webview.openDeveloperTools`}
              title={l10n.t(LocalizationKey.developerDevToolsTitle)}>
              {l10n.t(LocalizationKey.developerDevToolsLabel)}
            </a>
          </div>
        )
      }

      <InitializeAction settings={settings} />

      <div className={`ext_actions`}>
        <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.gitActions}>
          <GitAction settings={settings} />
        </FeatureFlag>

        {!loading && (<CustomView metadata={metadata} />)}

        <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.globalSettings}>
          <GlobalSettings settings={settings} isBase={!metadata} />
        </FeatureFlag>

        {
          !loading && metadata && settings && settings.seo && (
            <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.seo}>
              <SeoStatus
                seo={settings.seo}
                data={metadata}
                focusElm={focusElm}
                unsetFocus={unsetFocus}
              />
            </FeatureFlag>
          )
        }

        {!loading && settings && (
          <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.actions}>
            <Actions
              metadata={metadata}
              settings={settings}
              scripts={metadata ? settings.scripts : settings.scripts.filter((s) => s.bulk && (s.type === 'content' || !s.type))} />
          </FeatureFlag>
        )}

        {
          !loading && metadata && (
            <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.metadata}>
              <Metadata
                settings={settings}
                metadata={metadata}
                focusElm={focusElm}
                unsetFocus={unsetFocus}
                features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS}
              />
            </FeatureFlag>
          )
        }

        <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.recentlyModified}>
          <FolderAndFiles data={folderAndFiles} isBase={!metadata} />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || DEFAULT_PANEL_FEATURE_FLAGS} flag={FEATURE_FLAG.panel.otherActions}>
          <OtherActions settings={settings} isFile={!!metadata} isBase={!metadata} />
        </FeatureFlag>

        {
          !isSomethingShown && (
            <div className={`base__empty`}>
              {l10n.t(LocalizationKey.panelBaseViewEmpty)}
            </div>
          )
        }
      </div>

      <SponsorMsg isBacker={settings?.isBacker} />
    </div>
  );
};
