import { workspace } from 'vscode';
import { Extension, Settings } from '.';
import { EXTENSION_BETA_ID, EXTENSION_ID, SETTING_TELEMETRY_DISABLE } from '../constants';

const METRICS_URL = 'https://frontmatter.codes/api/metrics';

export class Telemetry {
  private static instance: Telemetry;
  private extTitle: string;
  private extVersion: string;
  private events: any[] = [];
  private timeout: NodeJS.Timeout | undefined;

  private constructor() {
    const extension = Extension.getInstance();
    this.extTitle = extension.isBetaVersion() ? EXTENSION_BETA_ID : EXTENSION_ID;
    this.extVersion = extension.version;
  }

  public static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

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

    const isDisabled = Settings.get<boolean>(SETTING_TELEMETRY_DISABLE);

    return isDisabled || isVscodeEnable ? false : true;
  }

  /**
   * Send metrics to our own database
   * @param eventName
   * @param properties
   * @returns
   */
  public static send(eventName: string, properties?: any) {
    if (!Telemetry.isEnabled()) {
      return;
    }

    const instance = Telemetry.getInstance();
    instance.events.push({
      name: eventName,
      extName: instance.extTitle,
      version: instance.extVersion,
      properties
    });

    instance.debounceMetrics();
  }

  /**
   * Debounce the metrics by 1 second
   */
  private async debounceMetrics() {
    const instance = Telemetry.getInstance();

    // Check if timeout was defined
    if (instance.timeout) {
      clearTimeout(instance.timeout);
    }

    // Set a new timeout
    instance.timeout = setTimeout(async () => {
      await fetch(METRICS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.events)
      });
      // Reset the events
      this.events = [];
    }, 1000) as any as NodeJS.Timeout;
  }
}
