import { PhotoIcon, ScissorsIcon, TagIcon, CircleStackIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { NavigationType } from '../../models';
import { ModeAtom } from '../../state';
import { Tab } from './Tab';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { PageIcon } from '../../../panelWebView/components/Icons';

export interface ITabsProps {
  onNavigate: (navigationType: NavigationType) => void;
}

export const Tabs: React.FunctionComponent<ITabsProps> = ({
  onNavigate
}: React.PropsWithChildren<ITabsProps>) => {
  const mode = useRecoilValue(ModeAtom);

  return (
    <ul
      className="flex items-center justify-start h-full space-x-4"
      data-tabs-toggle="#myTabContent"
      role="tablist"
    >
      <li role="presentation">
        <Tab navigationType={NavigationType.Contents} onNavigate={onNavigate}>
          <PageIcon className={`h-4 w-auto mr-2`} />
          <span>{l10n.t(LocalizationKey.dashboardHeaderTabsContents)}</span>
        </Tab>
      </li>
      <li role="presentation">
        <Tab navigationType={NavigationType.Media} onNavigate={onNavigate}>
          <PhotoIcon className={`h-4 w-auto mr-2`} />
          <span>{l10n.t(LocalizationKey.dashboardHeaderTabsMedia)}</span>
        </Tab>
      </li>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.snippets.view}>
        <li role="presentation">
          <Tab navigationType={NavigationType.Snippets} onNavigate={onNavigate}>
            <ScissorsIcon className={`h-4 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsSnippets)}</span>
          </Tab>
        </li>
      </FeatureFlag>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.data.view}>
        <li role="presentation">
          <Tab navigationType={NavigationType.Data} onNavigate={onNavigate}>
            <CircleStackIcon className={`h-4 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsData)}</span>
          </Tab>
        </li>
      </FeatureFlag>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.taxonomy.view}>
        <li role="presentation">
          <Tab navigationType={NavigationType.Taxonomy} onNavigate={onNavigate}>
            <TagIcon className={`h-4 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsTaxonomies)}</span>
          </Tab>
        </li>
      </FeatureFlag>
    </ul>
  );
};
