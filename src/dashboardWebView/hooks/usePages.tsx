import { useState, useEffect, useCallback } from 'react';
import { SortOption } from '../constants/SortOption';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import Fuse from 'fuse.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CategorySelector, FolderSelector, SearchSelector, SettingsSelector, SortingAtom, TabInfoAtom, TabSelector, TagSelector } from '../state';
import { SortOrder, SortType } from '../../models';
import { Sorting } from '../../helpers/Sorting';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../DashboardMessage';
import { EventData } from '@estruyf/vscode/dist/models';
import { parseWinPath } from '../../helpers/parseWinPath';

export default function usePages(pages: Page[]) {
  const [ pageItems, setPageItems ] = useState<Page[]>([]);
  const [ sorting, setSorting ] = useRecoilState(SortingAtom);
  const [ tabInfo , setTabInfo ] = useRecoilState(TabInfoAtom);
  const settings = useRecoilValue(SettingsSelector);
  const tab = useRecoilValue(TabSelector);
  const folder = useRecoilValue(FolderSelector);
  const search = useRecoilValue(SearchSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);

  const processPages = useCallback((searchedPages: Page[]) => {
    const draftField = settings?.draftField;
    const framework = settings?.crntFramework;

    // Filter the pages
    let pagesToShow: Page[] = Object.assign([], searchedPages);

    // Framework specific actions
    if (framework?.toLowerCase() === "jekyll") {
      pagesToShow = pagesToShow.map(page => {
        // https://jekyllrb.com/docs/posts/#drafts
        const filePath = parseWinPath(page.fmFilePath);
        page.draft = filePath.indexOf(`/_drafts/`) > -1;

        // Published field: https://jekyllrb.com/docs/front-matter/#predefined-global-variables
        if (typeof page.published !== "undefined") {
          page.draft = !page.published;
        }

        return page;
      });
    }

    const draftTypes = Object.assign({}, tabInfo);
    draftTypes[Tab.All] = pagesToShow.length;

    // Filter by draft status
    if (draftField && draftField.type === 'choice') {
      const draftChoices = settings?.draftField?.choices;
      for (const choice of (draftChoices || [])) {
        if (choice) {
          draftTypes[choice] = pagesToShow.filter(page => page.fmDraft === choice).length;
        }
      }

      if (tab !== Tab.All) {
        pagesToShow = pagesToShow.filter(page => page.fmDraft === tab);
      } else {
        pagesToShow = searchedPages;
      }
    } else {
      // Draft field is a boolean field
      const draftFieldName = draftField?.name || "draft";

      const drafts = pagesToShow.filter(page => page[draftFieldName] == true || page[draftFieldName] === "true");
      const published = pagesToShow.filter(page => page[draftFieldName] == false || page[draftFieldName] === "false" || typeof page[draftFieldName] === "undefined");
      
      draftTypes[Tab.Draft] = draftField?.invert ? published.length : drafts.length;
      draftTypes[Tab.Published] = draftField?.invert ? drafts.length : published.length;

      if (tab === Tab.Published) {
        pagesToShow = draftField?.invert ? drafts : published;
      } else if (tab === Tab.Draft) {
        pagesToShow = draftField?.invert ? published : drafts;
      } else {
        pagesToShow = searchedPages;
      }
    }

    // Set the tab information
    setTabInfo(draftTypes);

    // Sort the pages
    let pagesSorted: Page[] = Object.assign([], pagesToShow);
    if (!search) {
      if (sorting && sorting.id === SortOption.FileNameAsc) {
        pagesSorted = pagesSorted.sort(Sorting.alphabetically("fmFileName"));
      } else if (sorting && sorting.id === SortOption.FileNameDesc) {
        pagesSorted = pagesSorted.sort(Sorting.alphabetically("fmFileName")).reverse();
      } else if (sorting && sorting.id === SortOption.PublishedAsc) {
        pagesSorted = pagesSorted.sort(Sorting.number("fmPublished"));
      } else if (sorting && sorting.id === SortOption.LastModifiedAsc) {
        pagesSorted = pagesSorted.sort(Sorting.number("fmModified"));
      } else if (sorting && sorting.id === SortOption.PublishedDesc) {
        pagesSorted = pagesSorted.sort(Sorting.number("fmPublished")).reverse();
      } else if (sorting && sorting.id === SortOption.LastModifiedDesc) {
        pagesSorted = pagesSorted.sort(Sorting.number("fmModified")).reverse();
      } else if (sorting && sorting.id && sorting.name) {
        const { order, name, type } = sorting;

        if (type === SortType.string) {
          pagesSorted = pagesSorted.sort(Sorting.alphabetically(name));
        } else if (type === SortType.date) {
          pagesSorted = pagesSorted.sort(Sorting.date(name));
        }

        if (order === SortOrder.desc) {
          pagesSorted = pagesSorted.reverse();
        }
      } else {
        pagesSorted = pagesSorted.sort(Sorting.number("fmModified")).reverse();
      }
    }

    if (folder) {
      pagesSorted = pagesSorted.filter(page => page.fmFolder === folder);
    }

    // Filter by tag
    if (tag) {
      pagesSorted = pagesSorted.filter(page => page.fmTags && page.fmTags.includes(tag));
    }

    // Filter by category
    if (category) {
      pagesSorted = pagesSorted.filter(page => page.fmCategories && page.fmCategories.includes(category));
    }

    setPageItems(pagesSorted);
  }, [ settings, tab, folder, search, tag, category, sorting, tabInfo ]);


  const searchListener = (message: MessageEvent<EventData<any>>) => {
    switch (message.data.command) {
      case DashboardMessage.searchPages:
        processPages(message.data.data);
        break;
    }
  };

  useEffect(() => {
    let usedSorting = sorting;

    if (!usedSorting) {
      const lastSort = settings?.dashboardState.contents.sorting;      
      if (lastSort) {
        setSorting(lastSort);
        return;
      }
    }

    // Check if search needs to be performed
    let searchedPages = pages;
    if (search) {
      // const fuse = new Fuse(pages, fuseOptions);
      // const results = fuse.search(search);
      // searchedPages = results.map(page => page.item);
      
      Messenger.send(DashboardMessage.searchPages, { query: search });
    } else {
      processPages(searchedPages);
    }
  }, [ settings?.draftField, pages, sorting, search, tab ]);

  useEffect(() => {
    Messenger.listen(searchListener);

    return () => {
      Messenger.unlisten(searchListener);
    }
  }, []);

  return {
    pageItems
  };
}