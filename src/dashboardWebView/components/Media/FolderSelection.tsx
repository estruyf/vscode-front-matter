import { Menu } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import Downshift from 'downshift';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaFoldersSelector, SelectedMediaFolderAtom } from '../../state';

export interface IFolderSelectionProps {}

export const FolderSelection: React.FunctionComponent<IFolderSelectionProps> = (props: React.PropsWithChildren<IFolderSelectionProps>) => {
  const folders = useRecoilValue(MediaFoldersSelector);
  const [ selectedFolder, setSelectedFolder ] = useRecoilState(SelectedMediaFolderAtom);
  const [ focus, setFocus ] = React.useState(false);

  let allFolders: string[] = Object.assign([], folders);
  allFolders = allFolders.sort((a: string, b: string) => {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });

  return (
    <div>
      <Downshift
        isOpen={focus}
        selectedItem={selectedFolder}
        onOuterClick={() => setFocus(false)}
        onSelect={(selFolder) => {
          setSelectedFolder(selFolder);
          setFocus(false);
        }}>
        {
          ({ 
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            inputValue,
            getRootProps 
          }) => (
            <div className={`relative flex items-center`}>
              <label className={`text-sm text-gray-500 dark:text-whisper-900`}>Filter by: </label>

              <div
                className={`inline-flex items-center`}
                {...getRootProps({} as any, {suppressRefError: true})}
              >
                <input disabled={!!selectedFolder} onFocus={() => setFocus(true)} className={`ml-2 py-1 px-2 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none`} {...getInputProps()} />

                {
                  selectedFolder && (
                    <button title={`Clear`} onClick={() => setSelectedFolder(null)}><XIcon className={`ml-2 h-6 w-6 text-red-500 hover:text-red-800`} /></button>
                  )
                }
              </div>

              <div className={`${focus ? `block` : `hidden`} top-8 absolute right-0 z-10 mt-2 w-min rounded-md shadow-2xl bg-white dark:bg-vulcan-500 ring-1 ring-vulcan-400 dark:ring-white ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto`} {...getMenuProps()}>
                {isOpen
                  ? allFolders
                      .filter((item: string) => !inputValue || item.includes(inputValue))
                      .map((item, index) => (
                        <div
                          className="cursor-pointer text-gray-500 dark:text-whisper-900 block px-4 py-2 text-sm font-medium w-full text-left hover:bg-gray-100 hover:text-gray-700 dark:hover:text-whisper-600 dark:hover:bg-vulcan-100"
                          {...getItemProps({ key: item, index, item })}
                        >
                          {item}
                        </div>
                      ))
                  : null}
              </div>
            </div>
          )
        }
      </Downshift>
    </div>
  );
};