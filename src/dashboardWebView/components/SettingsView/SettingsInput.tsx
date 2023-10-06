import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';

export interface ISettingsInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (key: string, value: string) => void;
  fallback?: string;
}

export const SettingsInput: React.FunctionComponent<ISettingsInputProps> = ({
  label,
  name,
  value,
  onChange,
  fallback
}: React.PropsWithChildren<ISettingsInputProps>) => {

  return (
    <VSCodeTextField
      className='w-full p-0 m-0 bg-inherit border-0 focus:border-0 outline-none focus:outline-none shadow-none'
      style={{
        boxShadow: 'none'
      }}
      value={value || fallback || ""}
      onInput={(e: React.ChangeEvent<HTMLInputElement>) => onChange(name, e.target.value)}>
      {label}
    </VSCodeTextField>
  );
};