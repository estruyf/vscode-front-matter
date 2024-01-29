import { useState, useEffect, useCallback } from 'react';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  AllPagesAtom,
  CategorySelector,
  FolderSelector,
  SearchSelector,
  SettingsSelector,
  SortingAtom,
  TabInfoAtom,
  TabSelector,
  TagSelector
} from '../state';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../DashboardMessage';
import { EventData } from '@estruyf/vscode/dist/models';
import { parseWinPath } from '../../helpers/parseWinPath';
import { sortPages } from '../../utils/sortPages';
import { ExtensionState } from '../../constants';
import { SortingOption } from '../models';

export default function usePages(pages: Page[]) {
  const [pageItems, setPageItems] = useRecoilState(AllPagesAtom);
  const [sortedPages, setSortedPages] = useState<Page[]>([]);
  const [sorting, setSorting] = useRecoilState(SortingAtom);
  const [tabInfo, setTabInfo] = useRecoilState(TabInfoAtom);
  const settings = useRecoilValue(SettingsSelector);
  const tab = useRecoilValue(TabSelector);
  const folder = useRecoilValue(FolderSelector);
  const search = useRecoilValue(SearchSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);

  /**
   * Process all the pages by applying the sorting, filtering and searching.
   */
  const processPages = useCallback(
    (searchedPages: Page[]) => {
      const framework = settings?.crntFramework;

      // Filter the pages
      let pagesToShow: Page[] = Object.assign([], searchedPages);

      // Framework specific actions
      if (framework?.toLowerCase() === 'jekyll' || framework?.toLowerCase() === 'hexo') {
        pagesToShow = pagesToShow.map((page) => {
          try {
            const crntPage = Object.assign({}, page);
            // https://jekyllrb.com/docs/posts/#drafts
            const filePath = parseWinPath(page.fmFilePath);
            crntPage.draft = filePath.indexOf(`/_drafts/`) > -1;

            // Published field: https://jekyllrb.com/docs/front-matter/#predefined-global-variables
            if (typeof crntPage.published !== 'undefined') {
              crntPage.draft = !crntPage.published;
            }

            return crntPage;
          } catch (error) {
            return page;
          }
        });
      }

      // Sort the pages
      let pagesSorted: Page[] = Object.assign([], pagesToShow);
      if (!search) {
        pagesSorted = sortPages(pagesSorted, sorting);
      }

      if (folder) {
        pagesSorted = pagesSorted.filter((page) => page.fmFolder === folder);
      }

      // Filter by tag
      if (tag) {
        pagesSorted = pagesSorted.filter((page) => page.fmTags && page.fmTags.includes(tag));
      }

      // Filter by category
      if (category) {
        pagesSorted = pagesSorted.filter(
          (page) => page.fmCategories && page.fmCategories.includes(category)
        );
      }

      setSortedPages(pagesSorted);
    },
    [settings, tab, folder, search, tag, category, sorting, tabInfo]
  );

  /**
   * Process the pages when the tab changes
   */
  const processByTab = useCallback(
    (pages: Page[]) => {
      const draftField = settings?.draftField;

      let crntPages: Page[] = Object.assign([], pages);

      // Process the tab data
      const draftTypes = Object.assign({}, tabInfo);
      draftTypes[Tab.All] = crntPages.length;

      // Filter by draft status
      if (draftField && draftField.type === 'choice') {
        const draftChoices = settings?.draftField?.choices;
        for (const choice of draftChoices || []) {
          if (choice) {
            draftTypes[choice] = crntPages.filter((page) => page.fmDraft === choice).length;
          }
        }

        if (tab !== Tab.All) {
          crntPages = crntPages.filter((page) => page.fmDraft === tab);
        } else {
          crntPages = crntPages;
        }
      } else {
        // Draft field is a boolean field
        const draftFieldName = draftField?.name || 'draft';

        const usesDraft = crntPages.some(x => typeof x[draftFieldName] !== 'undefined');
        if (usesDraft) {
          const allDrafts = crntPages.filter(
            (page) => page[draftFieldName] == true || page[draftFieldName] === 'true'
          );
          const allPublished = crntPages.filter(
            (page) =>
              page[draftFieldName] == false ||
              page[draftFieldName] === 'false' ||
              typeof page[draftFieldName] === 'undefined'
          );

          // If the invert is set, the drafts become published and vice versa
          const isInverted = draftField?.invert;
          const drafts = !isInverted ? allDrafts : allPublished;
          const published = (!isInverted ? allPublished : allDrafts).filter((page) => !page.fmPublished || page.fmPublished <= Date.now());
          const scheduled = (!isInverted ? allPublished : allDrafts).filter((page) => page.fmPublished && page.fmPublished > Date.now());

          draftTypes[Tab.Draft] = drafts.length;
          draftTypes[Tab.Published] = published.length;
          draftTypes[Tab.Scheduled] = scheduled.length;

          if (tab === Tab.Published) {
            crntPages = published;
          } else if (tab === Tab.Draft) {
            crntPages = drafts;
          } else if (tab === Tab.Scheduled) {
            crntPages = scheduled;
          } else {
            crntPages = crntPages;
          }
        }
      }

      // Set the tab information
      setTabInfo(draftTypes);

      // Set the pages
      setPageItems(crntPages);
    },
    [tab, tabInfo, settings]
  );

  /**
   * Search listener for filtered pages
   * @param message
   */
  const searchListener = (message: MessageEvent<EventData<any>>) => {
    switch (message.data.command) {
      case DashboardMessage.searchPages:
        processPages(message.data.payload);
        break;
    }
  };

  useEffect(() => {
    let usedSorting = sorting;

    const startPageProcessing = () => {
      // Check if search needs to be performed
      let searchedPages = pages;
      if (search) {
        Messenger.send(DashboardMessage.searchPages, { query: search });
      } else {
        processPages(searchedPages);
      }
    }

    if (!usedSorting) {
      messageHandler.request<{ key: string; value: SortingOption; }>(DashboardMessage.getState, {
        key: ExtensionState.Dashboard.Contents.Sorting
      }).then(({ key, value }) => {
        if (key === ExtensionState.Dashboard.Contents.Sorting && value) {
          setSorting(value);
          return;
        } else {
          startPageProcessing();
        }
      });
    } else {
      startPageProcessing();
    }
  }, [settings?.draftField, pages, sorting, search, tag, category, folder]);

  useEffect(() => {
    processByTab(sortedPages);
  }, [sortedPages, tab]);

  useEffect(() => {
    Messenger.listen(searchListener);

    return () => {
      Messenger.unlisten(searchListener);
    };
  }, []);

  return {
    pageItems
  };
}
