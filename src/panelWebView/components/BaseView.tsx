import * as React from 'react';
import { FolderInfo, Mode, PanelSettings } from '../../models';
import { GlobalSettings } from './GlobalSettings';
import { OtherActions } from './OtherActions';
import { FolderAndFiles } from './FolderAndFiles';
import { SponsorMsg } from './SponsorMsg';
import { FeatureFlag } from '../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../constants/Features';
import { GitAction } from './Git/GitAction';
import { useMemo } from 'react';
import * as l10n from "@vscode/l10n"
import { LocalizationKey } from '../../localization';
import { InitializeAction } from './InitializeAction';
import { Actions } from './Actions';

export interface IBaseViewProps {
  settings: PanelSettings | undefined;
  folderAndFiles: FolderInfo[] | undefined;
  mode: Mode | undefined;
}

const BaseView: React.FunctionComponent<IBaseViewProps> = ({
  settings,
  folderAndFiles,
  mode
}: React.PropsWithChildren<IBaseViewProps>) => {
  const customActions: any[] = (settings?.scripts || []).filter(
    (s) => s.bulk && (s.type === 'content' || !s.type)
  );

  const allPanelValues = useMemo(() => {
    return Object.values(FEATURE_FLAG.panel).filter(v => v !== FEATURE_FLAG.panel.globalSettings)
  }, [FEATURE_FLAG.panel]);

  const isSomethingShown = useMemo(() => {
    const panelModeValues = (mode?.features || []).filter(v => v.startsWith('panel.'));

    if (panelModeValues.length === 0) {
      return true;
    }

    if (panelModeValues.includes(FEATURE_FLAG.panel.globalSettings) ||
      panelModeValues.includes(FEATURE_FLAG.panel.actions) ||
      panelModeValues.includes(FEATURE_FLAG.panel.recentlyModified) ||
      panelModeValues.includes(FEATURE_FLAG.panel.otherActions)) {
      return true;
    }
  }, [mode?.features]);

  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        <InitializeAction settings={settings} />

        {settings?.isInitialized && (
          <>
            <GitAction settings={settings} />

            <FeatureFlag features={mode?.features || [...allPanelValues]} flag={FEATURE_FLAG.panel.globalSettings}>
              <GlobalSettings settings={settings} isBase />
            </FeatureFlag>

            <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.actions}>
              <Actions settings={settings} scripts={customActions} />
            </FeatureFlag>
          </>
        )}

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.recentlyModified}>
          <FolderAndFiles data={folderAndFiles} isBase />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.otherActions}>
          <OtherActions settings={settings} isFile={false} isBase />
        </FeatureFlag>
      </div>

      {
        !isSomethingShown && (
          <div className={`base__empty`}>
            {l10n.t(LocalizationKey.panelBaseViewEmpty)}
          </div>
        )
      }

      <SponsorMsg isBacker={settings?.isBacker} />
    </div>
  );
};

BaseView.displayName = 'BaseView';
export { BaseView };
