import { useState, useEffect } from 'react';
import { SortOption } from '../constants/SortOption';
import { Tab } from '../constants/Tab';
import { Page } from '../models/Page';
import Fuse from 'fuse.js';
import { useRecoilValue } from 'recoil';
import { CategorySelector, FolderSelector, SearchSelector, SettingsSelector, SortingSelector, TabSelector, TagSelector } from '../state';

const fuseOptions: Fuse.IFuseOptions<Page> = {
  keys: [
    { name: 'title', weight: 0.8 },
    { name: 'slug', weight: 0.8 },
    { name: 'description', weight: 0.5 }
  ]
};

export default function usePages(pages: Page[]) {
  const [ pageItems, setPageItems ] = useState<Page[]>([]);
  const settings = useRecoilValue(SettingsSelector);
  const tab = useRecoilValue(TabSelector);
  const sorting = useRecoilValue(SortingSelector);
  const folder = useRecoilValue(FolderSelector);
  const search = useRecoilValue(SearchSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);

  useEffect(() => {
    const draftField = settings?.draftField;

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
      if (sorting === SortOption.FileNameAsc) {
        pagesSorted = pagesToShow.sort((a, b) => a.fmFileName.toLowerCase().localeCompare(b.fmFileName.toLowerCase()));
      } else if (sorting === SortOption.FileNameDesc) {
        pagesSorted = pagesToShow.sort((a, b) => b.fmFileName.toLowerCase().localeCompare(a.fmFileName.toLowerCase()));
      } else {
        pagesSorted = pagesToShow.sort((a, b) => b.fmModified - a.fmModified);
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