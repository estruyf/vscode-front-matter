import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback } from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IChatboxProps {
  isLoading: boolean;
  onTrigger: (message: string) => void;
}

export const Chatbox: React.FunctionComponent<IChatboxProps> = ({ isLoading, onTrigger }: React.PropsWithChildren<IChatboxProps>) => {
  const [message, setMessage] = React.useState<string>("");
  const [isFocussed, setIsFocussed] = React.useState<boolean>(false);
  const { getColors } = useThemeColors();

  const callAi = useCallback(() => {
    setTimeout(() => {
      setMessage("")
    }, 0);

    onTrigger(message);
  }, [message]);

  return (
    <footer className={`w-full mt-4 bg-[var(--vscode-input-background)] border-t ${isFocussed ? "border-[var(--vscode-focusBorder)]" : "border-[var(--frontmatter-border)]"}`}>
      <div className={`w-full max-w-xl relative pb-4 mx-auto`}>
        <div className='chatbox px-4'>
          <textarea
            className={`
          resize-none w-full outline-none border-0 pr-8 
          ${getColors(
              'focus:outline-none border-gray-300 text-vulcan-500',
              'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-none focus:border-transparent'
            )}`}
            placeholder={l10n.t(LocalizationKey.dashboardChatbotChatboxPlaceholder)}
            autoFocus={true}
            value={message}
            cols={30}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                callAi();
              }
            }}
            onFocus={() => setIsFocussed(true)}
            onBlur={() => setIsFocussed(false)}
          />

          <button
            className={`absolute right-6 top-3 text-[var(--frontmatter-button-background)] hover:text-[var(--frontmatter-button-hoverBackground)] disabled:opacity-50 disabled:text-[var(--vscode-disabledForeground)]`}
            type='button'
            disabled={message.trim().length === 0 || isLoading}
            onClick={callAi}
          >
            <PaperAirplaneIcon className='h-6 w-6 rotate-90' />
          </button>
        </div>
      </div>
    </footer>
  );
};