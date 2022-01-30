import TelemetryReporter, { TelemetryEventMeasurements, TelemetryEventProperties } from '@vscode/extension-telemetry';
import { Extension } from '.';
import { EXTENSION_BETA_ID, EXTENSION_ID } from '../constants';

export const TelemetryEvent = {
  activate: 'activate',
  initialization: 'initialization',
  openContentDashboard: 'openContentDashboard',
  openMediaDashboard: 'openMediaDashboard',
  openDataDashboard: 'openDataDashboard',
  closeDashboard: 'closeDashboard',
  generateSlug: 'generateSlug',
  createContentFromTemplate: 'createContentFromTemplate',
  createContentFromContentType: 'createContentFromContentType',
  registerFolder: 'registerFolder',
  unregisterFolder: 'unregisterFolder',
  addMediaFolder: 'addMediaFolder',
  promoteSettings: 'promoteSettings',
  openPreview: 'openPreview',
  uploadMedia: 'uploadMedia',
  refreshMedia: 'refreshMedia',
  deleteMedia: 'deleteMedia',
  insertMediaToContent: 'insertMediaToContent',
  updateMediaMetadata: 'updateMediaMetadata',
  openExplorerView: 'openExplorerView',
};

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

  public static send(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
    if (!Telemetry.reporter) {
      Telemetry.getInstance();
    }
    
    Telemetry.reporter?.sendTelemetryEvent(eventName, properties, measurements);
  }

  public static dispose() {
    Telemetry.reporter?.dispose();
  }
}