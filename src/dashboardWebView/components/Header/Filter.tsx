import * as React from 'react';
import { MenuButton, MenuItem } from '../Menu';
import * as l10n from '@vscode/l10n';
import { FunnelIcon } from '@heroicons/react/24/solid';
import { LocalizationKey } from '../../../localization';
import { DropdownMenu, DropdownMenuContent } from '../../../components/shadcn/Dropdown';

export interface IFilterProps {
  label: string;
  items: string[];
  activeItem: string | null;
  onClick: (item: string | null) => void;
}

export const Filter: React.FunctionComponent<IFilterProps> = ({
  label,
  activeItem,
  items,
  onClick
}: React.PropsWithChildren<IFilterProps>) => {
  const DEFAULT_VALUE = l10n.t(LocalizationKey.dashboardHeaderFilterDefault);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <MenuButton
        label={
          <>
            <FunnelIcon className={`inline-block w-4 h-4 mr-2`} />
            <span>{label}</span>
          </>
        }
        title={activeItem || DEFAULT_VALUE}
      />

      <DropdownMenuContent>
        <MenuItem
          title={DEFAULT_VALUE}
          value={null}
          isCurrent={!!activeItem}
          onClick={() => onClick(null)}
        />

        {items.map((option) => (
          <MenuItem
            key={option}
            title={option}
            value={option}
            isCurrent={option === activeItem}
            onClick={() => onClick(option)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
