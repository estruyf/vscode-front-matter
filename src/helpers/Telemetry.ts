import { workspace } from 'vscode';

export class Telemetry {
  public static isVscodeEnabled(): boolean {
    const config = workspace.getConfiguration('telemetry');
    const isVscodeEnable = config.get<'off' | undefined>('enableTelemetry');
    return isVscodeEnable === 'off' ? false : true;
  }

  /**
   * Checks if telemetry is enabled.
   * @returns {boolean} Returns true if telemetry is enabled, false otherwise.
   */
  public static isEnabled(): boolean {
    const isVscodeEnable = Telemetry.isVscodeEnabled();
    return isVscodeEnable ? false : true;
  }
}
