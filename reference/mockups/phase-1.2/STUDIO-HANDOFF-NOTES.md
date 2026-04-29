# Studio handoff — 2026-04-29

Bundle authored from the Goa canvas (project `d864d214-4473-4b7f-abc0-a14e2bea85eb`)
for porting into `projects/hive/studio/` on the Drewlo side.

Studio's surface set is intentionally small: **login + studio + Ask Goa
FAB**. The full Goa shell (springboard, dock, messages, library, files,
notes, me, sandbox) is **not** part of Studio. Studio re-skins only the
React UI that wraps open-design's three-pane shape: chat panel + file
workspace + preview iframe.

---

## What's in this bundle

```
studio-handoff-2026-04-29/
├── studio.html                  Surface 09 — 5 artboards, the canvas itself
├── login.html                   Surface 10 — same login Studio uses
├── ask-goa.html                 Universal FAB — Studio mounts this
├── globals.css                  Token sheet (source of truth)
├── design-canvas.jsx            (root copy — kept because studio.html and
│                                 login.html reference both `design-canvas.jsx`
│                                 and `components/design-canvas.jsx`; see notes)
├── assets/
│   └── drewlo-knot-gold-on-black.png
├── components/
│   ├── tokens.jsx               GoaTokens, GIcon, GMonogram, gToneFor
│   ├── wallpapers.jsx           GoaWallpapers, applyGoaWallpaper(...)
│   ├── chrome.jsx               GoaWordmark and other shared chrome bits
│   ├── goa-shell.jsx            GoaShellDock + shared shell wrapper
│   ├── feedback-bot.jsx         Legacy BCFeedbackBot (pre-AskGoa) — see notes
│   ├── ask-goa.jsx              AskGoa FAB — current Goa-wide chat surface
│   ├── design-canvas.jsx        DesignCanvas, DCSection, DCArtboard
│   ├── studio-data.jsx          Mock data for studio.html artboards
│   └── studio-panes.jsx         StdPropose, StdAppDetail, StdScratch,
│                                 StdLaunch, StdReview
└── design-systems/
    └── goa/
        └── DESIGN.md            Verbatim extraction from globals.css +
                                 tokens.jsx + wallpapers.jsx + CLAUDE.md
```

---

## Goa primitives Studio inherits verbatim

These ride into Studio with no edits. If Studio needs to diverge from
any of them, fork inside Studio's repo — do not patch the Goa originals.

### Design language (from `globals.css` + `components/tokens.jsx`)

- All `--goa-*` CSS custom properties — palette, type scale, spacing,
  radii, shadows, motion, glass, wallpaper var
- `[data-goa-theme="light|dark"]` override classes
- `.goa-glass`, `.goa-glass-thin`, `.goa-glass-thick`, `.goa-wallpaper`,
  `.goa-prose` utility classes
- Body / selection / scrollbar defaults
- `GoaTokens` JS surface (when components want named tokens instead of
  CSS vars)
- `GIcon` (Lucide icon font helper)
- `GMonogram` + `gToneFor` (deterministic tone-from-seed avatars)

### Wallpapers (`components/wallpapers.jsx`)

- `GoaWallpapers` dictionary (six gradients, light + dark each)
- `applyGoaWallpaper(key, isDark)`, `applyGoaWallpaperImage(url)`

Studio surfaces should use **`coast`** by default (per Goa convention).
The Studio settings pane (when added) should use **`graphite`** — same
rule as `me.html`, utility chrome stays warm-grey.

### Chrome (`components/chrome.jsx`)

- `GoaWordmark` — used in the page header strip on every Goa surface
  page (the strip above the design canvas, not chrome that ships in
  the real app). Studio's canvas page mounts this verbatim.

### Shell (`components/goa-shell.jsx`)

- `GoaShellDock` — floating dot/grid → expanded app dock. **Studio
  does not mount the dock** in the published app shell (Studio is
  full-screen claude.ai-style chat-on-left + canvas-on-right; no
  springboard dock concept). Keep the file in the bundle anyway so
  Studio's canvas page (`studio.html`) can render the surface inside
  artboards consistently with the rest of the Goa canvas.

### FAB (`components/ask-goa.jsx` + `ask-goa.html`)

- `AskGoa` — universal floating chat surface. Studio mounts this on
  every Studio route. Page-context provider lives in Studio: it should
  emit the current app being edited (id, name), the current
  workspace file in focus, the current preview state (dev/beta/prod),
  and any pending diff metadata. Goa-as-coach reads that context.

### Login (`login.html`)

Studio uses the exact same login surface as RC1. Drop in unchanged.
Wire the MSAL primary CTA to Studio's `__ss_session` cookie shim.

---

## Goa primitives Studio explicitly **skips**

Listed for clarity so the porter doesn't accidentally pull these in:

- `springboard.html` / `springboard.jsx` — Studio has no app launcher
- `messages.html` / `messages.jsx` — Studio has no chat-with-people
- `library.html` + `library-data.jsx` + `library-tweaks.jsx` —
  agent/persona/library catalog is a Goa concern, not Studio's
- `files.html` + `files*.jsx` — Studio's file workspace is open-design's
  workspace tree, not the Goa Files surface
- `notes.html` + `notes*.jsx` — out of scope
- `me.html` + `me*.jsx` — owner profile / settings live in Goa
- `sandbox.html` + `sandbox*.jsx` — internal scratchpad
- `app-switcher.html` + `app-switcher-*.jsx` — covered by GoaShellDock
  semantics, which Studio doesn't mount
- `feedback-bot.jsx` — kept in the bundle only because `goa-shell.jsx`
  still falls back to it (see carry-forward §1). Studio should mount
  `AskGoa` directly and not import `feedback-bot.jsx`.

---

## Hard constraints (paste verbatim every porting cycle)

These match Drewlo project conventions in `CLAUDE.md`. Restate them in
Studio's own `CLAUDE.md` so any Claude session running against the
Studio repo inherits them without a cross-project read.

1. **NO emoji anywhere, ever.** Status selectors, toggles, agent
   labels, marketing copy, error states — words or icons (Lucide), never
   emoji.
2. **NO mock personas / mock widget content** beyond the minimum
   placeholder needed to make a layout legible. No "Sarah Chen sent you
   a message" demo bait. Studio is a tool, not a showcase.
3. **SF Pro system stack only.** No web fonts. The exact stack lives in
   `--goa-font` in `globals.css`. Editorial body uses `--goa-font-serif`
   (Apple system "New York") for prose paragraphs only.
4. **Lucide icons or inline SVG only.** Lucide ships via the
   `lucide-static@0.452.0` icon font imported in `globals.css`. No
   Heroicons, no Phosphor, no Material, no custom icon families.
5. **Models:** `claude-sonnet-latest` everywhere. Never pin specific
   Sonnet versions (e.g. `claude-sonnet-4-5`). Never reference
   `claude-haiku-*` anywhere in demo data, agent configs, UI copy, or
   labels.
6. **Owner identity:** Allan Drewlo, `allan@drewlo.com`, Owner role,
   no pronouns, no emoji in profile / status / settings copy.
7. **Drewlo knot rendering:** PNG as `background-image` on a `#0b0b0d`
   element, scaled to ~74% of the container, with
   `inset 0 0 0 1px rgba(207, 161, 76, 0.5)` for the gold ring. Never
   stretch or recolor the knot itself.

---

## Reconciling DESIGN.md against Studio's repo copy

Studio v0.1.0 already has `design-systems/goa/DESIGN.md` from P1.1 —
that one is Studio Claude's interpretation. **The version in this
bundle is the canonical extraction** and should overwrite it.

When the Goa canvas re-issues DESIGN.md (any time `globals.css`,
`tokens.jsx`, or `wallpapers.jsx` changes), repeat the same
overwrite. Goa is the upstream; Studio mirrors.

---

## Carry-forward — drift / gaps spotted while assembling this bundle

**Per the anti-drift clause: logged here, NOT fixed in this bundle.**
File these as Studio repo issues or Goa P-tickets as you see fit.

### 1. Stale fallback to `BCFeedbackBot` in `goa-shell.jsx`

`components/goa-shell.jsx` (lines ~433–436 and ~503–506) renders
`AskGoa` when present and falls back to `BCFeedbackBot` when not.
Both branches still exist:

```js
{showFeedback && typeof AskGoa === 'function' ? (
  <AskGoa surface={surface} route={route} />
) : showFeedback && typeof BCFeedbackBot === 'function' ? (
  <BCFeedbackBot surface={surface} route={route} />
) : null}
```

`AskGoa` is now the universal FAB across Goa. The `BCFeedbackBot`
fallback is dead in any surface that loads `ask-goa.jsx` — and
loading `ask-goa.jsx` is now the Goa default. Remove the fallback
branch in a future Goa cleanup pass; once removed, `feedback-bot.jsx`
can be deleted entirely from the project (no other consumer).

### 2. Direct `BCFeedbackBot` mounts in `springboard.jsx` and `messages.jsx`

```
components/springboard.jsx:852  <BCFeedbackBot surface="Springboard" .../>
components/springboard.jsx:940  <BCFeedbackBot surface="Springboard (iPhone)" .../>
components/messages.jsx:1225    <BCFeedbackBot surface="Messages · iMessage" .../>
components/messages.jsx:1269    <BCFeedbackBot surface="Messages · Hybrid" .../>
```

These bypass `GoaShellDock` and mount `BCFeedbackBot` directly,
predating the AskGoa migration. They should be migrated to `AskGoa`
(or just to mounting `GoaShellDock` like the other surfaces do) so
the universal FAB story is actually universal in Goa. Doesn't affect
Studio (Studio doesn't import either surface), but worth fixing
upstream so DESIGN.md and the running canvas agree.

### 3. Two copies of `design-canvas.jsx`

The Goa canvas has **both** `./design-canvas.jsx` (project root) and
`./components/design-canvas.jsx`. `studio.html` references the
`components/` copy; `login.html` references the root copy; other
surface pages are inconsistent. Both copies appear to be in sync but
this is fragile. Pick one canonical location (recommend
`components/design-canvas.jsx`) and update all surface pages to point
at it. The bundle ships **both** copies to avoid breaking either
HTML file mid-port.

### 4. No carry-forward items found in:

- Token files (`globals.css`, `tokens.jsx`, `wallpapers.jsx`) — clean
- `chrome.jsx`, `studio-data.jsx`, `studio-panes.jsx` — clean
- Drewlo-knot asset — clean
- DESIGN.md vs CLAUDE.md alignment — clean

---

## Porting checklist for the Drewlo side

When you drop this into `projects/hive/studio/`:

1. Mirror file paths verbatim. `globals.css` at the web root,
   `components/*.jsx` under `components/`, knot PNG at
   `assets/drewlo-knot-gold-on-black.png`.
2. Overwrite Studio's existing `design-systems/goa/DESIGN.md` with this
   bundle's copy.
3. Studio's React entry should import `globals.css` first, then mount
   `AskGoa` at the root layout (so it floats over every Studio route).
4. Wire `usePageContext()` providers per Studio surface (chat pane,
   workspace tree, preview iframe state, diff metadata).
5. Confirm the MSAL primary CTA in `login.html` points at Studio's
   `__ss_session` cookie shim, not the RC1 demo handler.
6. Studio's settings pane (whenever it lands) opts in to the
   `graphite` wallpaper, not `coast`.
7. Re-verify the seven hard constraints above before merging.

---

— end of handoff notes —
