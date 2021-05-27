import * as React from "react";
import { render } from "react-dom";
import { ViewPanel } from "./ViewPanel";

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#app");
render(<ViewPanel />, elm);
