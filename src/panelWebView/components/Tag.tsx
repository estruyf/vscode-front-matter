import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { LocalizationKey, localize } from '../../localization';

export interface ITagProps {
  className: string;
  value: string;
  title: string;

  disableConfigurable?: boolean;

  onCreate?: (tags: string) => void;
  onRemove: (tags: string) => void;
}

const Tag: React.FunctionComponent<ITagProps> = ({ value, title, onRemove, onCreate, disableConfigurable, className }: React.PropsWithChildren<ITagProps>) => {
  return (
    <>
      <div className={`tag ${className || ""}`}>
        {!disableConfigurable && onCreate && (
          <button
            className={`tag__create`}
            title={localize(LocalizationKey.panelTagAdd, value)}
            type={`button`}
            onClick={() => onCreate(value)}
          >
            <PlusIcon style={{ width: `1rem`, height: `1rem` }} />
          </button>
        )}

        <div className={`tag__value`}>{value}</div>

        <button
          title={title}
          className={`tag__delete`}
          type={`button`}
          onClick={() => onRemove(value)}>
          <XMarkIcon style={{ width: `1rem`, height: `1rem` }} />
        </button>
      </div>
    </>
  );
};

Tag.displayName = 'Tag';
export { Tag };
