import { ErrorInfo } from "react";
import memoize from "lodash/memoize";
import { Location } from "@remix-run/router";

import { SENTRY_DSN } from "common/config";

let errorQueue: Error[] = [];
let sentryIsInitialized = false;

export function initErrorHandlers() {
  function handler(error: Error) {
    if (sentryIsInitialized) {
      trackSentry(error);
    } else {
      errorQueue.push(error);
    }
    initSentry();
  }

  window.onerror = (message, url, line, column, error) => error && handler(error);
  window.onunhandledrejection = event => handler(event.reason);
}

const initSentry = memoize(async () => {
  const Sentry = await import(/* webpackChunkName: "vendors/sentry" */ "@sentry/browser");
  const SentryTracing = await import(/* webpackChunkName: "vendors/sentry" */ "@sentry/tracing");

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new SentryTracing.BrowserTracing()],
    tracesSampleRate: 1.0,
  });

  sentryIsInitialized = true;

  if (errorQueue.length > 0) {
    errorQueue.forEach(error => {
      Sentry.captureException(error);
    });
    errorQueue = [];
  }

  return Sentry;
});

export async function trackSentry(error: Error, errorInfo?: ErrorInfo) {
  const Sentry = await initSentry();

  Sentry.withScope(scope => {
    if (errorInfo) {
      scope.setExtras({ componentStack: errorInfo.componentStack });
    }
    Sentry.captureException(error);
  });
}

export async function trackPage(location: Location) {
  const Sentry = await initSentry();

  Sentry.addBreadcrumb({
    category: "page",
    data: {
      location,
    },
    level: "info",
  });
}
