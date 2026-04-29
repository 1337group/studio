# Studio · ShapeShifter

> **Fork-and-ship workspace apps with a code-agent at your side.** Studio is the build/fork/review/ship loop for the ShapeShifter workspace at Drewlo. Pick an existing workspace app, propose changes, watch the live preview re-render, ship through dev → beta → prod with the workspace owner as the gate.

Internal tool for the Drewlo workspace. Lives at **[studio.drewlo.com](https://studio.drewlo.com)**.

## What it is

| | |
|---|---|
| Surface | Web app served from Hive (`172.16.1.77:8210`) behind a Cloudflare tunnel |
| Auth | Cookie-based SSO (`__ss_session` on `.drewlo.com`) — sign in once at ss.drewlo.com |
| AI | Claude (server-side, no BYOK on this deployment) |
| Design | Goa — see [`design-systems/goa/DESIGN.md`](design-systems/goa/DESIGN.md) |
| License | Apache-2.0 (carries forward from upstream) |

## Upstream

Studio is a **Goa-skinned fork** of [`nexu-io/open-design`](https://github.com/nexu-io/open-design) (the open-source alternative to claude.ai/design). The daemon, skills library, design-system loader, and chat-driven generation pipeline come from upstream verbatim. Drewlo additions:

- `design-systems/goa/` — the Drewlo design language
- `daemon/auth-shim.js` — cookie-verifying middleware in front of `/api/*`
- `src/lib/goa/` — Goa primitives (tokens, wallpapers, AskGoa FAB)
- Surgical edits to `daemon/server.js`, `package.json`, `vite.config.ts`, `index.html`, `src/i18n/locales/*` — all marked with `// MERGE-NOTE: studio` for upstream merge tractability

We sync from upstream on a feature branch (`git fetch upstream && git merge upstream/main`); we never push back. See [`CLAUDE.md`](CLAUDE.md) §Upstream merge contract for the full discipline.

## Run

```bash
pnpm install
OD_PORT=8210 pnpm dev:all       # daemon :8210 + Vite :5173
```

Production build:

```bash
pnpm build                       # tsc -b && vite build → dist/
OD_PORT=8210 node daemon/cli.js --no-open
```

Deploy to Hive: `rsync` to `/opt/platform-apps/studio/`, then `systemctl restart platform-app@studio`.

## Architecture

See [`CLAUDE.md`](CLAUDE.md) for the full project memory — directory shape, key files, gotchas, deploy patterns, and Hive app contract status.

## License

Apache-2.0. Copyright on upstream-authored files remains with the original authors (see `LICENSE`); Drewlo modifications are also Apache-2.0.

Forked from [`nexu-io/open-design`](https://github.com/nexu-io/open-design) — thanks to the upstream maintainers for the daemon and the loop.
