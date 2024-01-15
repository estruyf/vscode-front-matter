import { CircleStackIcon, PhotoIcon, ScissorsIcon, TagIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { NavigationType } from '../../models';
import { ModeAtom } from '../../state';
import { Tab } from './Tab';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ITabsProps {
  onNavigate: (navigationType: NavigationType) => void;
}

export const Tabs: React.FunctionComponent<ITabsProps> = ({
  onNavigate
}: React.PropsWithChildren<ITabsProps>) => {
  const mode = useRecoilValue(ModeAtom);

  return (
    <ul
      className="flex items-center justify-start h-full"
      data-tabs-toggle="#myTabContent"
      role="tablist"
    >
      <li className="mr-2" role="presentation">
        <Tab navigationType={NavigationType.Contents} onNavigate={onNavigate}>
          <MarkdownIcon className={`h-6 w-auto mr-2`} />
          <span>{l10n.t(LocalizationKey.dashboardHeaderTabsContents)}</span>
        </Tab>
      </li>
      <li className="mr-2" role="presentation">
        <Tab navigationType={NavigationType.Media} onNavigate={onNavigate}>
          <PhotoIcon className={`h-6 w-auto mr-2`} />
          <span>{l10n.t(LocalizationKey.dashboardHeaderTabsMedia)}</span>
        </Tab>
      </li>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.snippets.view}>
        <li className="mr-2" role="presentation">
          <Tab navigationType={NavigationType.Snippets} onNavigate={onNavigate}>
            <ScissorsIcon className={`h-6 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsSnippets)}</span>
          </Tab>
        </li>
      </FeatureFlag>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.data.view}>
        <li className="mr-2" role="presentation">
          <Tab navigationType={NavigationType.Data} onNavigate={onNavigate}>
            <CircleStackIcon className={`h-6 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsData)}</span>
          </Tab>
        </li>
      </FeatureFlag>
      <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.taxonomy.view}>
        <li className="mr-2" role="presentation">
          <Tab navigationType={NavigationType.Taxonomy} onNavigate={onNavigate}>
            <TagIcon className={`h-6 w-auto mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardHeaderTabsTaxonomies)}</span>
          </Tab>
        </li>
      </FeatureFlag>
    </ul>
  );
};
