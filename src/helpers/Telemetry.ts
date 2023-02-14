import TelemetryReporter, {
  TelemetryEventMeasurements,
  TelemetryEventProperties
} from '@vscode/extension-telemetry';
import { Extension, Settings } from '.';
import { EXTENSION_BETA_ID, EXTENSION_ID, SETTING_TELEMETRY_DISABLE } from '../constants';

export class Telemetry {
  private static instance: Telemetry;
  private static reporter: TelemetryReporter | null = null;

  private constructor() {
    const extension = Extension.getInstance();
    const extTitle = extension.isBetaVersion() ? EXTENSION_BETA_ID : EXTENSION_ID;
    const extVersion = extension.version;
    const appKey = `525037e5-70ff-4620-8e52-30e1aef8deee`;

    Telemetry.reporter = new TelemetryReporter(extTitle, extVersion, appKey);
  }

  public static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

  public static send(
    eventName: string,
    properties?: TelemetryEventProperties,
    measurements?: TelemetryEventMeasurements
  ) {
    if (!Telemetry.reporter) {
      Telemetry.getInstance();
    }

    const isDisabled = Settings.get<boolean>(SETTING_TELEMETRY_DISABLE);
    if (isDisabled) {
      return;
    }

    Telemetry.reporter?.sendTelemetryEvent(eventName, properties, measurements);
  }

  public static dispose() {
    Telemetry.reporter?.dispose();
  }
}
