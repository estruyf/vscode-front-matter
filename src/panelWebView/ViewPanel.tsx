import * as React from 'react';
import { Actions } from './components/Actions';
import { BaseView } from './components/BaseView';
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
    localeReady,
    mode
  } = useMessages();
  const prevMediaSelection = usePrevious(mediaSelecting);
  const [scrollY, setScrollY] = useState(0);

  const allPanelValues = useMemo(() => {
    return Object.values(FEATURE_FLAG.panel).filter(v => v !== FEATURE_FLAG.panel.globalSettings)
  }, [FEATURE_FLAG.panel]);

  const scollListener = useCallback((e: Event) => {
    if (!mediaSelecting) {
      setScrollY(window.scrollY);
    }
  }, [mediaSelecting]);

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

  if (loading || !localeReady) {
    return <Spinner />;
  }

  if (!metadata || Object.keys(metadata || {}).length === 0) {
    return <BaseView mode={mode} settings={settings} folderAndFiles={folderAndFiles} />;
  }

  return (
    <div className="frontmatter">
      <InitializeAction settings={settings} />
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

      <div className={`ext_actions`}>
        <GitAction settings={settings} />

        <CustomView metadata={metadata} />

        <FeatureFlag features={mode?.features || [...allPanelValues]} flag={FEATURE_FLAG.panel.globalSettings}>
          <GlobalSettings settings={settings} />
        </FeatureFlag>

        {settings && settings.seo && (
          <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.seo}>
            <SeoStatus
              seo={settings.seo}
              data={metadata}
              focusElm={focusElm}
              unsetFocus={unsetFocus}
            />
          </FeatureFlag>
        )}
        {settings && metadata && (
          <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.actions}>
            <Actions metadata={metadata} settings={settings} />
          </FeatureFlag>
        )}

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.metadata}>
          <Metadata
            settings={settings}
            metadata={metadata}
            focusElm={focusElm}
            unsetFocus={unsetFocus}
            features={mode?.features || []}
          />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.recentlyModified}>
          <FolderAndFiles data={folderAndFiles} />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.otherActions}>
          <OtherActions settings={settings} isFile={true} />
        </FeatureFlag>
      </div>

      <SponsorMsg isBacker={settings?.isBacker} />
    </div>
  );
};
