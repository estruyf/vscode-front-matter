import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SortOrder, SortType } from '../../../models';
import { SortOption } from '../../constants/SortOption';
import { SearchSelector, SettingsSelector, SortingAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface ISortingProps {}

export const sortOptions: { title?: string; name: string; id: SortOption | string; order: SortOrder, type: SortType; }[] = [
  { name: "Last modified", id: SortOption.LastModified, order: SortOrder.desc, type: SortType.string },
  { name: "By filename (asc)", id: SortOption.FileNameAsc, order: SortOrder.asc, type: SortType.string },
  { name: "By filename (desc)", id: SortOption.FileNameDesc, order: SortOrder.desc, type: SortType.string },
];

export const Sorting: React.FunctionComponent<ISortingProps> = ({}: React.PropsWithChildren<ISortingProps>) => {
  const [ crntSorting, setCrntSorting ] = useRecoilState(SortingAtom);
  const searchValue = useRecoilValue(SearchSelector);
  const settings = useRecoilValue(SettingsSelector);

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

  let crntSort = allOptions.find(x => x.id === crntSorting.id);

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
              isCurrent={option.id === crntSorting.id}
              onClick={(value) => setCrntSorting(value)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};