import * as React from 'react';
import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import { App } from './components/App';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { SENTRY_LINK, SentryIgnore } from '../constants';
import { MemoryRouter } from 'react-router-dom';
import './styles.css';
import { Preview } from './components/Preview';
import { SettingsProvider } from './providers/SettingsProvider';
import { CustomPanelViewResult } from '../models';
import { Chatbot } from './components/Chatbot/Chatbot';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

declare global {
  interface Window {
    fmExternal: {
      isDevelopment: boolean;
      getCustomFields: {
        name: string,
        html: (data: any, change: (value: any) => void) => Promise<CustomPanelViewResult | undefined>
      }[];
      getPanelView: (data: any) => Promise<CustomPanelViewResult | undefined>;
      getCardImage: (filePath: string, data: any) => Promise<string | undefined>;
      getCardFooter: (filePath: string, data: any) => Promise<string | undefined>;
      // 8.5.0 extension points
      getCardTitle: (filePath: string, data: any) => Promise<string | undefined>;
      getCardDescription: (filePath: string, data: any) => Promise<string | undefined>;
      getCardTags: (filePath: string, data: any) => Promise<string | undefined>;
      getCardDate: (filePath: string, data: any) => Promise<string | undefined>;
      getCardStatus: (filePath: string, data: any) => Promise<string | undefined>;
    }
  }
}

export const routePaths: { [name: string]: string } = {
  welcome: '/welcome',
  contents: '/contents',
  media: '/media',
  snippets: '/snippets',
  data: '/data',
  taxonomy: '/taxonomy'
};

const preserveColor = (color: string | undefined) => {
  if (color) {
    if (color.startsWith('#') && color.length > 7) {
      return color.slice(0, 7);
    } else if (color.startsWith('rgba')) {
      const splits = color.split(',');
      splits.pop();
      return `${splits.join(', ')}, 1)`;
    }
  }

  return color;
}

const addBgOpacity = (color: string | undefined) => {
  if (color) {

  }

  return color;
}

const updateCssVariables = () => {
  const styles = getComputedStyle(document.documentElement);

  // Lightbox
  const background = styles.getPropertyValue('--vscode-editor-background');
  // Adds 75% opacity to the background color
  document.documentElement.style.setProperty('--frontmatter-lightbox-background', `${preserveColor(background)}BF`);

  // Text
  document.documentElement.style.setProperty('--frontmatter-text', 'var(--vscode-editor-foreground)');
  document.documentElement.style.setProperty('--frontmatter-secondary-text', 'var(--vscode-editorHint-foreground)');
  document.documentElement.style.setProperty('--frontmatter-link', 'var(--vscode-textLink-foreground)');
  document.documentElement.style.setProperty('--frontmatter-link-hover', 'var(--vscode-textLink-activeForeground)');

  // List  
  document.documentElement.style.setProperty('--frontmatter-list-text', 'var(--vscode-editor-foreground)');
  document.documentElement.style.setProperty('--frontmatter-list-background', 'var(--vscode-list-activeSelectionBackground)');
  document.documentElement.style.setProperty('--frontmatter-list-hover-background', 'var(--vscode-list-hoverBackground)');
  document.documentElement.style.setProperty('--frontmatter-list-selected-background', 'var(--vscode-list-activeSelectionBackground)');
  document.documentElement.style.setProperty('--frontmatter-list-selected-text', 'var(--vscode-list-activeSelectionForeground)');

  // Borders
  document.documentElement.style.setProperty('--frontmatter-border', 'var(--vscode-panel-border)');

  // Other colors which should be preserved (no opacity)
  const buttonBackground = styles.getPropertyValue('--vscode-button-background');
  if (buttonBackground) {
    document.documentElement.style.setProperty('--frontmatter-button-background', preserveColor(buttonBackground) || "var(--vscode-button-background)");
  }

  const buttonHoverBackground = styles.getPropertyValue('--vscode-button-hoverBackground');
  if (buttonHoverBackground) {
    document.documentElement.style.setProperty('--frontmatter-button-hoverBackground', preserveColor(buttonHoverBackground) || "var(--vscode-button-hoverBackground)");
  }
}

const mutationObserver = new MutationObserver((mutationsList, observer) => {
  updateCssVariables();
});

const elm = document.querySelector('#app');
if (elm) {
  const welcome = elm?.getAttribute('data-showWelcome');
  const version = elm?.getAttribute('data-version');
  const environment = elm?.getAttribute('data-environment');
  const isProd = elm?.getAttribute('data-isProd');
  const type = elm?.getAttribute('data-type');
  const url = elm?.getAttribute('data-url');
  const experimental = elm?.getAttribute('data-experimental');
  const webviewUrl = elm?.getAttribute('data-webview-url');

  updateCssVariables();
  mutationObserver.observe(document.body, { childList: false, attributes: true });

  if (isProd === 'true') {
    Sentry.init({
      dsn: SENTRY_LINK,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0, // No performance tracing required
      release: version || '',
      environment: environment || '',
      ignoreErrors: SentryIgnore
    });

    Sentry.setTag("type", "dashboard");
    if (document.body.getAttribute(`data - vscode - theme - id`)) {
      Sentry.setTag("theme", document.body.getAttribute(`data-vscode-theme-id`));
    }
  }

  elm.setAttribute("class", `${experimental ? "experimental" : ""} bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]`);

  if (type === 'preview') {
    render(
      <SettingsProvider experimental={experimental === 'true'} version={version || ""}>
        <Preview url={url} />
      </SettingsProvider>, elm);
  } else if (type === 'chatbot') {
    render(
      <SettingsProvider
        aiUrl='https://frontmatter.codes'
        experimental={experimental === 'true'}
        version={version || ""}>
        <Chatbot />
      </SettingsProvider>, elm);
  } else {
    render(
      <RecoilRoot>
        <MemoryRouter
          initialEntries={Object.keys(routePaths).map((key: string) => routePaths[key]) as string[]}
          initialIndex={1}
        >
          <SettingsProvider experimental={experimental === 'true'} version={version || ""} webviewUrl={webviewUrl || ""}>
            <App showWelcome={!!welcome} />
          </SettingsProvider>
        </MemoryRouter>
      </RecoilRoot>,
      elm
    );
  }
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();
