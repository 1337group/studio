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

See [`CLAUDE.md`](CLAUDE.md) for the Drewlo fork's project memory — directory shape, key files, gotchas, deploy patterns, and Hive app contract status. Upstream's architecture diagram below is the open-design baseline.


```
┌────────────────────────── browser ─────────────────────────────┐
│                                                                │
│   Next.js 16 App Router  (chat · file workspace · iframe preview) │
│                                                                │
└──────────────┬───────────────────────────────────┬─────────────┘
               │ /api/* (rewritten in dev)         │ direct (BYOK)
               ▼                                   ▼
   ┌──────────────────────┐              ┌──────────────────────┐
   │   Local daemon       │              │   Anthropic SDK      │
   │   (Express + SQLite) │              │   (browser fallback) │
   │                      │              └──────────────────────┘
   │   /api/agents        │
   │   /api/skills        │
   │   /api/design-systems│
   │   /api/projects/...  │
   │   /api/chat (SSE)    │
   │                      │
   └─────────┬────────────┘
             │ spawn(cli, [...], { cwd: .od/projects/<id> })
             ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  claude · codex · cursor-agent · gemini · opencode · qwen · copilot│
   │  reads SKILL.md + DESIGN.md, writes artifacts to disk              │
   └────────────────────────────────────────────────────────────────────┘
```

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 App Router + React 18 + TypeScript |
| Daemon | Node 20–22 · Express · SSE streaming · `better-sqlite3` for projects/conversations/messages/tabs |
| Agent transport | `child_process.spawn` with typed-event parsers for Claude Code (`claude-stream-json`) and Copilot CLI (`copilot-stream-json`); line-buffered plain stdout for the rest |
| Storage | Plain files in `.od/projects/<id>/` + SQLite at `.od/db.sqlite` (gitignored) |
| Preview | Sandboxed iframe via `srcdoc` + per-skill `<artifact>` parser |
| Export | HTML (inline assets) · PDF (browser print) · PPTX (skill-defined) · ZIP (archiver) |

## Quickstart

```bash
git clone https://github.com/nexu-io/open-design.git
cd open-design
nvm use              # uses Node 22 from .nvmrc
corepack enable
pnpm install
pnpm dev:all         # daemon (:7456) + Next dev (:3000)
open http://localhost:3000
```

The first load:

1. Detects which agent CLIs you have on `PATH` and picks one automatically.
2. Loads 19 skills + 71 design systems.
3. Pops the welcome dialog so you can paste an Anthropic key (only needed for the BYOK fallback path).
4. **Auto-creates `./.od/`** — the local runtime folder for the SQLite project DB, per-project artifacts, and saved renders. There is no `od init` step; the daemon `mkdir`s everything it needs on boot.

Type a prompt, hit **Send**, watch the question form arrive, fill it, watch the todo card stream, watch the artifact render. Click **Save to disk** or download as a project ZIP.

### First-run state (`./.od/`)

The daemon owns one hidden folder at the repo root. Everything in it is gitignored and machine-local — never commit it.

```
.od/
├── app.sqlite                 ← projects · conversations · messages · open tabs
├── artifacts/                 ← one-off "Save to disk" renders (timestamped)
└── projects/<id>/             ← per-project working dir, also the agent's cwd
```

| Want to… | Do this |
|---|---|
| Inspect what's in there | `ls -la .od && sqlite3 .od/app.sqlite '.tables'` |
| Reset to a clean slate | stop the daemon, `rm -rf .od`, run `pnpm dev:all` again |
| Move it elsewhere | not supported yet — the path is hard-coded relative to the repo |

Full file map, scripts, and troubleshooting → [`QUICKSTART.md`](QUICKSTART.md).

## Repository structure

```
open-design/
├── README.md                      ← this file
├── README.zh-CN.md                ← 简体中文
├── QUICKSTART.md                  ← run / build / deploy guide
├── package.json                   ← pnpm workspace, single bin: od
│
├── daemon/                        ← Node + Express, the only server
│   ├── cli.js                     ← `od` bin entry point
│   ├── server.js                  ← /api/* routes (projects, chat, files, exports)
│   ├── agents.js                  ← PATH scanner + per-CLI argv builders
│   ├── claude-stream.js           ← streaming JSON parser for Claude Code stdout
│   ├── skills.js                  ← SKILL.md frontmatter loader
│   ├── design-systems.js          ← DESIGN.md loader + swatch extractor
│   ├── design-system-preview.js   ← live one-shot showcase per system
│   ├── design-system-showcase.js  ← multi-section gallery render
│   ├── lint-artifact.js           ← P0/P1 self-check on agent output
│   ├── projects.js                ← per-project filesystem helpers
│   ├── db.js                      ← SQLite schema (projects/messages/templates/tabs)
│   └── frontmatter.js             ← zero-dep YAML-subset parser
│
├── app/                           ← Next.js 16 App Router entrypoints
│   ├── layout.tsx                 ← root layout shell
│   ├── page.tsx                   ← main app entry
│   └── [[...slug]]/page.tsx       ← catch-all client shell for project routes
│
├── src/                           ← shared React + TS client modules for Next.js
│   ├── App.tsx                    ← routing, bootstrap, settings
│   ├── components/                ← 27 components (chat, composer, picker, preview, sketch, …)
│   ├── prompts/
│   │   ├── system.ts              ← composeSystemPrompt(base, skill, DS, metadata)
│   │   ├── official-system.ts     ← identity charter
│   │   ├── discovery.ts           ← turn-1 form + turn-2 branch + 5-dim critique
│   │   ├── directions.ts          ← 5 visual directions × OKLch palette + font stack
│   │   └── deck-framework.ts      ← deck nav / counter / print stylesheet
│   ├── artifacts/
│   │   ├── parser.ts              ← streaming <artifact> tag extractor
│   │   └── question-form.ts       ← <question-form> JSON schema + replay
│   ├── runtime/
│   │   ├── srcdoc.ts              ← iframe sandbox wrapper
│   │   ├── markdown.tsx           ← assistant message renderer
│   │   ├── exports.ts             ← HTML / PDF / ZIP export helpers
│   │   └── zip.ts                 ← project archive
│   ├── providers/
│   │   ├── daemon.ts              ← /api/chat SSE stream consumer
│   │   ├── anthropic.ts           ← BYOK Anthropic SDK path
│   │   └── registry.ts            ← /api/agents, /api/skills, /api/design-systems
│   └── state/                     ← config + projects (localStorage + daemon-backed)
│
├── skills/                        ← 19 SKILL.md skill bundles
│   ├── web-prototype/             ← default for prototype mode
│   ├── saas-landing/              ← marketing page (hero / features / pricing / CTA)
│   ├── dashboard/                 ← admin / analytics
│   ├── pricing-page/              ← standalone pricing + comparison
│   ├── docs-page/                 ← 3-column documentation
│   ├── blog-post/                 ← editorial long-form
│   ├── mobile-app/                ← phone-frame screen(s)
│   ├── simple-deck/               ← horizontal-swipe minimal
│   ├── guizang-ppt/               ← bundled magazine-web-ppt (default for deck)
│   │   ├── SKILL.md
│   │   ├── assets/template.html   ← seed
│   │   └── references/{themes,layouts,components,checklist}.md
│   ├── pm-spec/                   ← PM specification doc
│   ├── weekly-update/             ← team weekly
│   ├── meeting-notes/             ← decision log
│   ├── eng-runbook/               ← incident / runbook
│   ├── finance-report/            ← exec summary
│   ├── hr-onboarding/             ← role onboarding
│   ├── invoice/                   ← single-page invoice
│   ├── kanban-board/              ← board snapshot
│   ├── mobile-onboarding/         ← multi-screen mobile flow
│   └── team-okrs/                 ← OKR scoresheet
│
├── design-systems/                ← 71 DESIGN.md systems
│   ├── default/                   ← Neutral Modern (starter)
│   ├── warm-editorial/            ← Warm Editorial (starter)
│   ├── linear-app/  vercel/  stripe/  airbnb/  notion/  cursor/  apple/  …
│   └── README.md                  ← catalog overview
│
├── assets/
│   └── frames/                    ← shared device frames (used cross-skill)
│       ├── iphone-15-pro.html
│       ├── android-pixel.html
│       ├── ipad-pro.html
│       ├── macbook.html
│       └── browser-chrome.html
│
├── templates/
│   └── deck-framework.html        ← deck baseline (nav / counter / print)
│
├── next.config.ts                 ← dev rewrites + prod static export to out/
│
├── scripts/
│   └── sync-design-systems.mjs    ← re-import upstream awesome-design-md tarball
│
├── docs/
│   ├── spec.md                    ← product spec, scenarios, differentiation
│   ├── architecture.md            ← topologies, data flow, components
│   ├── skills-protocol.md         ← extended SKILL.md od: frontmatter
│   ├── agent-adapters.md          ← per-CLI detection + dispatch
│   ├── modes.md                   ← prototype / deck / template / design-system
│   ├── references.md              ← long-form provenance
│   ├── roadmap.md                 ← phased delivery
│   ├── schemas/                   ← JSON schemas
│   └── examples/                  ← canonical artifact examples
│
└── .od/                           ← runtime data, gitignored, auto-created
    ├── app.sqlite                 ← projects / conversations / messages / tabs
    ├── projects/<id>/             ← per-project working folder (agent's cwd)
    └── artifacts/                 ← saved one-off renders
```

## Design Systems

<p align="center">
  <img src="docs/assets/design-systems-library.png" alt="The 71 design systems library — style guide spread" width="100%" />
</p>

71 systems out of the box, each as a single [`DESIGN.md`](design-systems/README.md):

<details>
<summary><b>Full catalog</b> (click to expand)</summary>

**AI & LLM** — `claude` · `cohere` · `mistral-ai` · `minimax` · `together-ai` · `replicate` · `runwayml` · `elevenlabs` · `ollama` · `x-ai`

**Developer Tools** — `cursor` · `vercel` · `linear-app` · `framer` · `expo` · `clickhouse` · `mongodb` · `supabase` · `hashicorp` · `posthog` · `sentry` · `warp` · `webflow` · `sanity` · `mintlify` · `lovable` · `composio` · `opencode-ai` · `voltagent`

**Productivity** — `notion` · `figma` · `miro` · `airtable` · `superhuman` · `intercom` · `zapier` · `cal` · `clay` · `raycast`

**Fintech** — `stripe` · `coinbase` · `binance` · `kraken` · `mastercard` · `revolut` · `wise`

**E-Commerce** — `shopify` · `airbnb` · `uber` · `nike` · `starbucks` · `pinterest`

**Media** — `spotify` · `playstation` · `wired` · `theverge` · `meta`

**Automotive** — `tesla` · `bmw` · `ferrari` · `lamborghini` · `bugatti` · `renault`

**Other** — `apple` · `ibm` · `nvidia` · `vodafone` · `sentry` · `resend` · `spacex`

**Starters** — `default` (Neutral Modern) · `warm-editorial`

</details>

The library is imported via [`scripts/sync-design-systems.mjs`](scripts/sync-design-systems.mjs) from [`VoltAgent/awesome-design-md`][acd2]. Re-run to refresh.

## Visual directions

When the user has no brand spec, the agent emits a second form with five curated directions — the OD adaptation of [`huashu-design`'s "5 schools × 20 design philosophies" fallback](https://github.com/alchaincyf/huashu-design#%E8%AE%BE%E8%AE%A1%E6%96%B9%E5%90%91%E9%A1%BE%E9%97%AE-fallback). Each direction is a deterministic spec — palette in OKLch, font stack, layout posture cues, references — that the agent binds verbatim into the seed template's `:root`. One radio click → a fully specified visual system. No improvisation, no AI-slop.

| Direction | Mood | Refs |
|---|---|---|
| Editorial — Monocle / FT | Print magazine, ink + cream + warm rust | Monocle · FT Weekend · NYT Magazine |
| Modern minimal — Linear / Vercel | Cool, structured, minimal accent | Linear · Vercel · Stripe |
| Tech utility | Information density, monospace, terminal | Bloomberg · Bauhaus tools |
| Brutalist | Raw, oversized type, no shadows, harsh accents | Bloomberg Businessweek · Achtung |
| Soft warm | Generous, low contrast, peachy neutrals | Notion marketing · Apple Health |

Full spec → [`src/prompts/directions.ts`](src/prompts/directions.ts).

## Anti-AI-slop machinery

The whole machinery below is the [`huashu-design`](https://github.com/alchaincyf/huashu-design) playbook, ported into OD's prompt-stack and made enforceable per-skill via the side-file pre-flight. Read [`src/prompts/discovery.ts`](src/prompts/discovery.ts) for the live wording:

- **Question form first.** Turn 1 is `<question-form>` only — no thinking, no tools, no narration. The user chooses defaults at radio speed.
- **Brand-spec extraction.** When the user attaches a screenshot or URL, the agent runs a five-step protocol (locate · download · grep hex · codify `brand-spec.md` · vocalise) before writing CSS. **Never guesses brand colors from memory.**
- **Five-dim critique.** Before emitting `<artifact>`, the agent silently scores its output 1–5 across philosophy / hierarchy / execution / specificity / restraint. Anything under 3/5 is a regression — fix and rescore. Two passes is normal.
- **P0/P1/P2 checklist.** Every skill ships a `references/checklist.md` with hard P0 gates. The agent must pass P0 before emitting.
- **Slop blacklist.** Aggressive purple gradients, generic emoji icons, rounded card with left-border accent, hand-drawn SVG humans, Inter as a *display* face, invented metrics — explicitly forbidden in the prompt.
- **Honest placeholders > fake stats.** When the agent doesn't have a real number, it writes `—` or a labelled grey block, not "10× faster".

## Comparison

| Axis | [Claude Design][cd] (Anthropic) | [Open CoDesign][ocod] | **Open Design** |
|---|---|---|---|
| License | Closed | MIT | **Apache-2.0** |
| Form factor | Web (claude.ai) | Desktop (Electron) | **Web app + local daemon** |
| Deployable on Vercel | ❌ | ❌ | **✅** |
| Agent runtime | Bundled (Opus 4.7) | Bundled ([`pi-ai`][piai]) | **Delegated to user's existing CLI** |
| Skills | Proprietary | 12 custom TS modules + `SKILL.md` | **19 file-based [`SKILL.md`][skill] bundles, droppable** |
| Design system | Proprietary | `DESIGN.md` (v0.2 roadmap) | **`DESIGN.md` × 71 systems shipped** |
| Provider flexibility | Anthropic only | 7+ via [`pi-ai`][piai] | **Whatever your agent supports** |
| Init question form | ❌ | ❌ | **✅ Hard rule, turn 1** |
| Direction picker | ❌ | ❌ | **✅ 5 deterministic directions** |
| Live todo progress + tool stream | ❌ | ✅ | **✅** (UX pattern from open-codesign) |
| Sandboxed iframe preview | ❌ | ✅ | **✅** (pattern from open-codesign) |
| Comment-mode surgical edits | ❌ | ✅ | 🚧 roadmap (lift from open-codesign) |
| AI-emitted tweaks panel | ❌ | ✅ | 🚧 roadmap (lift from open-codesign) |
| Filesystem-grade workspace | ❌ | partial (Electron sandbox) | **✅ Real cwd, real tools, persisted SQLite** |
| 5-dim self-critique | ❌ | ❌ | **✅ Pre-emit gate** |
| Export formats | Limited | HTML / PDF / PPTX / ZIP / Markdown | **HTML / PDF / PPTX / ZIP / Markdown** |
| PPT skill reuse | N/A | Built-in | **[`guizang-ppt-skill`][guizang] drops in** |
| Minimum billing | Pro / Max / Team | BYOK | **BYOK** |

[cd]: https://x.com/claudeai/status/2045156267690213649
[ocod]: https://github.com/OpenCoworkAI/open-codesign
[piai]: https://github.com/mariozechner/pi-ai
[acd]: https://github.com/VoltAgent/awesome-claude-design
[guizang]: https://github.com/op7418/guizang-ppt-skill
[skill]: https://docs.anthropic.com/en/docs/claude-code/skills

## Supported coding agents

Auto-detected from `PATH` on daemon boot. No config required.

| Agent | Bin | Streaming | Notes |
|---|---|---|---|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `claude` | `--output-format stream-json` (typed events) | First-class — best fidelity |
| [Codex CLI](https://github.com/openai/codex) | `codex` | line-buffered | `codex exec <prompt>` |
| [Cursor Agent](https://www.cursor.com/cli) | `cursor-agent` | line-buffered | `cursor-agent -p` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `gemini` | line-buffered | `gemini -p` |
| [OpenCode](https://opencode.ai/) | `opencode` | line-buffered | `opencode run` |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | `qwen` | line-buffered | `qwen -p` |
| [GitHub Copilot CLI](https://github.com/features/copilot/cli) | `copilot` | `--output-format json` (typed events) | `copilot -p <prompt> --allow-all-tools --output-format json` |
| Anthropic API · BYOK | n/a | SSE direct | Browser fallback when no CLI is on PATH |

Adding a new CLI is one entry in [`daemon/agents.js`](daemon/agents.js). Streaming format is one of `claude-stream-json` (typed events) or `plain` (raw text).

## References & lineage

Every external project this repo borrows from. Each link goes to the source so you can verify the provenance.

| Project | Role here |
|---|---|
| [`Claude Design`][cd] | The closed-source product this repo is the open-source alternative to. |
| [**`alchaincyf/huashu-design`**](https://github.com/alchaincyf/huashu-design) | The design-philosophy core. Junior-Designer workflow, the 5-step brand-asset protocol, anti-AI-slop checklist, 5-dimensional self-critique, and the "5 schools × 20 design philosophies" library behind our direction picker — all distilled into [`src/prompts/discovery.ts`](src/prompts/discovery.ts) and [`src/prompts/directions.ts`](src/prompts/directions.ts). |
| [**`op7418/guizang-ppt-skill`**][guizang] | Magazine-web-PPT skill bundled verbatim under [`skills/guizang-ppt/`](skills/guizang-ppt/) with original LICENSE preserved. Default for deck mode. P0/P1/P2 checklist culture borrowed for every other skill. |
| [**`multica-ai/multica`**](https://github.com/multica-ai/multica) | The daemon + adapter architecture. PATH-scan agent detection, local daemon as the only privileged process, agent-as-teammate worldview. We adopt the model; we do not vendor the code. |
| [**`OpenCoworkAI/open-codesign`**][ocod] | The first open-source Claude-Design alternative and our closest peer. UX patterns adopted: streaming-artifact loop, sandboxed-iframe preview (vendored React 18 + Babel), live agent panel (todos + tool calls + interruptible), five-format export list (HTML/PDF/PPTX/ZIP/Markdown), local-first storage hub, `SKILL.md` taste-injection. UX patterns on our roadmap: comment-mode surgical edits, AI-emitted tweaks panel. **We deliberately do not vendor [`pi-ai`][piai]** — open-codesign bundles it as the agent runtime; we delegate to whichever CLI the user already has. |
| [`VoltAgent/awesome-claude-design`][acd] / [`awesome-design-md`][acd2] | Source of the 9-section `DESIGN.md` schema and 69 product systems imported via [`scripts/sync-design-systems.mjs`](scripts/sync-design-systems.mjs). |
| [`farion1231/cc-switch`](https://github.com/farion1231/cc-switch) | Inspiration for symlink-based skill distribution across multiple agent CLIs. |
| [Claude Code skills][skill] | The `SKILL.md` convention adopted verbatim — any Claude Code skill drops into `skills/` and is picked up by the daemon. |

Long-form provenance write-up — what we take from each, what we deliberately don't — lives at [`docs/references.md`](docs/references.md).

## Roadmap

- [x] Daemon + agent detection + skill registry + design-system catalog
- [x] Web app + chat + question form + todo progress + sandboxed preview
- [x] 19 skills + 71 design systems + 5 visual directions + 5 device frames
- [x] SQLite-backed projects · conversations · messages · tabs · templates
- [ ] Comment-mode surgical edits (click element → instruction → patch) — pattern from [`open-codesign`][ocod]
- [ ] AI-emitted tweaks panel (model surfaces the parameters worth tweaking) — pattern from [`open-codesign`][ocod]
- [ ] Vercel + tunnel deployment recipe (Topology B)
- [ ] One-command `npx od init` to scaffold a project with `DESIGN.md`
- [ ] Skill marketplace (`od skills install <github-repo>`)

Phased delivery → [`docs/roadmap.md`](docs/roadmap.md).

## Status

This is an early implementation — the closed loop (detect → pick skill + design system → chat → parse `<artifact>` → preview → save) runs end-to-end. The prompt stack and skill library are where most of the value lives, and they're stable. The component-level UI is shipping daily.

## Star us

<p align="center">
  <a href="https://github.com/nexu-io/open-design"><img src="docs/assets/star-us.png" alt="Star Open Design on GitHub — github.com/nexu-io/open-design" width="100%" /></a>
</p>

If this saved you thirty minutes — give it a ★. Stars don't pay rent, but they tell the next designer, agent, and contributor that this experiment is worth their attention. One click, three seconds, real signal: [github.com/nexu-io/open-design](https://github.com/nexu-io/open-design).

## Contributing

Issues, PRs, new skills, and new design systems are all welcome. The highest-leverage contributions are usually one folder, one Markdown file, or one PR-sized adapter:

- **Add a skill** — drop a folder into [`skills/`](skills/) following the [`SKILL.md`][skill] convention.
- **Add a design system** — drop a `DESIGN.md` into [`design-systems/<brand>/`](design-systems/) using the 9-section schema.
- **Wire up a new coding-agent CLI** — one entry in [`daemon/agents.js`](daemon/agents.js).

Full walkthrough, bar-for-merging, code style, and what we don't accept → [`CONTRIBUTING.md`](CONTRIBUTING.md) ([简体中文](CONTRIBUTING.zh-CN.md)).

## License

Apache-2.0. Copyright on upstream-authored files remains with the original authors (see `LICENSE`); Drewlo modifications are also Apache-2.0.

Forked from [`nexu-io/open-design`](https://github.com/nexu-io/open-design) — thanks to the upstream maintainers for the daemon and the loop.
