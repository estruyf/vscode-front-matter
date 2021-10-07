import * as React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import { Dashboard } from "./components/Dashboard";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_LINK } from "../constants";
import './styles.css';

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
const welcome = elm?.getAttribute("data-showWelcome");
render(<RecoilRoot><Dashboard showWelcome={!!welcome} /></RecoilRoot>, elm);