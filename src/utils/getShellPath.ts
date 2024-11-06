import { workspace } from 'vscode';
import { ShellSetting } from '../models';
import { getPlatform } from './getPlatform';

/**
 * Retrieves the shell path configuration based on the current platform and terminal settings.
 *
 * This method checks for the following configurations in order:
 * 1. `integrated.automationProfile.<platform>`: Returns the automation profile if it exists.
 * 2. `integrated.defaultProfile.<platform>` and `integrated.profiles.<platform>`: Returns the shell setting from the default profile if it exists.
 * 3. `integrated.shell.<platform>`: Returns the shell setting if the above configurations are not found.
 *
 * @returns {string | ShellSetting | undefined} The shell path configuration or undefined if not found.
 */
export const getShellPath = (): string | ShellSetting | undefined => {
  const platform = getPlatform();
  const terminalSettings = workspace.getConfiguration('terminal');

  const automationProfile = terminalSettings.get<string | ShellSetting>(
    `integrated.automationProfile.${platform}`
  );
  if (!!automationProfile) {
    return automationProfile;
  }

  const defaultProfile = terminalSettings.get<string>(`integrated.defaultProfile.${platform}`);
  const profiles = terminalSettings.get<{ [prop: string]: ShellSetting }>(
    `integrated.profiles.${platform}`
  );

  if (defaultProfile && profiles && profiles[defaultProfile]) {
    return profiles[defaultProfile];
  }

  return terminalSettings.get(`integrated.shell.${platform}`);
};
