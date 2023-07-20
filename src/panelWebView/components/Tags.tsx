import * as React from 'react';
import { Tag } from './Tag';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ITagsProps {
  values: string[];
  options: string[];

  disableConfigurable?: boolean;

  onCreate: (tags: string) => void;
  onRemove: (tags: string) => void;
}

const Tags: React.FunctionComponent<ITagsProps> = (props: React.PropsWithChildren<ITagsProps>) => {
  const { values, options, onCreate, onRemove, disableConfigurable } = props;

  const knownTags = values.filter((v) => options.includes(v));
  const unknownTags = values.filter((v) => !options.includes(v));

  const generateKey = (tag: string, idx: number) => {
    if (tag && typeof tag === 'string') {
      return `${tag.replace(/ /g, '_')}-${idx}`;
    }
    return `tag-${idx}`;
  };

  return (
    <div className={`article__tags__items`}>
      {knownTags.map((t, idx) => (
        <Tag
          key={generateKey(t, idx)}
          value={t}
          className={`article__tags__items__pill_exists`}
          onRemove={onRemove}
          title={l10n.t(LocalizationKey.commonRemoveValue, t)}
        />
      ))}
      {unknownTags.map((t, idx) => (
        <Tag
          key={generateKey(t, idx)}
          value={t}
          className={`article__tags__items__pill_notexists`}
          onRemove={onRemove}
          onCreate={onCreate}
          title={l10n.t(LocalizationKey.panelTagsTagWarning, t)}
          disableConfigurable={disableConfigurable}
        />
      ))}
    </div>
  );
};

Tags.displayName = 'Tags';
export { Tags };
