import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { Settings } from '../../models';
import useThemeColors from '../../hooks/useThemeColors';
import { DashboardMessage } from '../../DashboardMessage';
import { SETTING_DASHBOARD_OPENONSTART } from '../../../constants';

export interface IStartupProps {
  settings: Settings | null;
}

export const Startup: React.FunctionComponent<IStartupProps> = ({
  settings
}: React.PropsWithChildren<IStartupProps>) => {
  const [isChecked, setIsChecked] = React.useState(false);
  const { getColors } = useThemeColors();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    Messenger.send(DashboardMessage.updateSetting, {
      name: SETTING_DASHBOARD_OPENONSTART,
      value: e.target.checked
    });
  };

  React.useEffect(() => {
    setIsChecked(!!settings?.openOnStart);
  }, [settings?.openOnStart]);

  return (
    <div className={`relative flex items-start ml-4`}>
      <div className="flex items-center h-5">
        <input
          id="startup"
          aria-describedby="startup-description"
          name="startup"
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className={`h-4 w-4 focus:outline-none rounded ${getColors(
            `focus:ring-teal-500 text-teal-600 border-gray-300 dark:border-vulcan-50`,
            `focus:ring-[var(--frontmatter-button-background)] text-[var(--frontmatter-button-background)] border-[var(--vscode-editorWidget-border)]`
          )
            }`}
        />
      </div>
      <div className="ml-2 text-sm">
        <label
          id="startup-description"
          htmlFor="startup"
          className={`font-medium ${getColors(
            `text-vulcan-50 dark:text-whisper-900`,
            `text-[var(--vscode-editor-foreground)]`
          )
            }`}
        >
          Open on startup?
        </label>
      </div>
    </div>
  );
};
