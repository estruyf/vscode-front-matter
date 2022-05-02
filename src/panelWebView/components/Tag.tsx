import { PlusIcon, XIcon } from '@heroicons/react/outline';
import * as React from 'react';

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
    <>
      <div className={`tag`}>
        { 
          !disableConfigurable && onCreate && (
            <button 
              className={`tag__create`}
              title={`Add ${value} to your settings`} 
              onClick={() => onCreate(value)}>
              <PlusIcon style={{ width: `1rem`, height: `1rem` }} />
            </button>
          ) 
        }
        
        <div className={`tag__value`}>{value}</div>

        <button 
          title={title} 
          className={`tag__delete`} 
          onClick={() => onRemove(value)}>
          <XIcon style={{ width: `1rem`, height: `1rem` }} />
        </button>
      </div>
    </>
  );
};

Tag.displayName = 'Tag';
export { Tag };