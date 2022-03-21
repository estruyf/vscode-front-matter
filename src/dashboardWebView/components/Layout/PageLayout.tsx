import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';

export interface IPageLayoutProps {
  header?: React.ReactNode;
  folders?: string[] | undefined
  totalPages?: number | undefined
}

export const PageLayout: React.FunctionComponent<IPageLayoutProps> = ({ header, folders, totalPages, children }: React.PropsWithChildren<IPageLayoutProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header 
        header={header}
        folders={folders}
        totalPages={totalPages}
        settings={settings} />

      <div className="w-full flex justify-between flex-col flex-grow max-w-7xl mx-auto pt-6 px-4">
        { children }
      </div>
    </div>
  );
};