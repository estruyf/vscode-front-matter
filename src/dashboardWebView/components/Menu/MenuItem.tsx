import { Menu } from '@headlessui/react';
import * as React from 'react';
import { DropdownMenuItem } from '../../../components/shadcn/Dropdown';

export interface IMenuItemProps {
  title: JSX.Element | string;
  value?: any;
  isCurrent?: boolean;
  disabled?: boolean;
  onClick: (value: any, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const MenuItem: React.FunctionComponent<IMenuItemProps> = ({
  title,
  value,
  isCurrent,
  disabled,
  onClick
}: React.PropsWithChildren<IMenuItemProps>) => {
  return (
    <DropdownMenuItem
      className={`${!isCurrent ? `font-normal` : `font-bold`}`}
      disabled={disabled}
      onClick={(e) => onClick(value, e)}
    >
      {title}
    </DropdownMenuItem>
  );
};
