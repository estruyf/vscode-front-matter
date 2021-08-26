import { useState, useEffect } from 'react';
import { SortOption } from '../constants/SortOption';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import Fuse from 'fuse.js';

const fuseOptions: Fuse.IFuseOptions<Page> = {
  keys: [
    "title",
    "slug",
    "description",
    "fmFileName"
  ]
};

export default function usePages(pages: Page[], tab: Tab, sorting: SortOption, group: string | null, search: string | null, tag: string | null, category: string | null) {
  const [ pageItems, setPageItems ] = useState<Page[]>([]);

  useEffect(() => {
    // Check if search needs to be performed
    let searchedPages = pages;
    if (search) {
      const fuse = new Fuse(pages, fuseOptions);
      const results = fuse.search(search);
      searchedPages = results.map(page => page.item);
    }

    // Filter the pages
    let pagesToShow = searchedPages;
    if (tab === Tab.Published) {
      pagesToShow = searchedPages.filter(page => !page.draft);
    } else if (tab === Tab.Draft) {
      pagesToShow = searchedPages.filter(page => !!page.draft);
    } else {
      pagesToShow = searchedPages;
    }

    // Sort the pages
    let pagesSorted = pagesToShow;
    if (sorting === SortOption.FileNameAsc) {
      pagesSorted = pagesToShow.sort((a, b) => a.fmFileName.toLowerCase().localeCompare(b.fmFileName.toLowerCase()));
    } else if (sorting === SortOption.FileNameDesc) {
      pagesSorted = pagesToShow.sort((a, b) => b.fmFileName.toLowerCase().localeCompare(a.fmFileName.toLowerCase()));
    } else {
      pagesSorted = pagesToShow.sort((a, b) => b.fmModified - a.fmModified);
    }

    if (group) {
      pagesSorted = pagesSorted.filter(page => page.fmGroup === group);
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
  }, [ pages, tab, sorting, group, search, tag, category ]);

  return {
    pageItems
  };
}