import * as React from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';

export interface ISlugActionProps {}

const SlugAction: React.FunctionComponent<ISlugActionProps> = ({}: React.PropsWithChildren<ISlugActionProps>) => {

  const optimize = () => {
    MessageHelper.sendMessage(CommandToCode.updateSlug);
  };

  return (
    <ActionButton onClick={optimize} title={`Optimize slug`} />
  );
};

SlugAction.displayName = 'SlugAction';
export { SlugAction };