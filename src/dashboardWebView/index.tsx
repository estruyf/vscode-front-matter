import * as React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import { Dashboard } from "./components/Dashboard";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_LINK } from "../constants";
import './styles.css';

const elm = document.querySelector("#app");
const welcome = elm?.getAttribute("data-showWelcome");
const version = elm?.getAttribute("data-version");
const environment = elm?.getAttribute("data-environment");

Sentry.init({
  dsn: SENTRY_LINK,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0, // No performance tracing required
  release: version || "",
  environment: environment || ""
});

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};
render(<RecoilRoot><Dashboard showWelcome={!!welcome} /></RecoilRoot>, elm);