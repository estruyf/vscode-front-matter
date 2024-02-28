import * as React from 'react';
import { TextField } from '../Common/TextField';

export interface IDetailsInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isTextArea?: boolean;
}

export const DetailsInput: React.FunctionComponent<IDetailsInputProps> = ({ name, value, isTextArea, onChange }: React.PropsWithChildren<IDetailsInputProps>) => {
  if (isTextArea) {
    return (
      <TextField
        name={name}
        value={value}
        onChange={onChange}
        multiline
      />
    );
  }

  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
    />
  );
};