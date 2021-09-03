import { FilterIcon, SearchIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import { useDebounce } from '../../../hooks/useDebounce';
import { SearchAtom } from '../../state';

export interface ISearchboxProps {}

export const Searchbox: React.FunctionComponent<ISearchboxProps> = ({}: React.PropsWithChildren<ISearchboxProps>) => {
  const [ value, setValue ] = React.useState('');
  const [ , setDebounceValue ] = useRecoilState(SearchAtom);
  const debounceSearch = useDebounce<string>(value, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  React.useEffect(() => {
    setDebounceValue(debounceSearch);
  }, [debounceSearch]);

  return (
    <div className="flex space-x-4">
      <div className="flex-1 min-w-0">
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative flex justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search"
            className={`block w-full py-2 pl-10 pr-3 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none`}
            placeholder="Search"
            value={value}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};