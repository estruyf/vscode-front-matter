import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { NavigationType } from '../../models/NavigationType';
import { SettingsAtom } from '../../state';
import { Sorting } from '../Header';
import { Breadcrumb } from '../Header/Breadcrumb';
import { Pagination } from '../Header/Pagination';

export interface IMediaHeaderBottomProps { }

export const MediaHeaderBottom: React.FunctionComponent<IMediaHeaderBottomProps> = (
  _: React.PropsWithChildren<IMediaHeaderBottomProps>
) => {
  const settings = useRecoilValue(SettingsAtom);

  if (!settings?.wsFolder) {
    return null;
  }

  return (
    <nav
      className={`w-full flex justify-between py-2 border-b bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBar-foreground)] border-[var(--frontmatter-border)]`}
      aria-label="Breadcrumb"
    >
      <Breadcrumb />

      <Pagination />

      <div className={`flex px-5 flex-1 justify-end`}>
        <Sorting view={NavigationType.Media} disableCustomSorting />
      </div>
    </nav>
  );
};
