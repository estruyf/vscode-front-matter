import * as React from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { SlugHelper } from '../../helpers/SlugHelper';
import { Slug } from '../../models/PanelSettings';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';

export interface ISlugActionProps {
  value: string;
  crntValue: string;
  slugOpts: Slug;
}

const SlugAction: React.FunctionComponent<ISlugActionProps> = (props: React.PropsWithChildren<ISlugActionProps>) => {
  const { value, crntValue, slugOpts } = props;

  let slug = SlugHelper.createSlug(value);
  slug = `${slugOpts.prefix}${slug}${slugOpts.suffix}`;

  const optimize = () => {
    MessageHelper.sendMessage(CommandToCode.updateSlug);
  };

  return (
    <ActionButton onClick={optimize} disabled={crntValue === slug} title={`Optimize slug`} />
  );
};

SlugAction.displayName = 'SlugAction';
export { SlugAction };