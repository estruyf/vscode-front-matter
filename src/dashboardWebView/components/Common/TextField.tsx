import { XCircleIcon } from '@heroicons/react/24/solid';
import * as React from 'react';

export interface ITextFieldProps {
  name: string;
  value?: string;
  placeholder?: string;
  icon?: JSX.Element;
  disabled?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
  onReset?: () => void;
}

export const TextField: React.FunctionComponent<ITextFieldProps> = ({
  name,
  value,
  placeholder,
  icon,
  autoFocus,
  multiline,
  rows,
  disabled,
  onChange,
  onReset
}: React.PropsWithChildren<ITextFieldProps>) => {
  return (
    <div className="relative flex justify-center">
      {
        icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )
      }

      {
        multiline ? (
          <textarea
            rows={rows || 3}
            name={name}
            className={`block w-full py-2 ${icon ? "pl-10" : "pl-2"} pr-2 sm:text-sm appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] border-[var(--frontmatter-border)] focus:border-[var(--vscode-focusBorder)] focus:outline-0`}
            style={{
              boxShadow: "none"
            }}
            placeholder={placeholder || ""}
            value={value}
            autoFocus={!!autoFocus}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={!!disabled}
          />
        ) : (
          <input
            type="text"
            name={name}
            className={`block w-full py-2 ${icon ? "pl-10" : "pl-2"} pr-2 sm:text-sm appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] border-[var(--frontmatter-border)] focus:border-[var(--vscode-focusBorder)] focus:outline-0`}
            style={{
              boxShadow: "none"
            }}
            placeholder={placeholder || ""}
            value={value}
            autoFocus={!!autoFocus}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={!!disabled}
          />
        )
      }

      {(value && onReset) && (
        <button onClick={onReset} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--vscode-input-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]">
          <XCircleIcon className={`h-5 w-5`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};