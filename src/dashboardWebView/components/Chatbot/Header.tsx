import * as React from 'react';
import { ChatIcon } from '../../../components/icons/ChatIcon';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IHeaderProps { }

export const Header: React.FunctionComponent<IHeaderProps> = (props: React.PropsWithChildren<IHeaderProps>) => {
  return (
    <header className={`w-full max-w-xl m-4 px-4`}>
      <h1 className='text-2xl flex items-center space-x-4'>
        <ChatIcon className='h-6 w-6' />
        <span>{l10n.t(LocalizationKey.dashboardChatbotHeaderHeading)}</span>
      </h1>
      <h2
        className='mt-2 text-sm text-[var(--frontmatter-secondary-text)]'
        style={{
          fontFamily: "var(--vscode-editor-font-family)",
        }}
      >
        {l10n.t(LocalizationKey.dashboardChatbotHeaderDescription)}
      </h2>
    </header>
  );
};