import * as React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import { Dashboard } from "./components/Dashboard";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_LINK } from "../constants";
import './styles.css';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#app");
if (elm) {
  const welcome = elm?.getAttribute("data-showWelcome");
  const version = elm?.getAttribute("data-version");
  const environment = elm?.getAttribute("data-environment");
  const isProd = elm?.getAttribute("data-isProd");

  if (isProd === "true") {
    Sentry.init({
      dsn: SENTRY_LINK,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0, // No performance tracing required
      release: version || "",
      environment: environment || "",
      ignoreErrors: ['ResizeObserver loop limit exceeded']
    });
  }
  
  render(<RecoilRoot><Dashboard showWelcome={!!welcome} /></RecoilRoot>, elm);
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();