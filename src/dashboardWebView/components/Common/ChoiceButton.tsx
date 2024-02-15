import { ChevronDownIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { MenuItem } from '../Menu';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';

export interface IChoiceButtonProps {
  title: string;
  choices: {
    icon?: JSX.Element;
    title: string;
    disabled?: boolean;
    onClick: () => void;
  }[];
  disabled?: boolean;
  onClick: () => void;
}

export const ChoiceButton: React.FunctionComponent<IChoiceButtonProps> = ({
  onClick,
  disabled,
  choices,
  title
}: React.PropsWithChildren<IChoiceButtonProps>) => {

  return (
    <span className="relative z-50 inline-flex shadow-sm rounded-md">
      <button
        type="button"
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium ${choices.length > 0 ? `rounded-l` : `rounded`
          } text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
        onClick={onClick}
        disabled={disabled}
      >
        {title}
      </button>


      {choices.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className='h-full inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none  rounded-r text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50'
            disabled={disabled}>
            <span className="sr-only">{l10n.t(LocalizationKey.dashboardCommonChoiceButtonOpen)}</span>
            <ChevronDownIcon className={`h-4 w-4`} aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            {choices.map((choice, idx) => (
              <MenuItem
                key={idx}
                title={
                  choice.icon ? (
                    <div className="flex items-center">
                      {choice.icon}
                      <span>{choice.title}</span>
                    </div>
                  ) : (
                    choice.title
                  )
                }
                value={null}
                onClick={choice.onClick}
                disabled={choice.disabled}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
      }
    </span >
  );
};
