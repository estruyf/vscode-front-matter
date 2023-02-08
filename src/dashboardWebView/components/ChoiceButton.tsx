import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../hooks/useThemeColors';
import { MenuItem, MenuItems } from './Menu';

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
  const { getColors } = useThemeColors();

  return (
    <span className="relative z-50 inline-flex shadow-sm rounded-md">
      <button
        type="button"
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium ${choices.length > 0 ? `rounded-l` : `rounded`
          } ${getColors(
            `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`,
            `text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
          )
          }`}
        onClick={onClick}
        disabled={disabled}
      >
        {title}
      </button>

      {choices.length > 0 && (
        <Menu as="span" className="-ml-px relative block">
          <Menu.Button
            className={`h-full inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none  rounded-r ${getColors(
              `text-white dark:text-vulcan-500 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-500`,
              `text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
            )
              }`}
            disabled={disabled}
          >
            <span className="sr-only">Open options</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>

          <MenuItems widthClass={`w-56`} disablePopper>
            <div className="py-1">
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
            </div>
          </MenuItems>
        </Menu>
      )}
    </span>
  );
};
