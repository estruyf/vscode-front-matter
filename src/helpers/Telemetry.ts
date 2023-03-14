import { Extension, Settings } from '.';
import { EXTENSION_BETA_ID, EXTENSION_ID, SETTING_TELEMETRY_DISABLE } from '../constants';
import fetch from 'node-fetch';

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

  /**
   * Send metrics to our own database
   * @param eventName
   * @param properties
   * @returns
   */
  public static send(eventName: string, properties?: any) {
    const isDisabled = Settings.get<boolean>(SETTING_TELEMETRY_DISABLE);
    if (isDisabled) {
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
