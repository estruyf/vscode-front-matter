import * as React from 'react';
import { AddIcon } from './Icons/AddIcon';
import { ArchiveIcon } from './Icons/ArchiveIcon';

export interface ITagProps {
  className: string;
  value: string;
  title: string;

  disableConfigurable?: boolean;

  onCreate?: (tags: string) => void;
  onRemove: (tags: string) => void;
}

const Tag: React.FunctionComponent<ITagProps> = (props: React.PropsWithChildren<ITagProps>) => {
  const { value, className, title, onRemove, onCreate, disableConfigurable } = props;

  return (
    <div className={`article__tags__items__item`}>
      {
        !disableConfigurable && onCreate && 
        <button title={`Add ${value} to your settings`} className={`article__tags__items__item_add`} onClick={() => onCreate(value)}><AddIcon /></button>
      }
      <button title={title} className={`article__tags__items__item_delete ${className}`} onClick={() => onRemove(value)}>{value} <span><ArchiveIcon /></span></button>
    </div>
  );
};

Tag.displayName = 'Tag';
export { Tag };