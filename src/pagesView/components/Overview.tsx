import * as React from 'react';
import { Page } from '../models/Page';
import { Item } from './Item';
import { List } from './List';

export interface IOverviewProps {
  pages: Page[];
}

export const Overview: React.FunctionComponent<IOverviewProps> = ({pages}: React.PropsWithChildren<IOverviewProps>) => {

  return (
    <List>
      {pages.map(page => (
        <Item key={page.slug} {...page} />
      ))}
    </List>
  );
};