import { Messenger } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ExtensionState } from '../../../constants';
import { SortOrder, SortType } from '../../../models';
import { SortOption } from '../../constants/SortOption';
import { DashboardMessage } from '../../DashboardMessage';
import { NavigationType } from '../../models';
import { SortingOption } from '../../models/SortingOption';
import { SearchSelector, SettingsSelector, SortingAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';
import { Sorting as SortingHelpers } from '../../../helpers/Sorting';

export interface ISortingProps {
  disableCustomSorting?: boolean;
  view: NavigationType;
}

export const sortOptions: SortingOption[] = [
  {
    name: 'Last modified (asc)',
    id: SortOption.LastModifiedAsc,
    order: SortOrder.asc,
    type: SortType.date
  },
  {
    name: 'Last modified (desc)',
    id: SortOption.LastModifiedDesc,
    order: SortOrder.desc,
    type: SortType.date
  },
  {
    name: 'By filename (asc)',
    id: SortOption.FileNameAsc,
    order: SortOrder.asc,
    type: SortType.string
  },
  {
    name: 'By filename (desc)',
    id: SortOption.FileNameDesc,
    order: SortOrder.desc,
    type: SortType.string
  }
];

const contentSortOptions: SortingOption[] = [
  {
    name: 'Published (asc)',
    id: SortOption.PublishedAsc,
    order: SortOrder.asc,
    type: SortType.date
  },
  {
    name: 'Published (desc)',
    id: SortOption.PublishedDesc,
    order: SortOrder.desc,
    type: SortType.date
  }
];

const mediaSortOptions: SortingOption[] = [
  {
    name: 'Size (asc)',
    id: SortOption.SizeAsc,
    order: SortOrder.asc,
    type: SortType.number
  },
  {
    name: 'Size (desc)',
    id: SortOption.SizeDesc,
    order: SortOrder.desc,
    type: SortType.number
  },
  {
    name: 'Caption (asc)',
    id: SortOption.CaptionAsc,
    order: SortOrder.asc,
    type: SortType.string
  },
  {
    name: 'Caption (desc)',
    id: SortOption.CaptionDesc,
    order: SortOrder.desc,
    type: SortType.string
  },
  {
    name: 'Alt (asc)',
    id: SortOption.AltAsc,
    order: SortOrder.asc,
    type: SortType.string
  },
  {
    name: 'Alt (desc)',
    id: SortOption.AltDesc,
    order: SortOrder.desc,
    type: SortType.string
  }
];

export const Sorting: React.FunctionComponent<ISortingProps> = ({
  disableCustomSorting,
  view
}: React.PropsWithChildren<ISortingProps>) => {
  const [crntSorting, setCrntSorting] = useRecoilState(SortingAtom);
  const searchValue = useRecoilValue(SearchSelector);
  const settings = useRecoilValue(SettingsSelector);

  const updateSorting = (value: SortingOption) => {
    Messenger.send(DashboardMessage.setState, {
      key: `${
        view === NavigationType.Contents
          ? ExtensionState.Dashboard.Contents.Sorting
          : ExtensionState.Dashboard.Media.Sorting
      }`,
      value: value
    });

    setCrntSorting(value);
  };

  let allOptions = [...sortOptions];

  if (view === NavigationType.Media) {
    allOptions = [...allOptions, ...mediaSortOptions];
  } else if (view === NavigationType.Contents) {
    allOptions = [...contentSortOptions, ...allOptions];
  }

  allOptions = allOptions.sort(SortingHelpers.alphabetically('name'));

  if (settings?.customSorting && !disableCustomSorting) {
    allOptions = [
      ...allOptions,
      ...settings.customSorting.map((s) => ({
        title: s.title || s.name,
        name: s.name,
        id: s.id || `${s.name}-${s.order}`,
        order: s.order,
        type: s.type
      }))
    ];
  }

  let crntSortingOption = crntSorting;
  if (!crntSortingOption) {
    if (view === NavigationType.Contents) {
      crntSortingOption = settings?.dashboardState?.contents?.sorting || null;
    } else if (view === NavigationType.Media) {
      crntSortingOption = settings?.dashboardState?.media?.sorting || null;
    }

    if (crntSortingOption === null) {
      if (view === NavigationType.Contents && settings?.dashboardState.contents.defaultSorting) {
        crntSortingOption =
          allOptions.find((f) => f.id === settings?.dashboardState.contents.defaultSorting) || null;
      } else if (
        view === NavigationType.Media &&
        settings?.dashboardState.contents.defaultSorting
      ) {
        crntSortingOption =
          allOptions.find((f) => f.id === settings?.dashboardState.contents.defaultSorting) || null;
      }
    }
  }

  let crntSort = allOptions.find((x) => x.id === crntSortingOption?.id) || sortOptions[0];

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton
          label={`Sort by`}
          title={crntSort?.title || crntSort?.name || ''}
          disabled={!!searchValue}
        />

        <MenuItems widthClass="w-48" disablePopper>
          {allOptions.map((option) => (
            <MenuItem
              key={option.id}
              title={option.title || option.name}
              value={option}
              isCurrent={option.id === crntSort.id}
              onClick={(value) => updateSorting(value)}
            />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};
