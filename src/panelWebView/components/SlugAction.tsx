import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { ActionButton } from './ActionButton';

export interface ISlugActionProps {}

const SlugAction: React.FunctionComponent<
  ISlugActionProps
> = ({}: React.PropsWithChildren<ISlugActionProps>) => {
  const optimize = () => {
    Messenger.send(CommandToCode.updateSlug);
  };

  return <ActionButton onClick={optimize} title={`Optimize slug`} />;
};

SlugAction.displayName = 'SlugAction';
export { SlugAction };
