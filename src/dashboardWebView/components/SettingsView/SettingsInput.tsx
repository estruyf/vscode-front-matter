import * as React from 'react';
import { TextField as VSCodeTextField } from 'vscrui';

export interface ISettingsInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (key: string, value: string) => void;
  fallback?: string;
}

export const SettingsInput: React.FunctionComponent<ISettingsInputProps> = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  fallback
}: React.PropsWithChildren<ISettingsInputProps>) => {

  return (
    <VSCodeTextField
      className='w-full p-0 m-0 bg-inherit'
      value={value || fallback || ""}
      placeholder={placeholder}
      onChange={(value: string) => onChange(name, value)}>
      {label}
    </VSCodeTextField>
  );
};