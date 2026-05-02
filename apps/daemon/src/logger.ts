// @ts-nocheck
// MERGE-NOTE: studio — pino + pino-loki structured logger.
//
// Replaces ad-hoc console.* in our additive daemon files (auth-shim,
// anthropic-server). Aligns Studio with the rest of the Hive platform
// where every app (auth-service, shapeshifter, siteline, sentinel,
// platform-worker, hive-tool-*) pushes structured JSON logs to the
// central Loki instance at 127.0.0.1:3100 via pino-loki.
//
// HOW IT WORKS
//   - Always logs to stdout (captured by systemd journal → journalctl)
//   - If `LOKI_URL` env is set, ALSO pushes to Loki via pino-loki transport
//     (batched every 5s). Production env file sets LOKI_URL=http://127.0.0.1:3100.
//   - Each component (auth-shim, anthropic-server, …) gets a child logger via
//     `createLogger(component)` so log entries carry `{ app, component }`
//     labels for Grafana filtering.
//
// USAGE
//   import { createLogger } from './logger.js';
//   const log = createLogger('auth-shim');
//   log.info({ email, event: 'silent_refresh_success' }, 'silent refresh ok');
//   log.warn({ status }, 'upstream non-ok');
//   log.error({ err }, 'JWT_SECRET missing');
//
// QUERY (Grafana / logcli)
//   {app="studio"} | json | component="auth-shim"
//   {app="studio"} | json | component="auth-shim" | event="silent_refresh_failed"

import pino from 'pino';

const APP = process.env.STUDIO_LOG_APP || 'studio';
const LIFECYCLE = process.env.LIFECYCLE || 'production';
const LEVEL = process.env.LOG_LEVEL || 'info';
const LOKI_URL = process.env.LOKI_URL || ''; // empty = stdout only (dev)

const targets = [
  // stdout — picked up by systemd journald → journalctl. Belt+suspenders so
  // even if Loki is down we still have logs.
  { target: 'pino/file', options: { destination: 1 } },
];

if (LOKI_URL) {
  targets.push({
    target: 'pino-loki',
    options: {
      host: LOKI_URL,
      batching: true,
      interval: 5,
      labels: { app: APP, lifecycle: LIFECYCLE },
    },
  });
}

const baseLogger = pino({
  level: LEVEL,
  base: { app: APP, lifecycle: LIFECYCLE },
  transport: { targets },
});

export function createLogger(component) {
  return baseLogger.child({ component });
}

export default baseLogger;
