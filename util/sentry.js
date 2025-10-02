import * as Sentry from "@sentry/node";

// Initialize Sentry
export const initSentry = (dsn, environment) => {
  Sentry.init({
    dsn,
    sendDefaultPii: true, // optional
    tracesSampleRate: environment === "production" ? 0.2 : 0.1,
    environment: environment,
  });

  return Sentry;
};

// For capturing errors globally
export const captureError = async (error, extra = {}) => {
  Sentry.captureException(error, { extra });
  await Sentry.flush(2000);
};
