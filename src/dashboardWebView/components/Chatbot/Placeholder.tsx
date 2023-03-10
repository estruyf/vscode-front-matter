import * as React from 'react';
import { ChatIcon } from '../../../components/icons/ChatIcon';

export interface IPlaceholderProps { }

export const Placeholder: React.FunctionComponent<IPlaceholderProps> = ({
  children,
}: React.PropsWithChildren<IPlaceholderProps>) => {
  return (
    <div className='w-full h-full flex flex-col gap-2 items-center justify-center text-[var(--frontmatter-secondary-text)] opacity-80'>
      <ChatIcon className='h-16 w-16 text-[var(--vscode-sideBarTitle-foreground)]' />

      <div className='text-[var(--vscode-sideBarTitle-foreground)] text-2xl mt-4'>
        {children}
      </div>
    </div>
  );
};