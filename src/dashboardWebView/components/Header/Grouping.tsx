import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import { GroupOption } from '../../constants/GroupOption';
import { GroupingAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IGroupingProps { }

export const Grouping: React.FunctionComponent<
  IGroupingProps
> = ({ }: React.PropsWithChildren<IGroupingProps>) => {
  const [group, setGroup] = useRecoilState(GroupingAtom);

  const GROUP_OPTIONS = [
    { name: l10n.t(LocalizationKey.dashboardHeaderGroupingOptionNone), id: GroupOption.none },
    { name: l10n.t(LocalizationKey.dashboardHeaderGroupingOptionYear), id: GroupOption.Year },
    { name: l10n.t(LocalizationKey.dashboardHeaderGroupingOptionDraft), id: GroupOption.Draft }
  ];

  const crntGroup = GROUP_OPTIONS.find((x) => x.id === group);

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={l10n.t(LocalizationKey.dashboardHeaderGroupingMenuButtonLabel)} title={crntGroup?.name || ''} />

        <MenuItems disablePopper>
          {GROUP_OPTIONS.map((option) => (
            <MenuItem
              key={option.id}
              title={option.name}
              value={option.id}
              isCurrent={option.id === crntGroup?.id}
              onClick={(value) => setGroup(value)}
            />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};
