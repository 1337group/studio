// MERGE-NOTE: studio — Drewlo addition. Verify shapeshifter-beta JWT cookie
// on every request; redirect unauthenticated requests to ss.drewlo.com/login.
//
// Studio runs at studio.drewlo.com behind a Cloudflare tunnel. Users sign in
// once at ss.drewlo.com and the auth-service writes a `Domain=.drewlo.com`
// cookie that propagates to every *.drewlo.com subdomain. This shim:
//
//   1. Reads the cookie name (env: STUDIO_COOKIE_NAME, default `__ss_session`)
//   2. Verifies via `jose.jwtVerify` against `JWT_SECRET` with HS256
//   3. On success: sets `req.user` from the JWT payload, calls `next()`
//   4. On failure / missing cookie: 302 to `STUDIO_LOGIN_REDIRECT` with `next`
//
// Public allowlist:
//   - GET /api/health         — Hive contract: health checks unauthenticated
//   - /frames/*               — device frames loaded inside iframe srcdoc
//   - OPTIONS *               — CORS preflight (no body, no auth)
//
// If JWT_SECRET is missing, the shim fails closed: returns 500 on every
// gated request and logs once. We never let traffic through without auth.

import { jwtVerify } from 'jose';

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

export function createAuthShim(options = {}) {
  const cookieName = options.cookieName || process.env.STUDIO_COOKIE_NAME || '__ss_session';
  const loginRedirect =
    options.loginRedirect || process.env.STUDIO_LOGIN_REDIRECT || 'https://ss.drewlo.com/login';
  const rawSecret = options.jwtSecret || process.env.JWT_SECRET || '';
  const algorithms = options.algorithms || ['HS256'];

  if (!rawSecret) {
    console.error(
      '[studio/auth-shim] JWT_SECRET is empty — Studio will fail closed on every authenticated request. ' +
        'Set JWT_SECRET in /etc/platform-apps/studio.env to the same value used by shapeshifter-beta auth-service.',
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

    if (!token) {
      // Browser navigation — 302 to ss.drewlo.com/login. API client requests
      // (POST /api/chat from a fetch with stale cookie) get JSON 401 so the
      // SPA can re-render the login redirect itself.
      const accept = String(req.headers.accept || '');
      const isHtmlRequest = accept.includes('text/html') || req.method === 'GET';
      if (isHtmlRequest && req.path.startsWith('/api/') === false) {
        return res.redirect(302, buildLoginUrl(loginRedirect, req.originalUrl || req.url, req.headers.host));
      }
      return res.status(401).json({ error: 'unauthenticated', loginUrl: loginRedirect });
    }

    try {
      const { payload } = await jwtVerify(token, secret, { algorithms });
      // Surface the bits Studio needs downstream. Keep the raw payload too
      // so /api/chat can inspect tenant / scopes / scopes-by-app once we
      // wire those (P2.4).
      req.user = {
        sub: payload.sub || null,
        email: payload.email || null,
        name: payload.name || null,
        scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
        // raw is intentionally not serialised to clients — it stays on the request
        // object for downstream middleware only.
        raw: payload,
      };
      return next();
    } catch (err) {
      // Expired / invalid signature / wrong algorithm. Treat exactly like
      // missing cookie so the user re-auths via ss.drewlo.com.
      const accept = String(req.headers.accept || '');
      const isHtmlRequest = accept.includes('text/html') || req.method === 'GET';
      if (isHtmlRequest && req.path.startsWith('/api/') === false) {
        return res.redirect(302, buildLoginUrl(loginRedirect, req.originalUrl || req.url, req.headers.host));
      }
      return res.status(401).json({
        error: 'invalid session',
        reason: err && err.code ? err.code : 'verify_failed',
        loginUrl: loginRedirect,
      });
    }
  };
}
