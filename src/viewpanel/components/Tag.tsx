import * as React from 'react';

export interface ITagProps {
  className: string;
  value: string;
  title: string;

  onRemove: (tags: string) => void;
}

export const Tag: React.FunctionComponent<ITagProps> = (props: React.PropsWithChildren<ITagProps>) => {
  const { value, className, title, onRemove } = props;

  return (
    <button title={title} className={`article__tags__items__btn ${className}`} onClick={() => onRemove(value)}>{value} <span>x</span></button>
  );
};