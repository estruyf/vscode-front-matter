import * as React from 'react';
import { FrontMatterIcon } from '../../viewpanel/components/Icons/FrontMatterIcon';
import { Page } from '../models/Page';
import { Settings } from '../models/Settings';
import { Item } from './Item';
import { List } from './List';

export interface IOverviewProps {
  pages: Page[];
  
  settings: Settings;
}

export const Overview: React.FunctionComponent<IOverviewProps> = ({pages, settings}: React.PropsWithChildren<IOverviewProps>) => {

  if (!pages || !pages.length) {
    return (
      <div className={`flex items-center justify-center h-full`}>
        <div className={`max-w-xl text-center`}>
          <FrontMatterIcon className={`text-vulcan-300 dark:text-whisper-800 h-32 mx-auto opacity-90 mb-8`} />
          {
            settings?.folders?.length > 0 ? (
              <p className={`text-xl font-medium`}>No Markdown to show</p>
            ) : (
              <>
                <p className={`text-lg font-medium`}>Make sure you registered a content folder in your project to let Front Matter find the contents.</p>
              </>
            )
          }
        </div>
      </div>
    );
  }

  return (
    <List>
      {pages.map(page => (
        <Item key={page.slug} {...page} />
      ))}
    </List>
  );
};