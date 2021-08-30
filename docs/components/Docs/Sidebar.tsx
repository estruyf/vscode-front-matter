import * as React from 'react';
import { PageFrontMatter } from '../../models/PageFrontMatter';
import { Link } from '../Link/Link';
import { Section } from '../Link/Section';

export interface ISidebarProps {
  items: PageFrontMatter[];
}

export const Sidebar: React.FunctionComponent<ISidebarProps> = ({ items }: React.PropsWithChildren<ISidebarProps>) => {
  
  const sorted = items?.sort((a, b) => { return (a.weight || 99) - (b.weight || 99); }) || [];

  const getLinks = (item: PageFrontMatter) => {
    const { content } = item;
    const links = Array.from(content.matchAll(/^## (.*$)/gim));

    if (!links || links.length === 0) {
      return null;
    }

    return (
      <ul className={`mt-2 space-y-2`}>
        {links.map((link, index) => (
          <li key={index}>
            <Link title={link[1]} link={`/docs/${item.slug}#${link[1].toLowerCase().replace(/\s/g, '-')}`} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <nav role={`navigation`} className={`space-y-8`}>
      {sorted.map((item, index) => {
        return (
          <div key={index}>
            <Section title={item.title} link={`/docs/${item.slug !== "index" ? item.slug : ''}`} />

            {getLinks(item)}
          </div>
        );
      })}
    </nav>
  );
};