import * as React from 'react';
import { TextField } from '../Common/TextField';

export interface ISnippetInputProps {
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  isTextArea?: boolean;
}

export const SnippetInput: React.FunctionComponent<ISnippetInputProps> = ({ name, value, placeholder, isTextArea, onChange }: React.PropsWithChildren<ISnippetInputProps>) => {
  if (isTextArea) {
    return (
      <TextField
        name={name}
        value={value || ''}
        placeholder={placeholder}
        rows={5}
        onChange={onChange}
        multiline
      />
    )
  }

  return (
    <TextField
      name={name}
      value={value || ''}
      placeholder={placeholder}
      onChange={onChange} />
  );
};