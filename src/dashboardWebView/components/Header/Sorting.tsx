import { Messenger } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ExtensionState } from '../../../constants';
import { SortOrder, SortType } from '../../../models';
import { SortOption } from '../../constants/SortOption';
import { DashboardMessage } from '../../DashboardMessage';
import { SortingOption } from '../../models/SortingOption';
import { SearchSelector, SettingsSelector, SortingAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface ISortingProps {}

export const sortOptions: SortingOption[] = [
  { name: "Last modified", id: SortOption.LastModified, order: SortOrder.desc, type: SortType.string },
  { name: "By filename (asc)", id: SortOption.FileNameAsc, order: SortOrder.asc, type: SortType.string },
  { name: "By filename (desc)", id: SortOption.FileNameDesc, order: SortOrder.desc, type: SortType.string },
];

export const Sorting: React.FunctionComponent<ISortingProps> = ({}: React.PropsWithChildren<ISortingProps>) => {
  const [ crntSorting, setCrntSorting ] = useRecoilState(SortingAtom);
  const searchValue = useRecoilValue(SearchSelector);
  const settings = useRecoilValue(SettingsSelector);

  const updateSorting = (value: SortingOption) => {

    Messenger.send(DashboardMessage.setState, {
      key: ExtensionState.Dashboard.Sorting,
      value: value
    })

    setCrntSorting(value)
  };

  let allOptions = [...sortOptions];
  if (settings?.customSorting) {
    allOptions = [...allOptions, ...settings.customSorting.map((s) => ({ 
      title: s.title || s.name, 
      name: s.name, 
      id: `${s.name}-${s.order}`, 
      order: s.order, 
      type: s.type 
    }))];
  }

  let crntSort = allOptions.find(x => x.id === crntSorting?.id) || sortOptions[0];

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Sort by`} title={crntSort?.title || crntSort?.name || ""} disabled={!!searchValue} />

        <MenuItems>
          {allOptions.map((option) => (
            <MenuItem 
              key={option.id}
              title={option.title || option.name}
              value={option}
              isCurrent={option.id === crntSorting?.id}
              onClick={(value) => updateSorting(value)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};