import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { Checkbox as VSCodeCheckbox } from 'vscrui';

export interface IBooleanOptionProps {
  value: boolean | undefined | null;
  name: string;
  label: string;
}

export const BooleanOption: React.FunctionComponent<IBooleanOptionProps> = ({
  value,
  name,
  label
}: React.PropsWithChildren<IBooleanOptionProps>) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const onChange = React.useCallback((newValue: boolean) => {
    setIsChecked(newValue);
    Messenger.send(DashboardMessage.updateSetting, {
      name: name,
      value: newValue
    });
  }, [name]);

  React.useEffect(() => {
    setIsChecked(!!value);
  }, [value]);

  return (
    <VSCodeCheckbox
      onChange={onChange}
      checked={isChecked}>
      {label}
    </VSCodeCheckbox>
  );
};
