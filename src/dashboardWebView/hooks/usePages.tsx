import { useState, useEffect } from 'react';
import { SortOption } from '../constants/SortOption';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import Fuse from 'fuse.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CategorySelector, FolderSelector, SearchSelector, SettingsSelector, SortingAtom, TabSelector, TagSelector } from '../state';
import { SortOrder, SortType } from '../../models';
import { DateHelper } from '../../helpers/DateHelper';

const fuseOptions: Fuse.IFuseOptions<Page> = {
  keys: [
    { name: 'title', weight: 0.8 },
    { name: 'slug', weight: 0.8 },
    { name: 'description', weight: 0.5 }
  ]
};

export default function usePages(pages: Page[]) {
  const [ pageItems, setPageItems ] = useState<Page[]>([]);
  const [ sorting, setSorting ] = useRecoilState(SortingAtom);
  const settings = useRecoilValue(SettingsSelector);
  const tab = useRecoilValue(TabSelector);
  const folder = useRecoilValue(FolderSelector);
  const search = useRecoilValue(SearchSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);

  // Sort field value alphabetically
  const sortAlphabetically = (property: string) => {
    return (a: Page, b: Page) => {
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    };
  };

  // Sort by date
  const sortByDate = (property: string) => {
    return (a: Page, b: Page) => {
      const dateA = DateHelper.tryParse(a[property]);
      const dateB = DateHelper.tryParse(b[property]);

      return (dateA || new Date(0)).getTime() - (dateB || new Date(0)).getTime();
    };
  };

  useEffect(() => {
    const draftField = settings?.draftField;
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
      const fuse = new Fuse(pages, fuseOptions);
      const results = fuse.search(search);
      searchedPages = results.map(page => page.item);
    }

    // Filter the pages
    let pagesToShow: Page[] = Object.assign([], searchedPages);

    if (draftField && draftField.type === 'choice') {
      if (tab !== Tab.All) {
        pagesToShow = pagesToShow.filter(page => page.fmDraft === tab);
      } else {
        pagesToShow = searchedPages;
      }
    } else {
      const draftFieldName = draftField?.name || "draft";
      if (tab === Tab.Published) {
        pagesToShow = searchedPages.filter(page => !page[draftFieldName]);
      } else if (tab === Tab.Draft) {
        pagesToShow = searchedPages.filter(page => !!page[draftFieldName]);
      } else {
        pagesToShow = searchedPages;
      }
    }

    // Sort the pages
    let pagesSorted: Page[] = Object.assign([], pagesToShow);
    if (!search) {
      if (sorting && sorting.id === SortOption.FileNameAsc) {
        pagesSorted = pagesSorted.sort(sortAlphabetically("fmFileName"));
      } else if (sorting && sorting.id === SortOption.FileNameDesc) {
        pagesSorted = pagesSorted.sort(sortAlphabetically("fmFileName")).reverse();
      } else if (sorting && sorting.id === SortOption.LastModified) {
        pagesSorted = pagesSorted.sort((a, b) => b.fmModified - a.fmModified);
      } else if (sorting && sorting.id && sorting.name) {
        const { order, name, type } = sorting;

        if (type === SortType.string) {
          pagesSorted = pagesSorted.sort(sortAlphabetically(name));
        } else if (type === SortType.date) {
          pagesSorted = pagesSorted.sort(sortByDate(name));
        }

        if (order === SortOrder.desc) {
          pagesSorted = pagesSorted.reverse();
        }
      } else {
        pagesSorted = pagesSorted.sort((a, b) => b.fmModified - a.fmModified);
      }
    }

    if (folder) {
      pagesSorted = pagesSorted.filter(page => page.fmFolder === folder);
    }

    // Filter by tag
    if (tag) {
      pagesSorted = pagesSorted.filter(page => page.tags && page.tags.includes(tag));
    }

    // Filter by category
    if (category) {
      pagesSorted = pagesSorted.filter(page => page.categories && page.categories.includes(category));
    }

    setPageItems(pagesSorted);
  }, [ settings?.draftField, pages, tab, sorting, folder, search, tag, category ]);

  return {
    pageItems
  };
}