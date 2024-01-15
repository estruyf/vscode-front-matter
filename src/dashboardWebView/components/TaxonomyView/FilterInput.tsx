import { FunnelIcon, XCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';

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

        <div className="relative flex justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FunnelIcon className={`h-4 w-4 text-[var(--vscode-input-foreground)]`} aria-hidden="true" />
          </div>

          <input
            type="text"
            name="filter"
            className={`block w-full py-2 pl-10 pr-3 sm:text-sm appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-[var(--vscode-input-border)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent`}
            placeholder={placeholder || ""}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
          />

          {value && (
            <button onClick={onReset} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <XCircleIcon className={`h-5 w-5 text-[var(--vscode-input-foreground)]`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};