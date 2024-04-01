import * as React from 'react';
import { Tag } from './Tag';

export interface ITagsProps {
  values?: string[];
  tagField?: string | null | undefined;
}

export const Tags: React.FunctionComponent<ITagsProps> = ({
  values,
  tagField
}: React.PropsWithChildren<ITagsProps>) => {
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {values.map(
        (tag, index) => tag && (
          <Tag
            key={index}
            value={tag}
            tagField={tagField} />
        )
      )}
    </div>
  );
};