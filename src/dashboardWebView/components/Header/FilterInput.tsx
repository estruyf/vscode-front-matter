import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { TextField } from '../Common/TextField';

export interface IFilterInputProps {
  placeholder: string;
  value: string;
  isReady: boolean;
  autoFocus: boolean;
  onReset?: () => void;
  onChange: (value: string) => void;
}

export const FilterInput: React.FunctionComponent<IFilterInputProps> = ({
  placeholder,
  value,
  isReady,
  autoFocus,
  onReset,
  onChange
}: React.PropsWithChildren<IFilterInputProps>) => {

  return (
    <div className="flex space-x-4 flex-1">
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
          autoFocus={autoFocus}
          placeholder={placeholder || l10n.t(LocalizationKey.commonSearch)}
          disabled={!isReady}
          onChange={onChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
};
