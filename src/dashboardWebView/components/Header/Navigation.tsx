import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Tab } from '../../constants/Tab';
import { SettingsAtom, TabAtom, TabInfoAtom } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface INavigationProps {
  totalPages: number;
}

export interface INavigationItemProps {
  tabId: string;
  isCrntTab: boolean;
  onClick: () => void;
}

const NavigationItem: React.FunctionComponent<INavigationItemProps> = ({
  tabId,
  isCrntTab,
  onClick,
  children
}: React.PropsWithChildren<INavigationItemProps>) => {

  return (
    <button
      className={`${isCrntTab
        ?
        `border-[var(--vscode-textLink-foreground)] text-[var(--vscode-textLink-foreground)]` :
        `border-transparent text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:border-[var(--vscode-textLink-activeForeground)]`
        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
      aria-current={isCrntTab ? 'page' : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  )
};

export const Navigation: React.FunctionComponent<INavigationProps> = () => {
  const [crntTab, setCrntTab] = useRecoilState(TabAtom);
  const tabInfo = useRecoilValue(TabInfoAtom);
  const settings = useRecoilValue(SettingsAtom);

  const tabs = React.useMemo(() => {
    const crntTabs = [
      { name: l10n.t(LocalizationKey.dashboardHeaderNavigationAllArticles), id: Tab.All }
    ];

    if (settings?.draftField?.type === 'boolean' && tabInfo && Object.keys(tabInfo).length > 1) {
      crntTabs.push({ name: l10n.t(LocalizationKey.dashboardHeaderNavigationPublished), id: Tab.Published });

      if (tabInfo.scheduled) {
        crntTabs.push({ name: l10n.t(LocalizationKey.dashboardHeaderNavigationScheduled), id: Tab.Scheduled });
      }

      crntTabs.push({ name: l10n.t(LocalizationKey.dashboardHeaderNavigationDraft), id: Tab.Draft });
    }

    return crntTabs;
  }, [settings?.draftField?.type, tabInfo]);

  return (
    <nav className="flex-1 -mb-px flex space-x-2 xl:space-x-4" aria-label="Tabs">
      {settings?.draftField?.type === 'boolean' ? (
        tabs.map((tab) => (
          <NavigationItem
            tabId={tab.id}
            isCrntTab={tab.id === crntTab}
            key={tab.name}
            onClick={() => setCrntTab(tab.id)}>
            {tab.name}
            {tabInfo && tabInfo[tab.id] ? ` (${tabInfo[tab.id]})` : ''}
          </NavigationItem>
        ))
      ) : (
        <>
          <NavigationItem
            tabId={tabs[0].id}
            isCrntTab={tabs[0].id === crntTab}
            onClick={() => setCrntTab(tabs[0].id)}>
            {tabs[0].name}
            {tabInfo && tabInfo[tabs[0].id] ? ` (${tabInfo[tabs[0].id]})` : ''}
          </NavigationItem>

          {settings?.draftField?.choices?.map((value, idx) => (
            <NavigationItem
              key={`${value}-${idx}`}
              tabId={value}
              isCrntTab={value === crntTab}
              onClick={() => setCrntTab(value)}>
              {value}
              {tabInfo && tabInfo[value] ? ` (${tabInfo[value]})` : ''}
            </NavigationItem>
          ))}
        </>
      )}
    </nav>
  );
};
