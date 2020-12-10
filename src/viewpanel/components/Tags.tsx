import * as React from 'react';
import { Tag } from './Tag';
import { KeyValue } from './TagPicker';

export interface ITagsProps {
  values: string[];
  options: KeyValue[];

  onCreate: (tags: string) => void;
  onRemove: (tags: string) => void;
}

export const Tags: React.FunctionComponent<ITagsProps> = (props: React.PropsWithChildren<ITagsProps>) => {
  const { values, options, onCreate, onRemove } = props;

  const knownTags = values.filter(v => options.map(o => o.value).includes(v));
  const unknownTags = values.filter(v => !options.map(o => o.value).includes(v));
  
  return (
    <div className={`article__tags__items`}>
      {
        knownTags.map(t => (
          <Tag key={t.replace(/ /g, "_")} value={t} className={`article__tags__items__pill_exists`} onRemove={onRemove} title={`Remove ${t}`} />
        ))
      }
      {
        unknownTags.map(t => (
          <Tag key={t.replace(/ /g, "_")} value={t} className={`article__tags__items__pill_notexists`} onRemove={onRemove} onCreate={onCreate} title={`Be aware, this tag "${t}" is not saved in your settings. Once removed, it will be gone forever.`} />
        ))
      }
    </div>
  );
};