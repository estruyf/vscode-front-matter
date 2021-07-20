import * as React from "react";
import { render } from "react-dom";
import { ViewPanel } from "./ViewPanel";

import '@bendera/vscode-webview-elements/dist/vscode-icon';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#app");
render(<ViewPanel />, elm);
