import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import usePagination from '../../hooks/usePagination';
import { MediaTotalSelector, PageAtom, SettingsAtom } from '../../state';

export interface IPaginationStatusProps {
  totalPages?: number;
}

export const PaginationStatus: React.FunctionComponent<IPaginationStatusProps> = ({ totalPages }: React.PropsWithChildren<IPaginationStatusProps>) => {
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const page = useRecoilValue(PageAtom);
  const settings = useRecoilValue(SettingsAtom);
  const { pageSetNr, totalItems } = usePagination(settings?.dashboardState.contents.pagination, totalPages || 0, totalMedia);

  const totelItemsOnPage = useMemo(() => {
    const items = ((page + 1) * pageSetNr);
    if (totalItems < items) {
      return totalItems;
    }
    return totalItems;
  }, [page, totalMedia, pageSetNr]);

  return (
    <div className="hidden sm:flex">      
      <p className="text-sm text-gray-500 dark:text-whisper-900">
        Showing <span className="font-medium">{(page * pageSetNr) + 1}</span> to <span className="font-medium">{totelItemsOnPage}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </p>
    </div>
  );
};