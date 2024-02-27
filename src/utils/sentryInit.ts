import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { SENTRY_LINK, SentryIgnore } from '../constants';

export const SentryInit = (
  version: string | null,
  environment: string | null
): Sentry.BrowserOptions => ({
  dsn: SENTRY_LINK,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0, // No performance tracing required
  release: version || '',
  environment: environment || '',
  ignoreErrors: SentryIgnore,
  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  }
});
