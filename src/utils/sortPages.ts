import { SortOption } from '../dashboardWebView/constants/SortOption';
import { Page, SortingOption } from '../dashboardWebView/models';
import { Sorting } from '../helpers/Sorting';
import { SortOrder, SortType } from '../models';

export const sortPages = (pages: Page[], sorting: SortingOption | null) => {
  if (sorting && sorting.id === SortOption.FileNameAsc) {
    pages = pages.sort(Sorting.alphabetically('fmFileName'));
  } else if (sorting && sorting.id === SortOption.FileNameDesc) {
    pages = pages.sort(Sorting.alphabetically('fmFileName')).reverse();
  } else if (sorting && sorting.id === SortOption.PublishedAsc) {
    pages = pages.sort(Sorting.numerically('fmPublished'));
  } else if (sorting && sorting.id === SortOption.LastModifiedAsc) {
    pages = pages.sort(Sorting.numerically('fmModified'));
  } else if (sorting && sorting.id === SortOption.PublishedDesc) {
    pages = pages.sort(Sorting.numerically('fmPublished')).reverse();
  } else if (sorting && sorting.id === SortOption.LastModifiedDesc) {
    pages = pages.sort(Sorting.numerically('fmModified')).reverse();
  } else if (sorting && sorting.id && sorting.name) {
    const { order, name, type } = sorting;

    if (type === SortType.string) {
      pages = pages.sort(Sorting.alphabetically(name));
    } else if (type === SortType.date) {
      pages = pages.sort(Sorting.date(name));
    } else if (type === SortType.number) {
      pages = pages.sort(Sorting.numerically(name));
    }

    if (order === SortOrder.desc) {
      pages = pages.reverse();
    }
  } else {
    pages = pages.sort(Sorting.numerically('fmModified')).reverse();
  }

  return pages;
};
