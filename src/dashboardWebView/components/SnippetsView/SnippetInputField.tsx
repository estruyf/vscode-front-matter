import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Choice, SnippetField } from '../../../models';
import useThemeColors from '../../hooks/useThemeColors';

export interface ISnippetInputFieldProps {
  field: SnippetField;
  onValueChange: (field: SnippetField, value: string) => void;
}

export const SnippetInputField: React.FunctionComponent<ISnippetInputFieldProps> = ({
  field,
  onValueChange
}: React.PropsWithChildren<ISnippetInputFieldProps>) => {
  const { getColors } = useThemeColors();
  
  if (field.type === 'choice') {
    return (
      <div className="relative">
        <select
          name={field.name}
          value={field.value || ''}
          className={`block w-full sm:text-sm ${
            getColors(
              'focus:outline-none border-gray-300 text-vulcan-500',
              'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
            )
          }`}
          onChange={(e) => onValueChange(field, e.target.value)}
        >
          {(field.choices || [])?.map((option: string | Choice, index: number) =>
            typeof option === 'string' ? (
              <option key={index} value={option}>
                {option}
              </option>
            ) : (
              <option key={index} value={option.id}>
                {option.title}
              </option>
            )
          )}
        </select>

        <ChevronDownIcon className="absolute top-3 right-2 w-4 h-4 text-gray-500" />
      </div>
    );
  }

  if (field.type === 'string' && !field.single) {
    return (
      <textarea
        name={field.name}
        value={field.value || ''}
        className={`block w-full sm:text-sm h-auto ${
          getColors(
            'focus:outline-none border-gray-300 text-vulcan-500',
            'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
          )
        }`}
        onChange={(e) => onValueChange(field, e.currentTarget.value)}
        rows={4}
      />
    );
  }

  return (
    <input
      type="text"
      name={field.name}
      value={field.value || ''}
      className={`block w-full sm:text-sm ${
        getColors(
          'focus:outline-none border-gray-300 text-vulcan-500',
          'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
        )
      }`}
      onChange={(e) => onValueChange(field, e.currentTarget.value)}
    />
  );
};
