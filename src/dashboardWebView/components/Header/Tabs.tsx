import { CodeIcon, DatabaseIcon, PhotographIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { NavigationType } from '../../models';
import { SettingsSelector } from '../../state';
import { Tab } from './Tab';

export interface ITabsProps {
  onNavigate: (navigationType: NavigationType) => void;
}

export const Tabs: React.FunctionComponent<ITabsProps> = ({ onNavigate }: React.PropsWithChildren<ITabsProps>) => {
  const settings = useRecoilValue(SettingsSelector);

  return (
    <ul className="flex items-center justify-start h-full" data-tabs-toggle="#myTabContent" role="tablist">
      <li className="mr-2" role="presentation">
        <Tab
          navigationType={NavigationType.Contents} 
          onNavigate={onNavigate}>
          <MarkdownIcon className={`h-6 w-auto mr-2`} /><span>Contents</span>
        </Tab>
      </li>
      <li className="mr-2" role="presentation">
        <Tab
          navigationType={NavigationType.Media} 
          onNavigate={onNavigate}>
          <PhotographIcon className={`h-6 w-auto mr-2`} /><span>Media</span>
        </Tab>
      </li>
      <li className="mr-2" role="presentation">
        <Tab
          navigationType={NavigationType.Snippets} 
          onNavigate={onNavigate}>
          <CodeIcon className={`h-6 w-auto mr-2`} /><span>Snippets</span>
        </Tab>
      </li>
      {
        (settings?.dataFiles && settings.dataFiles.length > 0) && (
          <li className="mr-2" role="presentation">
            <Tab
              navigationType={NavigationType.Data} 
              onNavigate={onNavigate}>
              <DatabaseIcon className={`h-6 w-auto mr-2`} /><span>Data</span>
            </Tab>
          </li>
        )
      }
    </ul>
  );
};