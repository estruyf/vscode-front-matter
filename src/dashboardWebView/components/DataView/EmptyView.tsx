import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey, localize } from '../../../localization';
import { DataFolder } from '../../../models';
import { DropdownMenu, DropdownMenuContent } from '../../../components/shadcn/Dropdown';
import { MenuButton, MenuItem } from '../Menu';

export interface IEmptyViewProps {
  folders: DataFolder[];
  onCreate: (folder: DataFolder) => void;
}

export const EmptyView: React.FunctionComponent<IEmptyViewProps> = (
  { folders, onCreate }: React.PropsWithChildren<IEmptyViewProps>
) => {

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-2">
      <ExclamationCircleIcon className={`w-1/12 opacity-90 text-[var(--frontmatter-secondary-text)]`} />
      <h2 className={`text-xl text-[var(--frontmatter-secondary-text)]`}>
        {
          (folders && folders.length > 0) ?
            localize(LocalizationKey.dashboardDataViewEmptyViewHeadingCreate) :
            l10n.t(LocalizationKey.dashboardDataViewEmptyViewHeading)
        }
      </h2>

      {
        onCreate && folders && folders.length > 0 && (
          <div className=''>
            <DropdownMenu>
              <MenuButton
                label={localize(LocalizationKey.dashboardDataViewDataViewCreateNew)}
                title={localize(LocalizationKey.dashboardDataViewDataViewSelectDataFolder)}
                className={`text-lg`}
                labelClass={`font-normal text-[var(--frontmatter-secondary-text)]`}
              />

              <DropdownMenuContent>
                {folders.map((folder) => (
                  <MenuItem
                    key={folder.id}
                    title={folder.id}
                    value={folder}
                    onClick={() => onCreate(folder)}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    </div>
  );
};
