import { FunnelIcon, XCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { TextField } from '../Common/TextField';

export interface IFilterInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onReset?: () => void;
}

export const FilterInput: React.FunctionComponent<IFilterInputProps> = ({
  label,
  placeholder,
  value,
  disabled,
  onChange,
  onReset,
}: React.PropsWithChildren<IFilterInputProps>) => {
  return (
    <div className="flex space-x-4 flex-1">
      <div className="min-w-0">
        {
          label && (
            <label htmlFor="filter" className="sr-only">
              {label}
            </label>
          )
        }

        <TextField
          name='filter'
          icon={(
            <FunnelIcon className={`h-4 w-4 text-[var(--vscode-input-foreground)]`} aria-hidden="true" />
          )}
          value={value}
          placeholder={placeholder || ""}
          disabled={disabled}
          onChange={onChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
};