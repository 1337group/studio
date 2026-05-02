// @ts-nocheck
// MERGE-NOTE: studio — ShapeShifter addition. Verify shapeshifter-beta JWT cookie
// on every request; redirect unauthenticated requests to ss.drewlo.com/login.
//
// Studio runs at studio.drewlo.com behind a Cloudflare tunnel. Users sign in
// once at ss.drewlo.com and the auth-service writes a `Domain=.drewlo.com`
// cookie that propagates to every *.drewlo.com subdomain. This shim:
//
//   1. Reads the cookie name (env: STUDIO_COOKIE_NAME, default `__ss_session`)
//   2. Verifies via `jose.jwtVerify` against `JWT_SECRET` with HS256
//   3. On success: sets `req.user` from the JWT payload, calls `next()`
//   4. On expired/missing access JWT: try silent refresh server-side BEFORE
//      bouncing to /login. The browser sends `__ss_refresh` (Path=/ on
//      .drewlo.com) so the shim can POST to ss.drewlo.com/api/auth/refresh
//      with that cookie, get back a new __ss_session + rotated __ss_refresh,
//      forward the Set-Cookie headers to the user, verify the new access
//      token, and continue. Microsoft-style "stay signed in" — invisible to
//      the user as long as their refresh window (30d sliding) hasn't lapsed.
//   5. On refresh failure: 302 to `STUDIO_LOGIN_REDIRECT` with `next`.
//
// Public allowlist:
//   - GET /api/health         — Hive contract: health checks unauthenticated
//   - /frames/*               — device frames loaded inside iframe srcdoc
//   - OPTIONS *               — CORS preflight (no body, no auth)
//
// If JWT_SECRET is missing, the shim fails closed: returns 500 on every
// gated request and logs once. We never let traffic through without auth.

import { jwtVerify } from 'jose';
import { createLogger } from './logger.js';

const log = createLogger('auth-shim');
const REFRESH_COOKIE_NAME = '__ss_refresh';
const REFRESH_ENDPOINT =
  process.env.STUDIO_REFRESH_ENDPOINT || 'https://ss.drewlo.com/api/auth/refresh';
const REFRESH_TIMEOUT_MS = 4000;

const PUBLIC_PATH_PREFIXES = ['/api/health', '/frames/'];

function parseCookies(header) {
  if (!header || typeof header !== 'string') return {};
  const out = {};
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

function isPublicPath(pathname) {
  if (pathname === '/api/health') return true;
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function buildLoginUrl(loginRedirect, originalUrl, host) {
  const proto = 'https';
  const back = `${proto}://${host}${originalUrl}`;
  const sep = loginRedirect.includes('?') ? '&' : '?';
  return `${loginRedirect}${sep}next=${encodeURIComponent(back)}`;
}

// Extract a single named cookie value from a Set-Cookie header line.
// `Set-Cookie: __ss_session=eyJ…; Max-Age=3600; Domain=.drewlo.com; …`
// → `eyJ…`. Returns null when the header doesn't carry that cookie.
function extractCookieValue(setCookieLine, name) {
  if (!setCookieLine) return null;
  const prefix = `${name}=`;
  if (!setCookieLine.startsWith(prefix)) return null;
  const semicolon = setCookieLine.indexOf(';');
  const raw = semicolon > 0
    ? setCookieLine.slice(prefix.length, semicolon)
    : setCookieLine.slice(prefix.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// In-flight refresh coalescer: when the access JWT expires and N concurrent
// requests fire from the browser, they ALL find the same expired token and
// would each call /api/auth/refresh with the same refresh cookie. The
// upstream rotates the refresh token on first use (one-time-use semantics),
// so request #2..N would receive the now-stale token and 401, killing
// whatever the user was doing (most painfully: POST /api/runs starting a
// chat). Coalesce by refreshRaw key so all concurrent requests share one
// upstream call and all get the same new payload + Set-Cookie headers.
// Map value is { promise, setCookies } — the promise resolves to the
// verified payload (or null on failure); setCookies is captured so each
// concurrent request can mirror them onto its own response.
const inflightRefresh = new Map();

// Server-side silent refresh. Called when the access JWT is missing or
// expired but the browser still has a valid refresh cookie. Returns the
// new access JWT (already verified) on success, or null on any failure.
// Forwards Set-Cookie headers to the response so the browser updates its
// cookies before the next request lands.
async function trySilentRefresh({ refreshRaw, res, secret, algorithms, cookieName }) {
  // Coalesce: if a refresh for this refreshRaw is already in flight, wait
  // for it instead of starting a parallel one.
  const existing = inflightRefresh.get(refreshRaw);
  if (existing) {
    const result = await existing.promise;
    // Mirror Set-Cookie headers onto THIS response (the original setHeader
    // happened on the leader's res; coalesced followers need their own).
    if (result && existing.setCookies && existing.setCookies.length) {
      res.setHeader('Set-Cookie', existing.setCookies);
    }
    return result;
  }

  const entry = { setCookies: null, promise: null };
  entry.promise = doSilentRefresh({ refreshRaw, res, secret, algorithms, cookieName, entry });
  inflightRefresh.set(refreshRaw, entry);
  try {
    return await entry.promise;
  } finally {
    // Brief settle: keep the entry around for ~2s so any lagging concurrent
    // request still gets the coalesced result. Then drop so next refresh
    // attempt isn't poisoned by a stale entry.
    setTimeout(() => inflightRefresh.delete(refreshRaw), 2000);
  }
}

async function doSilentRefresh({ refreshRaw, res, secret, algorithms, cookieName, entry }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  try {
    // No Content-Type header — Fastify's JSON parser rejects POST with
    // Content-Type: application/json + empty body (returns 400 before the
    // route runs). The refresh route reads the cookie, not the body, so we
    // omit Content-Type entirely. refreshRaw is already URL-safe (rotateRefreshToken
    // generates `${uuid}.${secret}` from crypto.randomBytes hex), so no
    // encodeURIComponent — that would corrupt the tokenId slice (first 36 chars
    // = uuid).
    const upstream = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        Cookie: `${REFRESH_COOKIE_NAME}=${refreshRaw}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!upstream.ok) {
      log.warn({ event: 'silent_refresh_upstream_non_ok', status: upstream.status }, 'silent refresh upstream non-ok');
      return null;
    }

    // Forward all Set-Cookie headers verbatim so the browser stores the
    // rotated __ss_session + __ss_refresh under .drewlo.com. Node 18+
    // exposes getSetCookie(); fall back to .raw() / split otherwise.
    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : (() => {
          const raw = upstream.headers.raw?.()['set-cookie'];
          if (Array.isArray(raw)) return raw;
          const single = upstream.headers.get('set-cookie');
          return single ? [single] : [];
        })();

    if (setCookies.length) {
      // Express: res.setHeader('Set-Cookie', array) emits one header per item.
      res.setHeader('Set-Cookie', setCookies);
      // Stash on coalescer entry so concurrent followers can mirror these
      // onto their own responses (see trySilentRefresh).
      if (entry) entry.setCookies = setCookies;
    }

    const newAccess = setCookies
      .map((line) => extractCookieValue(line, cookieName))
      .find((v) => v && v.length > 0);
    if (!newAccess) {
      log.warn({ event: 'silent_refresh_no_access_cookie', setCookieCount: setCookies.length }, 'silent refresh: no new access cookie in upstream Set-Cookie');
      return null;
    }

    const { payload } = await jwtVerify(newAccess, secret, { algorithms });
    log.info({ event: 'silent_refresh_success', email: payload.email || null, sub: payload.sub || null }, 'silent refresh succeeded');
    return payload;
  } catch (err) {
    log.warn({ event: 'silent_refresh_threw', err: err && err.message ? err.message : String(err) }, 'silent refresh threw');
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function createAuthShim(options = {}) {
  const cookieName = options.cookieName || process.env.STUDIO_COOKIE_NAME || '__ss_session';
  const loginRedirect =
    options.loginRedirect || process.env.STUDIO_LOGIN_REDIRECT || 'https://ss.drewlo.com/login';
  const rawSecret = options.jwtSecret || process.env.JWT_SECRET || '';
  const algorithms = options.algorithms || ['HS256'];

  if (!rawSecret) {
    log.error(
      { event: 'jwt_secret_missing' },
      'JWT_SECRET is empty — Studio will fail closed on every authenticated request. Set JWT_SECRET in /etc/platform-apps/studio.env to the same value used by shapeshifter-beta auth-service.',
    );
  }

  const secret = new TextEncoder().encode(rawSecret);

  return async function authShim(req, res, next) {
    if (req.method === 'OPTIONS') return next();
    if (isPublicPath(req.path)) return next();

    if (!rawSecret) {
      return res
        .status(500)
        .json({ error: 'studio: JWT_SECRET not configured — see daemon log' });
    }

    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies[cookieName];
    const refreshRaw = cookies[REFRESH_COOKIE_NAME];

    // Helper: turn a verified JWT payload into Studio's req.user shape.
    const attachUser = (payload) => {
      req.user = {
        sub: payload.sub || null,
        email: payload.email || null,
        name: payload.name || null,
        scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
        // raw is intentionally not serialised to clients — it stays on the request
        // object for downstream middleware only.
        raw: payload,
      };
    };

    // Helper: bounce browsers to /login, return 401 to API clients.
    const bounceToLogin = (extra = {}) => {
      const accept = String(req.headers.accept || '');
      const isHtmlRequest = accept.includes('text/html') || req.method === 'GET';
      if (isHtmlRequest && req.path.startsWith('/api/') === false) {
        return res.redirect(302, buildLoginUrl(loginRedirect, req.originalUrl || req.url, req.headers.host));
      }
      return res.status(401).json({ error: 'unauthenticated', loginUrl: loginRedirect, ...extra });
    };

    // Fast path: valid access JWT, just attach req.user and continue.
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret, { algorithms });
        attachUser(payload);
        return next();
      } catch (_) {
        // Fall through to silent-refresh attempt below.
      }
    }

    // Silent refresh: access JWT is missing or expired but the browser still
    // carries a refresh cookie. Server-side rotate via ss.drewlo.com so the
    // user never sees a /login bounce until the 30-day refresh window lapses.
    if (refreshRaw) {
      const refreshed = await trySilentRefresh({
        refreshRaw,
        res,
        secret,
        algorithms,
        cookieName,
      });
      if (refreshed) {
        attachUser(refreshed);
        return next();
      }
    }

    return bounceToLogin();
  };
}
