import { SearchIcon, XCircleIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebounce } from '../../../hooks/useDebounce';
import { SearchAtom, SearchReadyAtom } from '../../state';
import { RefreshDashboardData } from './RefreshDashboardData';

export interface ISearchboxProps {
  placeholder?: string;
}

export const Searchbox: React.FunctionComponent<ISearchboxProps> = ({
  placeholder
}: React.PropsWithChildren<ISearchboxProps>) => {
  const [value, setValue] = React.useState('');
  const [debounceSearchValue, setDebounceValue] = useRecoilState(SearchAtom);
  const searchReady = useRecoilValue(SearchReadyAtom);
  const debounceSearch = useDebounce<string>(value, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const reset = React.useCallback(() => {
    setValue('');
    setDebounceValue('');
  }, [setValue, setDebounceValue]);

  React.useEffect(() => {
    if (!debounceSearchValue && value) {
      setValue('');
    }
  }, [debounceSearchValue]);

  React.useEffect(() => {
    setDebounceValue(debounceSearch);
  }, [debounceSearch]);

  return (
    <div className="flex space-x-4 flex-1">
      <div className="min-w-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative flex justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>

          <input
            type="text"
            name="search"
            className={`block w-full py-2 pl-10 pr-3 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none appearance-none disabled:opacity-50`}
            placeholder={placeholder || 'Search'}
            value={value}
            onChange={handleChange}
            disabled={!searchReady}
          />

          {value && (
            <button onClick={reset} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <XCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <RefreshDashboardData />
    </div>
  );
};
