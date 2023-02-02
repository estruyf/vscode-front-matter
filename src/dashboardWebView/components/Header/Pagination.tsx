import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import usePagination from '../../hooks/usePagination';
import { MediaTotalSelector, PageAtom, SettingsAtom } from '../../state';
import { PaginationButton } from './PaginationButton';

export interface IPaginationProps {
  totalPages?: number;
}

export const Pagination: React.FunctionComponent<IPaginationProps> = ({
  totalPages
}: React.PropsWithChildren<IPaginationProps>) => {
  const [page, setPage] = useRecoilState(PageAtom);
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const settings = useRecoilValue(SettingsAtom);
  const { pageSetNr, totalPagesNr } = usePagination(
    settings?.dashboardState.contents.pagination,
    totalPages,
    totalMedia
  );

  const getButtons = useCallback((): number[] => {
    const maxButtons = 5;
    const buttons: number[] = [];
    const start = page - maxButtons;
    const end = page + maxButtons;

    for (let i = start; i <= end; i++) {
      if (i >= 0 && i <= totalPagesNr) {
        buttons.push(i);
      }
    }
    return buttons;
  }, [page, totalPagesNr]);

  useEffect(() => {
    setPage(0);
  }, [pageSetNr]);

  useEffect(() => {
    setPage(0);
  }, []);

  return (
    <div className="flex justify-between items-center sm:justify-end space-x-2 text-sm">
      <PaginationButton
        title="First"
        disabled={page === 0}
        onClick={() => {
          if (page > 0) {
            setPage(0);
          }
        }}
      />

      <PaginationButton
        title="Previous"
        disabled={page === 0}
        onClick={() => {
          if (page > 0) {
            setPage(page - 1);
          }
        }}
      />

      {getButtons().map((button) => (
        <button
          key={button}
          disabled={button === page}
          onClick={() => {
            setPage(button);
          }}
          className={`${
            page === button
              ? 'bg-gray-200 px-2 text-vulcan-500'
              : 'text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500'
          } max-h-8 rounded-sm`}
        >
          {button + 1}
        </button>
      ))}

      <PaginationButton
        title="Next"
        disabled={page >= totalPagesNr}
        onClick={() => setPage(page + 1)}
      />

      <PaginationButton
        title="Last"
        disabled={page >= totalPagesNr}
        onClick={() => setPage(totalPagesNr)}
      />
    </div>
  );
};
