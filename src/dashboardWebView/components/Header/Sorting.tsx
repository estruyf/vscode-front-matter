import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SortOption } from '../../constants/SortOption';
import { SearchSelector, SortingAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface ISortingProps {}

export const sortOptions = [
  { name: "Last modified", id: SortOption.LastModified },
  { name: "By filename (asc)", id: SortOption.FileNameAsc },
  { name: "By filename (desc)", id: SortOption.FileNameDesc },
];

export const Sorting: React.FunctionComponent<ISortingProps> = ({}: React.PropsWithChildren<ISortingProps>) => {
  const [ crntSorting, setCrntSorting ] = useRecoilState(SortingAtom);
  const searchValue = useRecoilValue(SearchSelector);

  const crntSort = sortOptions.find(x => x.id === crntSorting);

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Sort by`} title={crntSort?.name || ""} disabled={!!searchValue} />

        <MenuItems>
          {sortOptions.map((option) => (
            <MenuItem 
              key={option.id}
              title={option.name}
              value={option.id}
              isCurrent={option.id === crntSorting}
              onClick={(value) => setCrntSorting(value)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};