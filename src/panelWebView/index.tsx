import * as React from "react";
import { render } from "react-dom";
import { ViewPanel } from "./ViewPanel";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_LINK } from "../constants";

// require('@vscode/codicons/dist/codicon.css');
import '@bendera/vscode-webview-elements/dist/vscode-table';
import '@bendera/vscode-webview-elements/dist/vscode-table-header';
import '@bendera/vscode-webview-elements/dist/vscode-table-header-cell';
import '@bendera/vscode-webview-elements/dist/vscode-table-body';
import '@bendera/vscode-webview-elements/dist/vscode-table-row';
import '@bendera/vscode-webview-elements/dist/vscode-table-cell';
import '@bendera/vscode-webview-elements/dist/vscode-collapsible';
import '@bendera/vscode-webview-elements/dist/vscode-label';

import '@vscode/webview-ui-toolkit/dist/esm/checkbox';

Sentry.init({
  dsn: SENTRY_LINK,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0, // No performance tracing required
});

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#app");
render(<ViewPanel />, elm);
