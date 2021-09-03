import * as React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import { Dashboard } from "./components/Dashboard";

import './styles.css';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#app");
const welcome = elm?.getAttribute("data-showWelcome");
render(<RecoilRoot><Dashboard showWelcome={!!welcome} /></RecoilRoot>, elm);