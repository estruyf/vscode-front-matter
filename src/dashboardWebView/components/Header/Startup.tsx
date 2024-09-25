import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { Settings } from '../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { SETTING_DASHBOARD_OPENONSTART } from '../../../constants';
import * as l10n from "@vscode/l10n"
import { LocalizationKey } from '../../../localization';
import { Checkbox as VSCodeCheckbox } from 'vscrui';

export interface IStartupProps {
  settings: Settings | null;
}

export const Startup: React.FunctionComponent<IStartupProps> = ({
  settings
}: React.PropsWithChildren<IStartupProps>) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const onChange = (value: boolean) => {
    setIsChecked(value);
    Messenger.send(DashboardMessage.updateSetting, {
      name: SETTING_DASHBOARD_OPENONSTART,
      value: value
    });
  };

  React.useEffect(() => {
    setIsChecked(!!settings?.openOnStart);
  }, [settings?.openOnStart]);

  return (
    <VSCodeCheckbox
      onChange={onChange}
      checked={isChecked}>
      {l10n.t(LocalizationKey.dashboardHeaderStartupLabel)}
    </VSCodeCheckbox>
  );
};
