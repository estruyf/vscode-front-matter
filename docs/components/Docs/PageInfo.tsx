import { format, parseJSON } from 'date-fns';
import * as React from 'react';
import { Extension } from '../../constants/extension';
import { PageFrontMatter } from '../../models/PageFrontMatter';

export interface IPageInfoProps {
  page: PageFrontMatter | undefined;
}

export const PageInfo: React.FunctionComponent<IPageInfoProps> = ({page}: React.PropsWithChildren<IPageInfoProps>) => {

  if (!page) {
    return null;
  }

  const date = parseJSON(page.lastmod);

  return (
    <div className={`mt-16`}>
      {
        date && (
          <div className="text-base">
            <span>Last updated on</span>{` `}<span><time dateTime={format(date, 'yyyy-MM-dd')}>{format(date, `MMM dd, yyyy`)}</time></span>
          </div>
        )
      }

      <div className="mt-2 text-sm">
        <p>Did you spot an issue in our documentation, or want to contribute? Edit this page on <a className={`text-teal-500 hover:text-teal-900`} href={`${Extension.githubLink}/edit/main/docs/content/docs/${page.fileName}.md`} target="_blank" rel={`noopener noreferrer`}>Github</a>!</p>
      </div>
    </div>
  );
};