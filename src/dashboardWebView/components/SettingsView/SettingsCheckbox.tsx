import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';

export interface ISettingsCheckboxProps {
  label: string;
  name: string;
  value: boolean;
  onChange: (key: string, value: boolean) => void;
}

export const SettingsCheckbox: React.FunctionComponent<ISettingsCheckboxProps> = ({
  label,
  name,
  value,
  onChange
}: React.PropsWithChildren<ISettingsCheckboxProps>) => {
  const [isEnabled, setIsEnabled] = React.useState(false);

  const updateValue = (value: boolean) => {
    setIsEnabled(value);
    onChange(name, value);
  }

  React.useEffect(() => {
    setIsEnabled(value);
  }, [value]);

  return (
    <VSCodeCheckbox
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateValue(e.target.checked)}
      checked={isEnabled}>
      {label}
    </VSCodeCheckbox>
  );
};