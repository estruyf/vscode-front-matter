import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { Icon } from './Icon';

export interface ITagProps {
  className: string;
  value: string;
  title: string;

  onCreate?: (tags: string) => void;
  onRemove: (tags: string) => void;
}

export const Tag: React.FunctionComponent<ITagProps> = (props: React.PropsWithChildren<ITagProps>) => {
  const { value, className, title, onRemove, onCreate } = props;

  return (
    <div className={`article__tags__items__item`}>
      {
        onCreate && 
        <button title={`Add ${value} to your settings`} className={`article__tags__items__item_add`} onClick={() => onCreate(value)}><Icon name="add" /></button>
      }
      
      <button title={title} className={`article__tags__items__item_delete ${className}`} onClick={() => onRemove(value)}>{value} <Icon name={`archive`} /></button>
    </div>
  );
};