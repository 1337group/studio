# ShapeShifter Studio

Goa-skinned fork of [`nexu-io/open-design`](https://github.com/nexu-io/open-design) — the build / fork / review / ship loop inside the ShapeShifter platform.

Live: https://studio.drewlo.com (internal, behind SSO).

## What this fork adds (overlay)

- ShapeShifter brand identity (knot logo, Goa design tokens, brand strings)
- SSO via shared `__ss_session` cookie on `.drewlo.com` (verified by `daemon/auth-shim`)
- 30-day sliding silent refresh (Microsoft-style "stay signed in")
- Server-side Anthropic SDK dispatch (`daemon/anthropic-server`) so chat works without local CLI bins
- Goa-designed Studio canvas at `?canvas=goa`

## Maintenance handbook

`agents/studio/CLAUDE.md` in the Isaac AI workspace. Overlay recipe at `agents/studio/customization/`.

## Sync upstream

The skin is applied as an overlay every sync, not merged into upstream commits. See `agents/studio/CLAUDE.md` "Upstream sync — overlay strategy" section. Never `git merge upstream/main` against committed Drewlo additions.

## License

Apache-2.0, inherited from upstream nexu-io/open-design.
