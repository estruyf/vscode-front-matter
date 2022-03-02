import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';

export interface IPageLayoutProps {
  folders?: string[] | undefined
  totalPages?: number | undefined
}

export const PageLayout: React.FunctionComponent<IPageLayoutProps> = ({ folders, totalPages, children }: React.PropsWithChildren<IPageLayoutProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header 
        folders={folders}
        totalPages={totalPages}
        settings={settings} />

      <div className="w-full flex-grow max-w-7xl mx-auto py-6 px-4">
        { children }
      </div>
    </div>
  );
};