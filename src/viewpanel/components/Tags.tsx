import * as React from 'react';
import { Tag } from './Tag';

export interface ITagsProps {
  values: string[];
  options: string[];

  onRemove: (tags: string) => void;
}

export const Tags: React.FunctionComponent<ITagsProps> = (props: React.PropsWithChildren<ITagsProps>) => {
  const { values, options, onRemove } = props;
  
  return (
    <div className={`article__tags__items`}>
      {
        values.map(t => (
          <Tag key={t.replace(/ /g, "_")} value={t} className={`${options.includes(t) ? 'article__tags__items__pill_exists' : 'article__tags__items__pill_notexists'}`} onRemove={onRemove} title={`${options.includes(t) ? `Remove ${t}` : `Be aware, this tag "${t}" is not saved in your settings.`}`} />
        ))
      }
    </div>
  );
};