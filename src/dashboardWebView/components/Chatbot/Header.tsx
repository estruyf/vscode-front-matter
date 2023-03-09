import * as React from 'react';
import { ChatIcon } from '../../../components/icons/ChatIcon';

export interface IHeaderProps { }

export const Header: React.FunctionComponent<IHeaderProps> = (props: React.PropsWithChildren<IHeaderProps>) => {
  return (
    <header className={`w-full max-w-xl m-4 px-4`}>
      <h1 className='text-2xl flex items-center space-x-4'>
        <ChatIcon className='h-6 w-6' />
        <span>Ask Front Matter AI</span>
      </h1>
      <h2
        className='mt-2 text-sm text-[var(--frontmatter-secondary-text)]'
        style={{
          fontFamily: "var(--vscode-editor-font-family)",
        }}
      >
        Our AI, powered by <a className={`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`} href={`https://www.mendable.ai/`} title={`mendable.ai`}>mendable.ai</a>, has processed the documentation and can assist you with any queries regarding Front Matter. Go ahead and ask away!
      </h2>
    </header>
  );
};