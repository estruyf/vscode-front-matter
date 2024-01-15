import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { groupBy } from '../../../helpers/GroupBy';
import { FrontMatterIcon } from '../../../panelWebView/components/Icons/FrontMatterIcon';
import { GroupOption } from '../../constants/GroupOption';
import { Page } from '../../models/Page';
import { Settings } from '../../models/Settings';
import { GroupingSelector, PageAtom, ViewSelector } from '../../state';
import { Item } from './Item';
import { List } from './List';
import usePagination from '../../hooks/usePagination';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { PinnedItemsAtom } from '../../state/atom/PinnedItems';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { PinIcon } from '../Icons/PinIcon';
import { PinnedItem } from './PinnedItem';
import { DashboardViewType } from '../../models';

export interface IOverviewProps {
  pages: Page[];
  settings: Settings | null;
}

export const Overview: React.FunctionComponent<IOverviewProps> = ({
  pages,
  settings
}: React.PropsWithChildren<IOverviewProps>) => {
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [pinnedItems, setPinnedItems] = useRecoilState(PinnedItemsAtom);
  const grouping = useRecoilValue(GroupingSelector);
  const page = useRecoilValue(PageAtom);
  const { pageSetNr } = usePagination(settings?.dashboardState.contents.pagination);
  const { getColors } = useThemeColors();
  const view = useRecoilValue(ViewSelector);

  const pagedPages = useMemo(() => {
    if (pageSetNr) {
      return pages.slice(page * pageSetNr, (page + 1) * pageSetNr);
    }

    return pages;
  }, [pages, page, pageSetNr, pinnedItems, grouping]);

  const pinnedPages = useMemo(() => {
    if (grouping === GroupOption.none) {
      return pages.filter((page) => pinnedItems.includes(page.fmRelFileWsPath));
    }

    return [];
  }, [pages, pinnedItems, grouping]);

  const groupName = useCallback(
    (groupId, groupedPages) => {
      if (grouping === GroupOption.Draft) {
        return `${groupId} (${groupedPages[groupId].length})`;
      }

      return `${GroupOption[grouping]}: ${groupId} (${groupedPages[groupId].length})`;
    },
    [grouping]
  );

  const { groupKeys, groupedPages } = useMemo(() => {
    if (grouping === GroupOption.none) {
      return { groupKeys: [], groupedPages: {} };
    }

    let groupedPages = groupBy(pages, grouping === GroupOption.Year ? 'fmYear' : 'fmDraft');
    let groupKeys = Object.keys(groupedPages);

    if (grouping === GroupOption.Year) {
      groupKeys = groupKeys.sort((a, b) => {
        return parseInt(b) - parseInt(a);
      });
    } else if (grouping === GroupOption.Draft && settings?.draftField?.type !== 'choice') {
      const isInverted = settings?.draftField?.invert;
      const allPublished: Page[] = groupedPages['Published'] || [];
      const allDrafts: Page[] = groupedPages['Draft'] || [];

      if (allPublished.length > 0) {
        const drafts = !isInverted ? allDrafts : allPublished;
        const published = (!isInverted ? allPublished : allDrafts).filter((page) => !page.fmPublished || page.fmPublished <= Date.now());
        const scheduled = (!isInverted ? allPublished : allDrafts).filter((page) => page.fmPublished && page.fmPublished > Date.now());

        delete groupedPages["Published"];
        delete groupedPages["Draft"];

        groupKeys = ['Scheduled', ...groupKeys];
        groupedPages = {
          "Scheduled": scheduled,
          "Published": published,
          "Draft": drafts,
          ...groupedPages,
        }
      }
    }

    return { groupKeys, groupedPages };
  }, [pages, grouping, settings?.draftField]);

  React.useEffect(() => {
    messageHandler.request<string[]>(DashboardMessage.getPinnedItems).then((items) => {
      setIsReady(true);
      setPinnedItems(items || []);
    }).catch(() => {
      setIsReady(true);
      setPinnedItems([]);
    });
  }, []);

  if (!isReady) {
    return null;
  }

  if (!pages || !pages.length) {
    return (
      <div className={`flex items-center justify-center h-full`}>
        <div className={`max-w-xl text-center`}>
          <FrontMatterIcon
            className={`h-32 mx-auto opacity-90 mb-8 ${getColors('text-vulcan-300 dark:text-whisper-800', 'text-[var(--vscode-editor-foreground)]')
              }`}
          />
          {settings && settings?.contentFolders?.length > 0 ? (
            <p className={`text-xl font-medium`}>{l10n.t(LocalizationKey.dashboardContentsOverviewNoMarkdown)}</p>
          ) : (
            <p className={`text-lg font-medium`}>{l10n.t(LocalizationKey.dashboardContentsOverviewNoFolders)}</p>
          )}
        </div>
      </div>
    );
  }

  if (grouping !== GroupOption.none) {
    return (
      <>
        {groupKeys.map((groupId, idx) => (
          groupedPages[groupId].length > 0 && (
            <Disclosure key={groupId} as={`div`} className={`w-full`} defaultOpen>
              {({ open }) => (
                <>
                  <Disclosure.Button className={`mb-4 ${idx !== 0 ? 'mt-8' : ''}`}>
                    <h2 className={`text-2xl font-bold flex items-center`}>
                      <ChevronRightIcon
                        className={`w-8 h-8 mr-1 ${open ? 'transform rotate-90' : ''}`}
                      />
                      {groupName(groupId, groupedPages)}
                    </h2>
                  </Disclosure.Button>

                  <Disclosure.Panel>
                    <List>
                      {groupedPages[groupId].map((page: Page) => (
                        <Item key={`${page.slug}-${idx}`} {...page} />
                      ))}
                    </List>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          )
        ))}
      </>
    );
  }

  return (
    <div className='divide-y divide-[var(--frontmatter-border)]'>
      {
        pinnedPages.length > 0 && (
          <div className='mb-8'>
            <h1 className='text-xl flex space-x-2 items-center mb-4'>
              <PinIcon className={`-rotate-45`} />
              <span>{l10n.t(LocalizationKey.dashboardContentsOverviewPinned)}</span>
            </h1>
            <List>
              {pinnedPages.map((page, idx) => (
                view === DashboardViewType.List ? (
                  <Item key={`${page.slug}-${idx}`} {...page} />
                ) : (
                  <PinnedItem key={`${page.slug}-${idx}`} {...page} />
                )
              ))}
            </List>
          </div>
        )
      }

      <div className={pinnedItems.length > 0 ? "pt-8" : ""}>
        <List>
          {pagedPages.map((page, idx) => (
            <Item key={`${page.slug}-${idx}`} {...page} />
          ))}
        </List>
      </div>
    </div>
  );
};
