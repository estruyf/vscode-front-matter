import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface ISnippetInputProps {
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
}

export const SnippetInput: React.FunctionComponent<ISnippetInputProps> = ({ name, value, placeholder, isTextArea, onChange }: React.PropsWithChildren<ISnippetInputProps>) => {
  const { getColors } = useThemeColors();

  if (isTextArea) {
    return (
      <textarea
        name={name}
        value={value || ''}
        placeholder={placeholder}
        rows={5}
        className={`block w-full sm:text-sm ${
          getColors(
            'focus:outline-none border-gray-300 text-vulcan-500',
            'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
          )
        }`}
        onChange={onChange}
      />
    )
  }

  return (
    <input
      type="text"
      name={name}
      value={value || ''}
      placeholder={placeholder}
      className={`block w-full sm:text-sm ${
        getColors(
          'focus:outline-none border-gray-300 text-vulcan-500',
          'border-transparent bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
        )
      }`}
      onChange={onChange}
    />
  );
};