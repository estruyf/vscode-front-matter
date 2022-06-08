import * as React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import { App } from "./components/App";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_LINK } from "../constants";
import './styles.css';
import { Preview } from "./components/Preview";

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
  const type = elm?.getAttribute("data-type");
  const url = elm?.getAttribute("data-url");

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
  
  if (type === "preview") {
    render(<Preview url={url} />, elm);
  } else {
    render((
      <RecoilRoot>
        <App showWelcome={!!welcome} />
      </RecoilRoot>
    ), elm);
  }
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();