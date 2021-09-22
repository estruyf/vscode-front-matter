import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { groupBy } from '../../../helpers/GroupBy';
import { FrontMatterIcon } from '../../../panelWebView/components/Icons/FrontMatterIcon';
import { GroupOption } from '../../constants/GroupOption';
import { Page } from '../../models/Page';
import { Settings } from '../../models/Settings';
import { GroupingSelector } from '../../state';
import { Item } from './Item';
import { List } from './List';

export interface IOverviewProps {
  pages: Page[];  
  settings: Settings | null;
}

export const Overview: React.FunctionComponent<IOverviewProps> = ({pages, settings}: React.PropsWithChildren<IOverviewProps>) => {
  const grouping = useRecoilValue(GroupingSelector);

  if (!pages || !pages.length) {
    return (
      <div className={`flex items-center justify-center h-full`}>
        <div className={`max-w-xl text-center`}>
          <FrontMatterIcon className={`text-vulcan-300 dark:text-whisper-800 h-32 mx-auto opacity-90 mb-8`} />
          {
            settings && settings?.folders?.length > 0 ? (
              <p className={`text-xl font-medium`}>No Markdown to show</p>
            ) : (
              <>
                <p className={`text-lg font-medium`}>Make sure you registered a content folder in your project to let Front Matter find the contents.</p>
              </>
            )
          }
        </div>
      </div>
    );
  }

  if (grouping !== GroupOption.none) {
    const groupedPages = groupBy(pages, grouping === GroupOption.Year ? 'fmYear' : 'fmDraft');
    let groupKeys = Object.keys(groupedPages);

    if (grouping === GroupOption.Year) {
      groupKeys = groupKeys.sort((a, b) => { return parseInt(b) - parseInt(a) });
    }

    return (
      <>
        {
          groupKeys.map((groupId, idx) => (
            <Disclosure key={groupId} as={`div`} className={`w-full`} defaultOpen>
              {({ open }) => (
                <>
                  <Disclosure.Button className={`mb-4 ${idx !== 0 ? "mt-8" : ""}`}>
                    <h2 className={`text-2xl font-bold flex items-center`}>
                      <ChevronRightIcon
                        className={`w-8 h-8 mr-1 ${open ? "transform rotate-90" : ""}`}
                      />
                      {GroupOption[grouping]}: {groupId} ({groupedPages[groupId].length})
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
          ))
        }
      </>
    );
  }

  return (
    <List>
      {pages.map((page, idx) => (
        <Item key={`${page.slug}-${idx}`} {...page} />
      ))}
    </List>
  );
};