# Studio

> Goa-skinned fork of [`nexu-io/open-design`](https://github.com/nexu-io/open-design) at studio.drewlo.com. Standalone Hive app for the build / fork / review / ship loop.

## Status

`dev` — last verified 2026-04-29

Who uses it: internal Drewlo (IT + Property Management) once P1.1 ships. RC1's `/studio` route will redirect here once P2.3 lands.

## Router metadata

- **Trigger:** `@studio`
- **Path:** `projects/hive/studio/`
- **Memory glob:** `memory/project_studio*.md`
- **Live data:** SQLite at `.od/app.sqlite` on hive (`/opt/platform-apps/studio/.od/`)
- **Related:** `@ss` `@goa` `@duet` `@hive`

## Stack / access

| Layer | Tech |
|---|---|
| Language | TypeScript (frontend), JavaScript ES modules (daemon) |
| Frontend | Vite 5 + React 18 + TS |
| Daemon | Node 20–22 + Express + better-sqlite3 (local SQLite) |
| Auth | Cookie verify against shapeshifter-beta JWT (`__ss_session` on `.drewlo.com`) — middleware ships in P1.1 |
| AI | Anthropic SDK 0.32.1 inherited from upstream — bumps to latest in P1.1; server-side path replaces BYOK on Hive deploy |
| Host | hive (172.16.1.77) — `/opt/platform-apps/studio/` |
| Port | `:8210` (set via `OD_PORT`) |
| Public URL | `https://studio.drewlo.com` (Cloudflare tunnel → 127.0.0.1:8210) |
| License | Apache-2.0 (carries forward from open-design) |

### Repo layout (upstream-driven — not the Drewlo monorepo standard)

This is a fork. The directory shape is dictated by `nexu-io/open-design` so we can sync upstream without conflicts:

```
studio/
├── daemon/                       ← Node + Express server (the only privileged process)
│   ├── server.js                 ← /api/* routes — auth shim adds here in P1.1
│   ├── cli.js                    ← `od` bin entry, reads OD_PORT
│   ├── design-systems.js         ← DESIGN.md loader
│   └── …
├── design-systems/               ← 73 systems shipped from upstream + `goa/` (P1.1)
│   ├── goa/                      ← Drewlo design language (P1.1 — DESIGN.md prose only)
│   ├── default/, apple/, linear-app/, …
├── src/                          ← Vite + React + TS frontend
│   ├── App.tsx
│   ├── components/               ← chrome reskin lands here in P1.2
│   └── prompts/                  ← system + discovery + directions
├── skills/                       ← 19 SKILL.md skill bundles (upstream)
├── assets/                       ← upstream + Drewlo brand drops (knot PNG in P1.2)
├── scripts/dev-all.mjs           ← daemon + Vite launcher
├── .planning/                    ← GSD scaffolding (gitignored from upstream sync)
└── .od/                          ← runtime SQLite + project artifacts (already gitignored upstream)
```

### Run / deploy

```bash
# Local dev (the daemon binds 127.0.0.1 already — Hive contract OK)
pnpm install
OD_PORT=8210 pnpm dev:all          # daemon :8210 + Vite :5173

# Production build + run on Hive
pnpm build                          # tsc -b && vite build → dist/
OD_PORT=8210 node daemon/cli.js --no-open

# Deploy
rsync to /opt/platform-apps/studio/
systemd unit: platform-app@studio.service
nginx: /etc/nginx/conf.d/apps/studio.conf  → 127.0.0.1:8210
Cloudflare tunnel: studio.drewlo.com → http://localhost:8210

# Smoke
curl -I https://studio.drewlo.com/
curl http://127.0.0.1:8210/api/health
```

## Key files & endpoints

- `daemon/server.js:159` — `startServer({ port })`, binds `127.0.0.1` ✓
- `daemon/server.js:828` — `POST /api/chat` (SSE) — agent dispatch site, currently `child_process.spawn` of CLI bins; Hive deploy needs a server-side Anthropic SDK path here
- `daemon/server.js:173` — `GET /api/health` (register as `health_path` in `app_registry` once added)
- `daemon/design-systems.js:9` — `listDesignSystems(root)` reads `design-systems/<id>/DESIGN.md`
- `src/prompts/system.ts` — composes the prompt stack with the active `DESIGN.md` injected (per upstream README §6)
- `package.json` — `"engines": { "node": ">=20 <23" }`, `"packageManager": "pnpm@9.15.9"`

## Live data source

- `.od/app.sqlite` on hive at `/opt/platform-apps/studio/.od/app.sqlite` — projects · conversations · messages · tabs · templates
- `.od/projects/<id>/` — per-project artifacts (the agent's cwd)
- `.od/artifacts/` — saved one-off renders

`.od/` is gitignored upstream and stays gitignored.

## Memory files

- `memory/project_studio.md` — canonical project memory (gotchas, decisions, Studio's claude.ai/design canvas URL once Isaac creates it)

## Gotchas

- **Daemon spawns CLI subprocesses by default** — open-design detects `claude`/`codex`/`gemini`/etc. on `PATH` and spawns them. Hive deploy will not have those bins; P1.1 adds a server-side Anthropic SDK path that bypasses the spawn.
- **Anthropic SDK 0.32.1 is too old** for current models — P1.1 bumps to current and switches default model to `claude-sonnet-latest`.
- **No auth at the daemon level** — every `/api/*` route is open by default. P1.1 adds a cookie-verify middleware in front of all routes.
- **Cookie-domain dependency** — Studio's SSO works only if the auth-service that issues `__ss_session` sets `Domain=.drewlo.com`. Verify in shapeshifter-beta's auth config before P1.1 deploy.
- **Port is ENV-driven** — `OD_PORT` is read by `daemon/cli.js`. Don't hardcode 8210; set the env var.
- **Hive app contract gaps** — open-design lacks `/metrics` (prom-client) and `pino-loki` structured logging. Set `app_registry.lifecycle = 'development'` so Sentinel skips compliance checks until those are added.
- **Upstream-merge discipline** — never push to `upstream` (push URL is `DISABLE`). Pull from upstream; keep Drewlo additions to `design-systems/goa/`, `daemon/auth-shim.js` (new), and surgical edits with clear MERGE-NOTE markers.

## Testing & visual verification

| Surface | Primary | Build / launch | Vision fallback |
|---|---|---|---|
| Web (local) | `mcp__playwright__*` (Edge) via `@john` | `OD_PORT=8210 pnpm dev:all` | Gemma 4 via `john macPerceive` |
| Web (deployed) | `mcp__playwright__*` (Edge) | `https://studio.drewlo.com/` | — |

Design verification via `/duet`: visual-diff gate ≥85% pixel parity against Studio's claude.ai/design canvas (URL captured in `.planning/duet-config.json` after Isaac creates it).

### Common flows (post-P1.1)

- **Login** → unauthenticated visit to studio.drewlo.com redirects to `https://ss.drewlo.com/login?next=https://studio.drewlo.com/`
- **Authenticated arrival** → `__ss_session` cookie present, middleware passes, app loads
- **Generate artifact** → entry view → pick skill (default `web-prototype`) → pick design system (default `goa`) → enter brief → SSE stream → preview iframe

## Design & frontend standard

**Web project — `/duet` + claude.ai/design.** Studio gets its own canvas (separate from RC1's Goa canvas — Goa is the *visual reference*, Studio's canvas is the *source of truth*). Per `feedback_canvas-is-truth.md`: when Studio's canvas exists, no other guardrail (ios26-web, IDL, shadcn defaults, Apple HIG) overrides it. Goa tokens carry forward verbatim — palette, typography, spacing, radii, glass, motion — but new chrome decisions go to the canvas first, never invented in code.

Layers:
- **Layer A** — `design-systems/goa/DESIGN.md` (prose only). The agent uses it when generating user *artifacts*. Cheap win — ships in P1.1.
- **Layer B** — open-design's own React UI (login, sidebar, chat panel, file workspace, preview iframe chrome, settings). Reskinned to Goa primitives via `/duet` against Studio's canvas. P1.2 — iterates after P1.1 deploys.

Brand identity (owner avatar, tone selector default, accent variants beyond Goa core) comes from Studio's canvas iteration. Not pre-baked.

## Hive app contract status

| Item | Status | Plan |
|---|---|---|
| 1. AUTH | ⚠ pending | P1.1 — cookie verify middleware in front of `/api/*` |
| 2. COMPANY (`APP_SLUG=studio`) | ⚠ pending | P1.1 — env var + `app_registry` row |
| 3. BUILDING filter | n/a | Studio doesn't query building-scoped data |
| 4. SCOPES | ⚠ pending | P1.1 — register `studio.use` scope in `app_registry` |
| 5. HEALTH (`/api/health`) | ✅ exists | Register `health_path` |
| 6. METRICS (`/metrics`) | ⚠ missing | P1.3 — add prom-client behind `lifecycle=development` |
| 7. LOGGING (pino-loki) | ⚠ missing | P1.3 — swap `console.*` for `createLogger()` |
| 8. BIND `127.0.0.1` | ✅ done (server.js:1087) | — |
| 9. LIFECYCLE | ⚠ pending | Set `development` in `app_registry` until P1.3 lands |

## Upstream merge contract

- `origin` = `1337group/studio` (push allowed)
- `upstream` = `nexu-io/open-design` (push **disabled**)
- Sync: `git fetch upstream && git merge upstream/main` on a feature branch; never on `main` directly.
- Drewlo additions stay in:
  - `design-systems/goa/` (new folder)
  - `daemon/auth-shim.js` (new file — P1.1)
  - Surgical edits to `daemon/server.js`, `package.json`, `vite.config.ts` marked with `// MERGE-NOTE: studio` so future merges are easy.
- `.planning/` is workspace-private; gitignored from upstream view via `.gitignore` patch.

## Related @

- `@ss` — backend twin. Studio's auth cookie comes from shapeshifter-beta's auth-service. Studio reads `app_proposals` (Δ2 from RC1 ledger) once P2.1 lands.
- `@goa` (alias for the canvas) — the visual ancestor; Goa tokens port verbatim into `design-systems/goa/DESIGN.md`.
- `@duet` — the design driver for Layer B reskin (P1.2 onward).
- `@hive` — deploy host + app contract owner.

## Recent activity

- `2026-04-29` — Forked `nexu-io/open-design` → `1337group/studio`; bootstrapped CLAUDE.md, `.planning/`, router entry, project memory.
