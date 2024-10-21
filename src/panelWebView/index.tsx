import * as React from 'react';
import * as Sentry from '@sentry/react';
import { render } from 'react-dom';
import { ViewPanel } from './ViewPanel';
import { RecoilRoot } from 'recoil';
import { I10nProvider } from '../dashboardWebView/providers/I10nProvider';
import { SentryInit } from '../utils/sentryInit';
import 'vscrui/dist/codicon.css';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector('#app');

if (elm) {
  const version = elm?.getAttribute('data-version');
  const environment = elm?.getAttribute('data-environment');
  const isProd = elm?.getAttribute('data-isProd');
  const isCrashDisabled = elm?.getAttribute('data-is-crash-disabled');

  if (isProd === 'true' && isCrashDisabled === 'false') {
    Sentry.init(SentryInit(version, environment));

    Sentry.setTag("type", "panel");
    if (document.body.getAttribute(`data-vscode-theme-id`)) {
      Sentry.setTag("theme", document.body.getAttribute(`data-vscode-theme-id`));
    }
  }

  render(
    <I10nProvider>
      <RecoilRoot>
        <ViewPanel />
      </RecoilRoot>
    </I10nProvider>,
    elm
  );
}

// Webpack HMR
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (module as any).hot.accept();
}
