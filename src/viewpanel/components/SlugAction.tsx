import * as React from 'react';
import { SlugHelper } from '../../helpers/SlugHelper';
import { Slug } from '../../models/PanelSettings';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';

export interface ISlugActionProps {
  value: string;
  crntValue: string;
  slugOpts: Slug;
}

export const SlugAction: React.FunctionComponent<ISlugActionProps> = (props: React.PropsWithChildren<ISlugActionProps>) => {
  const { value, crntValue, slugOpts } = props;

  let slug = SlugHelper.createSlug(value);
  slug = `${slugOpts.prefix}${slug}${slugOpts.suffix}`;

  const optimize = () => {
    MessageHelper.sendMessage(CommandToCode.updateSlug);
  };

  return (
    <div className={`article__action`}>
      <button onClick={optimize} disabled={crntValue === slug}>Optimize slug</button>
    </div>
  );
};