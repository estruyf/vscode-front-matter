import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebounce } from '../../../hooks/useDebounce';
import { SearchAtom, SearchReadyAtom } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { TextField } from '../Common/TextField';

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

  const handleChange = (newValue: string) => {
    setValue(newValue);
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
    <div className="flex justify-end space-x-4 flex-1">
      <div className="min-w-0">
        <label htmlFor="search" className="sr-only">
          {l10n.t(LocalizationKey.commonSearch)}
        </label>

        <TextField
          name='search'
          icon={(
            <MagnifyingGlassIcon className={`h-4 w-4 text-[var(--vscode-input-foreground)]`} aria-hidden="true" />
          )}
          value={value}
          placeholder={placeholder || l10n.t(LocalizationKey.commonSearch)}
          disabled={!searchReady}
          onChange={handleChange}
          onReset={reset}
        />
      </div>
    </div>
  );
};
