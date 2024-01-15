import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ITagProps {
  className: string;
  value: string;
  title: string;

  disableConfigurable?: boolean;

  onCreate?: (tags: string) => void;
  onRemove: (tags: string) => void;
}

const Tag: React.FunctionComponent<ITagProps> = (props: React.PropsWithChildren<ITagProps>) => {
  const { value, title, onRemove, onCreate, disableConfigurable } = props;

  return (
    <>
      <div className={`tag`}>
        {!disableConfigurable && onCreate && (
          <button
            className={`tag__create`}
            title={l10n.t(LocalizationKey.panelTagAdd, value)}
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
