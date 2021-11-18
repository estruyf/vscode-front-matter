import { useState, useEffect } from 'react';
import { SortOption } from '../constants/SortOption';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import Fuse from 'fuse.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CategorySelector, FolderSelector, SearchSelector, SettingsSelector, SortingAtom, TabSelector, TagSelector } from '../state';
import { SortOrder, SortType } from '../../models';
import { Sorting } from '../../helpers/Sorting';

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
        pagesSorted = pagesSorted.sort(Sorting.alphabetically("fmFileName"));
      } else if (sorting && sorting.id === SortOption.FileNameDesc) {
        pagesSorted = pagesSorted.sort(Sorting.alphabetically("fmFileName")).reverse();
      } else if (sorting && sorting.id === SortOption.LastModifiedAsc) {
        pagesSorted = pagesSorted.sort(Sorting.number("fmModified"));
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