import * as React from 'react';
import { Checkbox as VSCodeCheckbox } from 'vscrui';

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
      onChange={updateValue}
      checked={isEnabled}>
      {label}
    </VSCodeCheckbox>
  );
};