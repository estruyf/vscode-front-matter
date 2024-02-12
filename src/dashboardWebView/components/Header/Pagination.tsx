import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import usePagination from '../../hooks/usePagination';
import { MediaTotalSelector, PageAtom, SettingsAtom } from '../../state';
import { PaginationButton } from './PaginationButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

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

    for (let i = start; i < end; i++) {
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
        title={l10n.t(LocalizationKey.dashboardHeaderPaginationFirst)}
        disabled={page === 0}
        onClick={() => {
          if (page > 0) {
            setPage(0);
          }
        }}
      />

      <PaginationButton
        title={l10n.t(LocalizationKey.dashboardHeaderPaginationPrevious)}
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
          className={`max-h-8 rounded ${page === button
            ? `px-2 bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]`
            : `text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)]`}`}
        >
          {button + 1}
        </button>
      ))}

      <PaginationButton
        title={l10n.t(LocalizationKey.dashboardHeaderPaginationNext)}
        disabled={page >= totalPagesNr}
        onClick={() => setPage(page + 1)}
      />

      <PaginationButton
        title={l10n.t(LocalizationKey.dashboardHeaderPaginationLast)}
        disabled={page >= totalPagesNr}
        onClick={() => setPage(totalPagesNr)}
      />
    </div>
  );
};
