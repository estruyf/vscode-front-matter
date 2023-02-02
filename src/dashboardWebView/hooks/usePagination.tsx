import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from '..';

export const PAGE_LIMIT = 16;

export default function usePagination(
  value: number | boolean | null | undefined,
  totalPages?: number,
  totalMedia?: number
) {
  const location = useLocation();

  const pagination = useMemo(() => {
    if (location.pathname === routePaths.contents) {
      if (typeof value === 'number') {
        const pageNr = value > 0 ? value : 0;
        if (pageNr > 52) {
          return 52;
        }
        return pageNr;
      } else if (typeof value === 'boolean') {
        return value ? PAGE_LIMIT : 0;
      }
    }

    return PAGE_LIMIT;
  }, [value, location.pathname]);

  const totalPagesNr: number = useMemo(() => {
    if (location.pathname === routePaths.contents) {
      if (totalPages) {
        return Math.ceil((totalPages || 0) / pagination) - 1;
      }
    } else {
      if (totalMedia) {
        return Math.ceil(totalMedia / pagination) - 1;
      }
    }
    return 0;
  }, [location.pathname, totalPages, totalMedia, pagination]);

  /**
   * The total items (pages or media)
   */
  const totalItems: number = useMemo(() => {
    if (location.pathname === routePaths.contents) {
      if (totalPages) {
        return totalPages;
      }
    } else {
      if (totalMedia) {
        return totalMedia;
      }
    }
    return 0;
  }, [location.pathname, totalPages, totalMedia, pagination]);

  return {
    pageSetNr: pagination,
    totalPagesNr,
    totalItems
  };
}
