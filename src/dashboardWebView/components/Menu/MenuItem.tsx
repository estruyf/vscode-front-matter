import { Menu } from '@headlessui/react';
import * as React from 'react';

export interface IMenuItemProps {
  title: JSX.Element | string;
  value?: any;
  isCurrent?: boolean;
  disabled?: boolean;
  onClick: (value: any, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MenuItem: React.FunctionComponent<IMenuItemProps> = ({
  title,
  value,
  isCurrent,
  disabled,
  onClick
}: React.PropsWithChildren<IMenuItemProps>) => {
  return (
    <Menu.Item>
      <button
        disabled={disabled}
        onClick={(e) => onClick(value, e)}
        className={`${!isCurrent ? `font-normal` : `font-bold`
          } block px-4 py-2 text-sm w-full text-left disabled:opacity-50 text-[var(--vscode-editor-foreground)] hover:bg-[var(--vscode-list-hoverBackground)]`}
      >
        {title}
      </button>
    </Menu.Item>
  );
};
