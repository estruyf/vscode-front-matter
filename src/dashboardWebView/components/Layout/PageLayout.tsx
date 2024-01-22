import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';

export interface IPageLayoutProps {
  header?: React.ReactNode;
  folders?: string[] | undefined;
  totalPages?: number | undefined;
  contentClass?: string;
}

export const PageLayout: React.FunctionComponent<IPageLayoutProps> = ({
  header,
  folders,
  totalPages,
  contentClass,
  children
}: React.PropsWithChildren<IPageLayoutProps>) => {
  const settings = useRecoilValue(SettingsSelector);

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header header={header} folders={folders} totalPages={totalPages} settings={settings} />

      <div
        className={
          contentClass ||
          'w-full flex justify-between flex-col flex-grow mx-auto pt-6 px-4 max-w-full'
        }
      >
        {children}
      </div>
    </div>
  );
};
