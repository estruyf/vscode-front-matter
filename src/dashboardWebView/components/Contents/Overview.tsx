import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { groupBy } from '../../../helpers/GroupBy';
import { FrontMatterIcon } from '../../../panelWebView/components/Icons/FrontMatterIcon';
import { GroupOption } from '../../constants/GroupOption';
import { Page } from '../../models/Page';
import { Settings } from '../../models/Settings';
import { GroupingSelector, PageAtom } from '../../state';
import { Item } from './Item';
import { List } from './List';
import usePagination from '../../hooks/usePagination';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IOverviewProps {
  pages: Page[];
  settings: Settings | null;
}

export const Overview: React.FunctionComponent<IOverviewProps> = ({
  pages,
  settings
}: React.PropsWithChildren<IOverviewProps>) => {
  const grouping = useRecoilValue(GroupingSelector);
  const page = useRecoilValue(PageAtom);
  const { pageSetNr } = usePagination(settings?.dashboardState.contents.pagination);
  const { getColors } = useThemeColors();

  const pagedPages = useMemo(() => {
    if (pageSetNr) {
      return pages.slice(page * pageSetNr, (page + 1) * pageSetNr);
    }

    return pages;
  }, [pages, page, pageSetNr]);

  const groupName = useCallback(
    (groupId, groupedPages) => {
      if (grouping === GroupOption.Draft) {
        return `${groupId} (${groupedPages[groupId].length})`;
      }

      return `${GroupOption[grouping]}: ${groupId} (${groupedPages[groupId].length})`;
    },
    [grouping]
  );

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
    const groupedPages = groupBy(pages, grouping === GroupOption.Year ? 'fmYear' : 'fmDraft');
    let groupKeys = Object.keys(groupedPages);

    if (grouping === GroupOption.Year) {
      groupKeys = groupKeys.sort((a, b) => {
        return parseInt(b) - parseInt(a);
      });
    }

    return (
      <>
        {groupKeys.map((groupId, idx) => (
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
        ))}
      </>
    );
  }

  return (
    <List>
      {pagedPages.map((page, idx) => (
        <Item key={`${page.slug}-${idx}`} {...page} />
      ))}
    </List>
  );
};
