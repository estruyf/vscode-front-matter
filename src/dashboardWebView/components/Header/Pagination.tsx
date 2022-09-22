import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { routePaths } from '../..';
import { MediaTotalSelector, PageAtom } from '../../state';
import { PaginationButton } from './PaginationButton';

export interface IPaginationProps {
  totalPages?: number;
}

export const PAGE_LIMIT = 16;

export const Pagination: React.FunctionComponent<IPaginationProps> = ({ totalPages }: React.PropsWithChildren<IPaginationProps>) => {
  const [ page, setPage ] = useRecoilState(PageAtom);
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const location = useLocation();

  const totalItems: number = useMemo(() => {
    if (location.pathname === routePaths.contents) {
      return Math.ceil((totalPages || 0) / PAGE_LIMIT) - 1
    } else {
      return Math.ceil(totalMedia / PAGE_LIMIT) - 1;
    }
  }, [location.pathname, totalPages, totalMedia]);

  const getButtons = (): number[] => {
    const maxButtons = 5;
    const buttons: number[] = [];
    const start = page - maxButtons;
    const end = page + maxButtons;

    for (let i = start; i <= end; i++) {
      if (i >= 0 && i <= totalItems) {
        buttons.push(i);
      }
    }
    return buttons;
  };

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
            setPage(0)
          }
        }} />

      <PaginationButton
        title="Previous"
        disabled={page === 0}
        onClick={() => {
          if (page > 0) {
            setPage(page - 1)
          }
        }} />
      
      {getButtons().map((button) => (
        <button
          key={button}
          disabled={button === page}
          onClick={() => {
            setPage(button)
          }
          }
          className={`${page === button ? 'bg-gray-200 px-2 text-vulcan-500' : 'text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500'} max-h-8 rounded-sm`}
        >{button + 1}</button>
      ))}

      <PaginationButton
        title="Next"
        disabled={page >= totalItems}
        onClick={() => setPage(page + 1)} />

      <PaginationButton
        title="Last"
        disabled={page >= totalItems}
        onClick={() => setPage(totalItems)} />
    </div>
  );
};