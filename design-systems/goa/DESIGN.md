# Goa

> Category: Enterprise · Productivity

## 1. Visual Theme & Atmosphere

Goa is Liquid Glass on quiet graphite — translucent layered chrome over a warm-cool oklch palette, system-stack typography, and an optional brand-driven gold accent. The aesthetic is tablet-first by default, scales fluidly upward from iPhone to ultrawide canvases, and treats the operating system itself as the implicit reference frame: iPadOS 26 / iOS 26 / macOS 26 (no menubar) for chrome behavior; Apple News iPadOS Today tab for editorial pacing; Liquid Glass for system-mandatory translucency on top bars, sidebars, sheets, and docks.

The system runs in two registers without breaking the core grammar. Utility surfaces — settings, profile, dashboards, admin screens — sit on a warm-grey graphite wallpaper with chrome that recedes; the content gets to lead. Editorial and welcome surfaces — landing, marketing, hero moments, knowledge primary views — pull in the warmer coast wallpaper or the editorial-leaning sunrise / forest / noon variants, where translucency does meaningful atmospheric work behind a still-quiet typographic foreground. Both registers share the same tokens, the same component primitives, and the same restraint.

Typography is the stabilizer. The full SF system stack (SF Pro Display + SF Pro Text dynamically) carries everything from 11px metadata to 56px hero display, with three tracking presets that compress at scale and relax at body size. SF Mono handles code. New York is reserved for long-form editorial body text only — never headlines. No web fonts are imported; the stack is system-only by intent, which is also why the system feels native on Apple hardware and graceful on everything else.

**Key Characteristics:**
- Liquid Glass scope is **chrome only** — top bars, sidebars, sheets, the dock; content cards stay solid
- 4pt spacing baseline (`--goa-1` 4px → `--goa-10` 72px) with semantic radii by component class (tile / card / sheet / pill)
- Single accent family per project: Goa Sea (`oklch(62% 0.158 232)`) by default, optionally overlaid with BC_GOLD (`oklch(75% 0.135 75)`) for brand-anchored work
- Five named wallpapers: `coast` (default warm-sea), `graphite` (utility default), `sunrise`, `forest`, `noon`
- Tablet as the design center: iPhone collapses to single-column; iPad fluidly scales to laptop / monitor / ultrawide. No separate desktop view, no menubar on macOS
- Lucide icon set loaded once via `lucide-static@0.452.0`; SF Symbols where the surface is native. No emoji icons in chrome.
- Drewlo knot brand mark (gold linework on near-black) used as avatar / masthead glyph on brand-anchored surfaces; plain monogram fallback elsewhere
- Light + dark parity at the token level — every `--goa-*` flips via `prefers-color-scheme` and `[data-goa-theme="dark"]`
- Motion governed by a Goa signature curve `cubic-bezier(0.32, 0.12, 0.24, 1)` plus an `ease-out` and a spring; durations 140 / 220 / 340 ms

## 2. Color Palette & Roles

Goa's palette is authored entirely in oklch for perceptual uniformity across light + dark. Hex approximations are provided alongside each token for swatch tooling; the oklch value is the source of truth. Dark-mode tokens are listed in their own subsection — every light token has a dark counterpart applied via `@media (prefers-color-scheme: dark)` and the `[data-goa-theme="dark"]` attribute.

### Background & Surface (light)
- **Background** (`#fafafa`) — `oklch(98.4% 0.003 230)` — page canvas, the default body color
- **Background Elevated** (`#ffffff`) — `oklch(100% 0 0)` — raised content beds
- **Background Sunken** (`#f3f4f5`) — `oklch(96.2% 0.004 230)` — recessed wells, code blocks, secondary panes
- **Surface** (`#ffffff`) — `oklch(100% 0 0)` — primary card and sheet fill
- **Surface 2** (`#f8f9fa`) — `oklch(97.8% 0.003 230)` — alternating list rows, subdued cards
- **Surface 3** (`#ededee`) — `oklch(95.4% 0.004 230)` — deeper utility surfaces

### Background & Surface (dark)
- **Background** (`#1a1c20`) — `oklch(13% 0.010 250)` — page canvas, dark mode
- **Background Elevated** (`#23262b`) — `oklch(17% 0.011 250)` — raised content beds
- **Background Sunken** (`#13151a`) — `oklch(10% 0.010 250)` — recessed wells
- **Surface** (`#272a30`) — `oklch(19% 0.012 250)` — primary card and sheet fill
- **Surface 2** (`#2e3138`) — `oklch(22% 0.013 250)` — alternating rows
- **Surface 3** (`#383b43`) — `oklch(26% 0.014 250)` — deeper utility

### Foreground & Text (light)
- **Foreground** (`#22252b`) — `oklch(18% 0.012 250)` — primary text
- **Foreground 2** (`#52565d`) — `oklch(38% 0.012 250)` — secondary text, helper labels
- **Foreground 3** (`#7e8189`) — `oklch(56% 0.010 250)` — tertiary metadata, placeholder
- **Foreground 4** (`#a5a8ae`) — `oklch(72% 0.008 250)` — quaternary, disabled, watermark

### Foreground & Text (dark)
- **Foreground** (`#f4f5f6`) — `oklch(97% 0.005 240)` — primary text on dark
- **Foreground 2** (`#c8cacf`) — `oklch(82% 0.008 240)` — secondary text
- **Foreground 3** (`#92959c`) — `oklch(64% 0.010 240)` — tertiary metadata
- **Foreground 4** (`#6a6c73`) — `oklch(48% 0.011 240)` — disabled / watermark

### Lines & Borders
- **Line** light (`#e2e3e6`) — `oklch(91% 0.005 240)` — default 1px divider
- **Line 2** light (`#ededef`) — `oklch(94.5% 0.004 240)` — softer divider
- **Line Strong** light (`#cfd0d3`) — `oklch(85% 0.006 240)` — input fields, segmented controls
- **Line** dark (`#3d3f47`) — `oklch(28% 0.012 250)` — default 1px divider on dark
- **Line 2** dark (`#33353d`) — `oklch(24% 0.012 250)` — softer divider on dark
- **Line Strong** dark (`#50525a`) — `oklch(36% 0.014 250)` — input fields, segmented controls on dark

### Accent — Goa Sea (default action color)
Goa Sea is the OS-native primary action and selection color. It is saturated teal-blue at light weights, slightly lifted in dark mode to maintain contrast.

- **Accent (Goa Sea)** light (`#1c8aa6`) — `oklch(62% 0.158 232)` — primary actions, selection, focus rings, active states, link color on prose
- **Accent Hover** light (`#197d97`) — `oklch(57% 0.162 232)` — hover and pressed states
- **Accent Soft** light (`#dceff7`) — `oklch(94% 0.040 232)` — accent-tinted surface (selected row, soft pill, accent badge)
- **Accent Foreground** light (`#ffffff`) — `oklch(100% 0 0)` — text/icon color when sitting on Accent
- **Accent (Goa Sea)** dark (`#3aa8c5`) — `oklch(70% 0.160 232)`
- **Accent Hover** dark (`#52b9d4`) — `oklch(76% 0.155 232)`
- **Accent Soft** dark (`#11425a`) — `oklch(28% 0.080 232)`

### System Hues (status, categorization, syntax tints)
The 12-hue system palette mirrors iOS's tint set. Use these for status pills, category chips, calendar accents, and chart legends. They are not arbitrary brand colors — keep the count of tints visible per surface low.

- **Red** (`#e34759`) — `oklch(63% 0.205 25)` — destructive, error, alert
- **Orange** (`#e79456`) — `oklch(72% 0.165 55)` — warning, work-in-progress
- **Amber** (`#dab66b`) — `oklch(80% 0.155 85)` — caution, attention (status-only utility)
- **Green** (`#5dba85`) — `oklch(68% 0.155 150)` — success, healthy, complete
- **Mint** (`#7fcec3`) — `oklch(78% 0.110 178)` — fresh, newly added, draft
- **Cyan** (`#7dc1d4`) — `oklch(72% 0.110 215)` — info, secondary signal
- **Blue** (`#1c8aa6`) — `oklch(62% 0.158 232)` — same hue as Goa Sea; reserve for non-action info
- **Indigo** (`#5c5edb`) — `oklch(54% 0.180 270)` — links in editorial, highlight
- **Purple** (`#7d57c9`) — `oklch(58% 0.190 305)` — agent / AI / model accent
- **Pink** (`#e15c8c`) — `oklch(70% 0.180 355)` — favorite, social, mention
- **Brown** (`#84715b`) — `oklch(54% 0.060 60)` — archived, meta
- **Grey** (`#92938e`) — `oklch(60% 0.008 250)` — neutral chip, disabled tint

### Brand Gold — runtime overlay (project-specific)
BC_GOLD and BC_VIP are project-specific brand accents available as primitives but not pre-applied. When a surface is brand-anchored (Drewlo project, owner affordances, branded marketing), promote BC_GOLD into the primary action position; when not, leave Goa Sea as the action color. Both tokens are typically set at runtime in JS (`window.BC_GOLD`) or at build time in the theme block.

- **Brand Gold (BC_GOLD)** (`#d2a64c`) — `oklch(75% 0.135 75)` — Drewlo knot linework, brand wordmarks, brand-anchored primary actions
- **Brand Gold VIP (BC_VIP)** (`#e5c068`) — `oklch(83% 0.155 88)` — owner / privileged affordances, gold-flagged admin sections

### Liquid Glass tokens (chrome only)
Glass tokens are RGBA on top of `var(--goa-blur-*)`. They are scoped to chrome surfaces — a top bar, a sidebar, a modal sheet, a dock, a popover. Content cards stay solid; nesting glass on glass is forbidden.

- **Glass Thin** light (`rgba(255, 255, 255, 0.42)`) — paired with `blur(18px) saturate(1.4)` — light overlays, hover surfaces
- **Glass Medium** light (`rgba(255, 255, 255, 0.58)`) — paired with `blur(24px) saturate(1.6)` — top bars, default chrome
- **Glass Thick** light (`rgba(255, 255, 255, 0.74)`) — paired with `blur(40px) saturate(1.8)` — modal sheets, large overlays
- **Glass Tint** light (`rgba(248, 250, 254, 0.55)`) — temperature shift toward cool when over warm wallpapers
- **Glass Border** light (`rgba(255, 255, 255, 0.65)`) — 1px highlight at the top edge of glass
- **Glass Stroke** light (`rgba(0, 8, 24, 0.06)`) — subtle dark hairline at the bottom edge for definition
- **Glass Thin** dark (`rgba(28, 32, 44, 0.42)`)
- **Glass Medium** dark (`rgba(28, 32, 44, 0.58)`)
- **Glass Thick** dark (`rgba(22, 25, 36, 0.78)`)
- **Glass Tint** dark (`rgba(34, 38, 52, 0.55)`)
- **Glass Border** dark (`rgba(255, 255, 255, 0.10)`)
- **Glass Stroke** dark (`rgba(255, 255, 255, 0.06)`)

### Wallpapers — five named gradients
Goa wallpapers are abstract multi-radial gradients. They sit at the page level under glass chrome and content. Apply via `applyGoaWallpaper(name, isDark)` at runtime, or via a `[data-wallpaper="<name>"]` selector.

- **Coast** (default, warm-sea) — radial blends of `oklch(82% 0.13 215)` cyan-teal, `oklch(78% 0.14 250)` blue, `oklch(86% 0.10 290)` lavender, `oklch(88% 0.09 195)` aqua, on a `linear-gradient(170deg, oklch(95% 0.045 220) → oklch(92% 0.06 245))` base. Use for landing, marketing, hero, welcome surfaces.
- **Graphite** (utility default) — warm-grey base. Use for settings, profile, admin, dashboards, or any surface where chrome should recede and content should lead. The Goa CLAUDE.md locks this as the default wallpaper for utility / settings-like work.
- **Sunrise** — warm peach + apricot, low saturation. Editorial morning surfaces.
- **Forest** — muted green + moss + slate. Editorial outdoor / serene surfaces.
- **Noon** — pale blue + cool white. Bright, neutral, midday-feel surfaces.

Dark-mode wallpapers use the same five names with lowered lightness and shifted chroma — the gradient structure is identical, the values shift to ~30-40% lightness with ~0.12-0.17 chroma so the mood is preserved without crushing readability.

## 3. Typography Rules

### Font Family
- **Sans (default)** — `var(--goa-font)` — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`
- **Mono** — `var(--goa-font-mono)` — `ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace`
- **Editorial Serif** — `var(--goa-font-serif)` — `ui-serif, "New York", "Charter", "Iowan Old Style", Georgia, serif`

The sans stack covers Display + Text dynamically — SF Pro auto-switches optical size based on rendered px. SF Mono carries code blocks, kbd chips, terminal output. New York / Charter / Iowan Old Style is reserved for long-form editorial body text only (briefings, articles, notes), accessed through the `.goa-prose` class. Headlines and titles always stay sans.

**No web fonts are imported.** The system stack is system-only by intent — no `<link rel="stylesheet">` for fonts, no `@font-face` declarations beyond what the OS already provides. The single external import in `globals.css` is the Lucide icon font (`lucide-static@0.452.0`), which is icon glyph data, not a typeface.

### Hierarchy

| Token | Size | Typical Use | Tracking |
|------|------|-------------|----------|
| `--goa-text-xs` | 11px | micro labels, kbd chips, dense table metadata | `--goa-tracking-normal` (-0.006em) |
| `--goa-text-sm` | 13px | helper text, captions, secondary metadata | `--goa-tracking-normal` |
| `--goa-text-base` | 15px | default body, list items, button labels | `--goa-tracking-normal` |
| `--goa-text-md` | 17px | emphasized body, primary list rows, sheet body | `--goa-tracking-snug` (-0.014em) |
| `--goa-text-lg` | 20px | sub-section headers, large list labels | `--goa-tracking-snug` |
| `--goa-text-xl` | 24px | section titles, card headlines | `--goa-tracking-snug` |
| `--goa-text-2xl` | 28px | tile headers, page section titles | `--goa-tracking-tight` (-0.022em) |
| `--goa-text-3xl` | 34px | feature display, surface page titles | `--goa-tracking-tight` |
| `--goa-text-4xl` | 44px | hero display, primary masthead | `--goa-tracking-tight` |
| `--goa-text-5xl` | 56px | rarely; landing-only oversized hero | `--goa-tracking-tight` |

### Tracking Presets
Three presets cover the full scale. Tracking compresses at display size to feel machined and product-first; relaxes toward neutral at body size for readability.

- **`--goa-tracking-tight`** (-0.022em) — display sizes 2xl and above
- **`--goa-tracking-snug`** (-0.014em) — sub-display sizes md / lg / xl
- **`--goa-tracking-normal`** (-0.006em) — body sizes xs / sm / base

### Line Height Convention
Default body line-height is 1.42, set on `html, body` and inherited. Display sizes (2xl+) compress to roughly 1.10-1.20 organically because the absolute leading remains generous at large sizes. The `.goa-prose` editorial class lifts to 1.6 for long-form readability.

### Weight Ladder
- **400** — body, helper text, default labels
- **500** — emphasized body, mid-weight headlines
- **600** — display sizes, primary headlines, button labels in confident states
- **700** — used sparingly; reserved for hero display and brand emphasis

Avoid mixing 600 + 700 in the same hierarchy step. Pick one and let size carry the rest.

### Editorial Body
Long-form prose surfaces (briefings, articles, notes, knowledge corpus reading view) use the `.goa-prose` class:

```
font-family: var(--goa-font-serif);
font-size: 16px;
line-height: 1.6;
letter-spacing: -0.003em;
```

Paragraph spacing is `0 0 0.7em`. Titles within editorial layouts stay sans — only the paragraph text turns serif.

### Selection & Focus
The body-level rule sets `::selection { background: var(--goa-accent); color: var(--goa-accent-fg); }` so highlighted text honors the active accent. Focus rings use `outline: 2px solid var(--goa-accent); outline-offset: 2px` — never remove the focus outline without an equivalent visual replacement.

## 4. Component Stylings

Goa ships a small set of chrome and content primitives. Each is described below by intent, key visual treatment, and when to use. There are no heavy layered abstractions — primitives compose directly into surfaces.

### Top-level chrome

#### GoaTopBar
A translucent bar pinned to the top of every surface. Renders on `--goa-glass` with `--goa-blur` saturate, a 1px `--goa-glass-border` highlight on top, and `--goa-glass-stroke` hairline on bottom. Holds the surface label, primary contextual actions on the right, and (in narrow contexts) a back chevron on the left. Height is typically 56px on iPad-class layouts and 44px on iPhone. Use it for every primary surface; do not nest GoaTopBars.

#### GoaSidebar
A collapsible vertical chrome panel. On iPad-class layouts it can sit as a 260-300px first column for navigation lists (Settings sub-pages, Knowledge corpora, Notes folders); on narrower viewports it collapses to drill-in navigation. Renders on `--goa-glass-thin` with the lighter blur, so the wallpaper bleeds through more strongly than the top bar. Holds list rows, section headers, and at most one persistent footer action. Avoid stacking sidebars; one per surface.

#### GoaThemeToggle
A two-position pill toggle that flips `[data-goa-theme]` between `light` and `dark`. Resides in chrome only — typically the top bar's right cluster or the sidebar footer. Animated via the Goa signature ease at 220ms.

#### GoaWordmark
The Goa system wordmark. Plain sans, weight 600, letter-spacing tightened by `--goa-tracking-tight`. The Drewlo-branded variant pairs the wordmark with the knot mark to its left and "by Drewlo" in BC_GOLD beneath. Used in mastheads, login screens, and the index page. Never inline in body text.

### Action surfaces

#### GoaIconButton
A circular button that hosts a single Lucide icon glyph. Default size is 40px diameter; compact is 32px; large is 48px. Background is `transparent` at rest, `--goa-surface-2` on hover, `--goa-accent-soft` on active. Icon color is `--goa-fg-2` at rest and `--goa-accent` on active. Used for top-bar actions, dock items, list-row affordances. Always 50% radius (full circle).

#### GoaShellDock
A horizontal floating dock pinned bottom-center of the viewport. **Default state is collapsed** — a single small dot/grid button (~40px) hinting at the dock. Hover expands it into the full app row with springy ease (`--goa-ease-spring`, 340ms). Scroll re-collapses. Renders on `--goa-glass-thick` with the heaviest blur. Each app slot is a `GoaIconButton`-variant with a tiny label that fades in on expand. Locked invariant per Goa CLAUDE.md: do not change the collapsed-default behavior.

#### Buttons (primary / secondary / ghost / destructive)
- **Primary**: `--goa-accent` background, `--goa-accent-fg` text, `--goa-r-md` (14px) radius, padding `--goa-2 --goa-4` (8px / 16px), weight 600, `--goa-text-base` size. Hover shifts to `--goa-accent-hover`. Brand-anchored projects swap accent for BC_GOLD via runtime override.
- **Secondary**: `--goa-surface-2` background, `--goa-fg` text, 1px `--goa-line-strong` border, same radius and padding as primary.
- **Ghost**: transparent at rest, `--goa-surface-2` on hover, no border, same radius. For low-priority inline actions.
- **Destructive**: `--goa-red` background, `--goa-accent-fg` text, otherwise primary geometry. Pair with a confirmation step in-thread for irreversible actions.

### Content surfaces

#### GoaTile
The springboard app tile. Square, `--goa-r-tile` (18px) radius, solid `--goa-surface` fill in light / `--goa-surface-2` in dark. Holds an icon glyph (or compact app mark) at top-left, a title in `--goa-text-md` weight 600, and an optional secondary line in `--goa-text-sm` `--goa-fg-3`. Shadow uses `--goa-shadow-tile`. On hover, raises a half-step via `--goa-shadow-2` with a 220ms ease. Tap target minimum 88×88px on iPhone, 96×96px on iPad. Group tiles in 4-column iPad / 2-column iPhone grids.

#### GoaCard
The general-purpose content card. Solid `--goa-surface` fill, `--goa-r-card` (20px) radius, `--goa-shadow-2` resting elevation. Padding scale: `--goa-4` (16px) compact, `--goa-5` (20px) default, `--goa-6` (24px) generous. Cards do not nest more than one level deep. Cards do not get glass treatment — that scope is chrome-only.

#### GoaSheet
A modal sheet that slides up from the bottom on iPhone or appears centered with a backdrop on iPad. Top-rounded with `--goa-r-sheet` (26px) on iPhone; uniform 26px radius on iPad. Renders on `--goa-glass-thick` with `--goa-blur-thick` and `--goa-shadow-glass`. Includes a 36×4px grabber chip centered at the top (iPhone) and a top bar with title + close / save actions. Backdrop is `rgba(0, 0, 0, 0.32)` light / `rgba(0, 0, 0, 0.55)` dark.

#### GoaPill
A horizontal capsule for badges, chips, status, filters. `--goa-r-pill` (999px) radius, padding `--goa-1 --goa-3` (4px / 12px), `--goa-text-xs` or `--goa-text-sm` weight 500. Variants:
- **Neutral**: `--goa-surface-2` background, `--goa-fg-2` text
- **Accent**: `--goa-accent-soft` background, `--goa-accent` text
- **Status**: one of the system hues at low opacity background + full color text (e.g. `oklch(63% 0.205 25 / 0.12)` background + `--goa-red` text for an error pill)

#### GoaListRow
A horizontal row in a sidebar or settings list. `--goa-text-base` label, optional leading icon (16px Lucide), optional trailing chevron or value text, height `--goa-7` (32px) compact / `--goa-8` (40px) default. Selected state: `--goa-accent-soft` background, `--goa-accent` icon + label tint. Hover state: `--goa-surface-2` background. Divider between rows is `--goa-line-2` 1px.

### Identity primitives

#### GMonogram
The fallback avatar for users without a brand mark — a `--goa-r-pill` circle with a single uppercase initial in weight 600. Background is one of the system hues at low chroma; foreground is `--goa-accent-fg` (white). Sizes mirror IconButton: 32 / 40 / 48 / 56 / 80px. Use the same hue per user across all surfaces — derived deterministically from the user's id or email.

#### GoaiPad / GoaiPhone / GoaStatusBar (device chrome for previews)
These are preview-only chrome — used inside `DesignCanvas` artboards and inside any surface that needs to render an iPad/iPhone mock (like Studio's preview pane or onboarding screens). They are not runtime UI on the app surfaces themselves. Each is a precise frame: `GoaiPad` renders an 11" iPad shape with rounded 64px corners, 1px `--goa-line-strong` outline, and a status bar. `GoaiPhone` renders an iPhone 17 Pro Max equivalent with a notch / Dynamic Island affordance. `GoaStatusBar` is 14px tall with the time at left, signal / wifi / battery icons at right, in `--goa-fg` weight 600.

### Brand mark

#### Drewlo Knot
The Drewlo knot is the brand glyph for projects anchored to Drewlo. Source asset: `assets/drewlo-knot-gold-on-black.png` (1024×1024, gold linework on black). Render rules per Goa CLAUDE.md and HANDOFF §5:

- Mount the PNG as a `background-image` on a `#0b0b0d` element (near-black square)
- Scale the image to ~74% so the knot has breathing room inside the bounding shape
- Add a thin gold ring via `box-shadow: inset 0 0 0 1px rgba(207, 161, 76, 0.5)`
- Pair with `--goa-r-pill` for circular chat avatars or `--goa-r-card` for masthead / login glyphs

The knot is used as the user / assistant avatar in chat surfaces (Studio, Ask-Goa, Messages) and as the masthead glyph on landing / login surfaces. On non-Drewlo brand contexts, default to the GMonogram fallback.

## 5. Layout Principles

### Spacing System — 4pt baseline
Every spacing decision rounds to a 4px multiple. Tokens:

| Token | Value | Typical Use |
|-------|-------|-------------|
| `--goa-1` | 4px | tight gaps, icon-to-label, pill padding-y |
| `--goa-2` | 8px | small gaps, button padding-y, list row inner gaps |
| `--goa-3` | 12px | default inline gaps, pill padding-x |
| `--goa-4` | 16px | card padding compact, button padding-x |
| `--goa-5` | 20px | card padding default, surface padding |
| `--goa-6` | 24px | card padding generous, section gaps |
| `--goa-7` | 32px | between major content blocks |
| `--goa-8` | 40px | section header above content |
| `--goa-9` | 56px | hero block padding, page top spacing |
| `--goa-10` | 72px | landing-only large breathing room |

Compose spacing through these tokens; do not invent intermediate values. If 28px feels right, you are usually wrong about the 28 — pick 24 or 32 and re-evaluate the surrounding rhythm.

### Radii System

| Token | Value | Typical Use |
|-------|-------|-------------|
| `--goa-r-xs` | 6px | inline tags, kbd chips |
| `--goa-r-sm` | 10px | small inputs, compact buttons |
| `--goa-r-md` | 14px | standard inputs, default buttons |
| `--goa-r-lg` | 18px | larger buttons, popovers |
| `--goa-r-xl` | 22px | feature panels |
| `--goa-r-2xl` | 28px | larger feature panels |
| `--goa-r-tile` | 18px | springboard tile (same as `--goa-r-lg` semantically) |
| `--goa-r-card` | 20px | content card |
| `--goa-r-sheet` | 26px | modal sheet |
| `--goa-r-pill` | 999px | pills, badges, circular buttons, monograms |

Match the radius to the component class — never apply a uniform 8px corner everywhere. A tile is 18px because it is a tile; a card is 20px because it is a card; the sheet's 26px sets it apart as a temporary surface.

### Breakpoints — two registers, fluid scaling
Goa ships **two layout registers**, not five breakpoints. The discipline is iPhone vs iPad-class — and iPad-class scales fluidly upward to laptop, monitor, and ultrawide canvases without separate desktop treatments.

| Register | Width Range | Behavior |
|----------|-------------|----------|
| iPhone | < 768px | Single-column. Full-bleed sheets slide up from bottom. Bottom-center collapsed dock. iPhone status bar / Dynamic Island affordances. Drill-in navigation (no persistent sidebar). Tap targets ≥ 44px. |
| iPad-class | ≥ 768px | Two-pane (sidebar + content) for list+detail surfaces; centered single-column for primary surfaces. Persistent top bar. Floating dock. Sheets center with backdrop. Scales fluidly through laptop (1280px) → 4K monitor (2560px) → ultrawide (3440px+). Content max-widths cap reading measure; chrome stays edge-to-edge. |

Explicitly: **no separate desktop view**. iPad scales up. **No menubar on macOS scale-up**. **No three-pane Mac layouts**. **No bottom tab bars on tablet or desktop scale**.

### Containers
Content max-width caps:
- **Reading column** (notes, articles, prose) — 720px
- **List + detail content** (knowledge, library, messages) — content area maxes around 1080px; sidebar takes 260-300px
- **Hero / landing** — 1280px max with generous outer margins
- **Springboard / tile grid** — fluid, 4-column on iPad / 2-column on iPhone, gaps `--goa-4`

Outer margins on iPad-class scale fluidly: `--goa-5` (20px) on tablet, `--goa-7` (32px) on laptop, `--goa-9` (56px) on monitor and above. The chrome (top bar, dock) is always edge-to-edge; only the content respects margin.

### Whitespace Philosophy
Goa is generous around mastheads, sparse around dense lists, deliberate around section transitions. The wallpaper does atmospheric work where shadow systems would otherwise be loud. Avoid tight padding traps in chrome — top bars get `--goa-3` to `--goa-4` vertical breathing; sidebars get `--goa-2` between rows.

## 6. Depth & Elevation

Goa's depth system is a four-level shadow scale plus two specialized shadows for glass and tile surfaces. Light-mode shadows are dark-on-light at low alpha; dark-mode shadows lean on a heavier alpha plus a 1px highlight ring.

| Token | Light value | Dark value | Use |
|-------|-------------|------------|-----|
| `--goa-shadow-1` | `0 1px 2px rgba(8, 12, 28, 0.04), 0 1px 1px rgba(8, 12, 28, 0.03)` | `0 1px 2px rgba(0, 0, 0, 0.35)` | inputs, segmented controls, resting buttons |
| `--goa-shadow-2` | `0 4px 12px rgba(8, 12, 28, 0.06), 0 1px 2px rgba(8, 12, 28, 0.04)` | `0 4px 12px rgba(0, 0, 0, 0.40)` | resting cards, popovers, hovered tiles |
| `--goa-shadow-3` | `0 12px 28px rgba(8, 12, 28, 0.08), 0 2px 6px rgba(8, 12, 28, 0.04)` | `0 12px 28px rgba(0, 0, 0, 0.50)` | hovered cards, active surfaces, raised modules |
| `--goa-shadow-4` | `0 24px 56px rgba(8, 12, 28, 0.14), 0 4px 12px rgba(8, 12, 28, 0.06)` | `0 24px 56px rgba(0, 0, 0, 0.55)` | feature spotlights, heavy hero modules |
| `--goa-shadow-glass` | `0 18px 48px rgba(8, 12, 28, 0.18), 0 2px 6px rgba(8, 12, 28, 0.06)` | `0 18px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)` | sheets, dock, glass overlays |
| `--goa-shadow-tile` | `0 2px 10px rgba(8, 12, 28, 0.10), 0 1px 2px rgba(8, 12, 28, 0.04)` | `0 2px 10px rgba(0, 0, 0, 0.50), 0 0 0 1px rgba(255, 255, 255, 0.04)` | springboard tiles |

### Liquid Glass Scope
Liquid Glass treatment applies only to chrome — top bars, sidebars, modal sheets, the dock, popovers anchored to chrome. Content cards (GoaCard, GoaTile) stay solid. Nesting glass on glass (e.g. a glass popover anchored to a glass top bar) requires deliberate stroke + shadow tuning to prevent muddy double-blur; the simpler answer is to avoid the nesting.

### Blur Tiers

| Token | Value | Use |
|-------|-------|-----|
| `--goa-blur-thin` | `blur(18px) saturate(1.4)` | hover surfaces, subtle overlays, top bar at low contrast |
| `--goa-blur` | `blur(24px) saturate(1.6)` | default chrome — top bar, sidebar |
| `--goa-blur-thick` | `blur(40px) saturate(1.8)` | sheets, dock, full-screen overlays |

Saturation lifts saturate values above 1.0 because blur tends to mute colors; the lift restores chromatic energy without becoming an effect of its own.

### Accessibility — focus rings
Focus rings use `outline: 2px solid var(--goa-accent); outline-offset: 2px` — never remove without replacement. Keyboard focus is a non-negotiable affordance; the rule is enforced in chrome and content alike. For surfaces sitting on top of accent-colored backgrounds, switch the outline color to `var(--goa-accent-fg)` to maintain contrast.

### Motion Curves & Durations

| Token | Value | Typical Use |
|-------|-------|-------------|
| `--goa-ease` | `cubic-bezier(0.32, 0.12, 0.24, 1)` | Goa signature curve — default for most chrome and content motion |
| `--goa-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | quick decelerate-only, dismissals, fade-outs |
| `--goa-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | dock expand, sheet appear, playful confirmations (use sparingly) |
| `--goa-dur-fast` | 140ms | hover state changes, color flips |
| `--goa-dur` | 220ms | default — open / close, layout shifts |
| `--goa-dur-slow` | 340ms | spring expansions, sheet appearance, dock open |

Avoid > 400ms motion. Avoid bouncy springs on text or layout shifts — reserve them for affordances.

## 7. Do's and Don'ts

### Do
- **Use the oklch token system** for every color decision. Bind `--goa-*` at `:root` and reference via `var()`.
- **Use the SF system stack** through `var(--goa-font)`. No `<link>` for web fonts.
- **Use Lucide icons** — already loaded via `lucide-static@0.452.0` in `globals.css`. Or SF Symbols where the surface is native.
- **Apply Liquid Glass to chrome only** — top bars, sidebars, sheets, dock, popovers anchored to chrome. Content cards stay solid.
- **Default to the `graphite` wallpaper** for utility / settings-like / dashboard surfaces. Coast/cyan reads too playful for chrome work.
- **Default to `coast`** for marketing / hero / welcome surfaces. Sunrise / forest / noon for editorial-leaning surfaces.
- **Keep the GoaShellDock collapsed by default**. Hover expands. Scroll re-collapses. Locked invariant.
- **Use iPadOS top-tab / dropdown navigation patterns**, not desktop menubars or bottom tab bars on tablet / desktop scale.
- **Use `claude-sonnet-latest` only** for any agent-mode work. Never `claude-haiku-*` anywhere — not in agent configs, model labels, "powered by" footers, demo data, or UI copy.
- **Use BC_GOLD when the surface is brand-anchored**; use Goa Sea (`var(--goa-accent)`) when not. Never run both as primary action color in the same surface.
- **Use the Drewlo knot** as the brand mark on brand-anchored Drewlo surfaces, rendered per the §4 Brand Mark rules. Use GMonogram fallback elsewhere.
- **Pick the radius from the component class** — tile is 18, card is 20, sheet is 26, pill is 999. Don't flatten everything to one number.
- **Match the dark-mode token to the light-mode token** by purpose — every `--goa-*` flips through `prefers-color-scheme: dark` and `[data-goa-theme="dark"]`.

### Don't
- **Don't invent new tokens.** Extend `:root` with new `--goa-*` keys only when the existing scale truly cannot represent the value. Prefer composition.
- **Don't use emoji icons in chrome** — top bar, sidebar, dock, settings rows. Status / toggles / chips use words or Lucide / SF Symbols. Emoji in product UI undercuts the quiet/serious tone.
- **Don't hardcode hex values** outside the palette. Every color must trace back to a `--goa-*` token or a documented runtime brand override (BC_GOLD / BC_VIP).
- **Don't ship aggressive purple gradients** as backgrounds, splashes, or accent fills. They read as AI-slop and are the most reliable tell of an un-considered design.
- **Don't use rounded cards with left-border accent stripes** as a general pattern. It's a Bootstrap-era tic. Status uses pills or in-line color treatments instead.
- **Don't draw human figures by hand in SVG** for illustrations. Use real photography, abstract shapes, or commissioned vector — never wonky stick figures or generic stock-art people.
- **Don't reach for Inter** as a display face. The SF system stack is non-negotiable; Inter has different metrics and breaks the optical balance.
- **Don't apply uniform 8px corners** to everything. Match the component class.
- **Don't put bottom tab bars** on tablet or desktop-scale layouts. Top tabs / sidebar / inline controls for those scales.
- **Don't add a menubar on macOS scale-up**. The system is iPadOS at iPad-class and stays that way as the canvas grows.
- **Don't nest glass on glass** without deliberate stroke + shadow tuning. The simpler fix is to avoid the nesting entirely.
- **Don't reference `claude-haiku-*` anywhere** — it is a system-wide invariant. Sonnet is the ceiling and the floor.
- **Don't ship parallel `feedback` / `support` / `help` FABs** on the same surface. There is one Ask-Goa entry point per surface; classification happens after.

## 8. Responsive Behavior

Goa runs on a strict two-register discipline — iPhone vs iPad-class — with iPad-class scaling fluidly upward through laptop, monitor, and ultrawide canvases. There are no separate "desktop" or "macOS" breakpoints; the iPad layout is the desktop layout, and it grows with the viewport.

### Register transitions

| Register | Width | Layout | Chrome | Navigation |
|----------|-------|--------|--------|------------|
| iPhone | < 768px | Single-column, modal sheets slide up | Top bar 44px, no persistent sidebar, collapsed-dock bottom-center | Drill-in stack |
| iPad-class | ≥ 768px | Two-pane (sidebar + content) or centered single-column | Top bar 56px, persistent sidebar where applicable, floating dock | Sidebar + top tabs + inline controls |

### Viewport-driven Type Scaling
SF Pro auto-switches between Display + Text optical sizes based on rendered px. The `--goa-text-*` scale stays constant across breakpoints — what scales is how much vertical room you give the line. Avoid responsive font-size step-downs unless the headline genuinely won't fit; SF compresses gracefully.

### Touch Targets
Minimum touchable region is 44×44px on iPhone, 40×40px on iPad-class. GoaIconButton honors this via its 40px default. Tile minimums are 88×88px on iPhone and 96×96px on iPad — the brand-anchored tile reads slightly larger by design.

### Collapsing Strategy
- Multi-column tile grids collapse from 4-column iPad to 2-column iPhone with a single CSS Grid `auto-fit` rule
- Two-pane list+detail collapses to drill-in: tap a list row, navigate to the detail full-screen, back chevron returns
- Top-bar action clusters compress: secondary actions move into an overflow menu (Lucide `more-horizontal`)
- Sheets transition from centered modal (iPad-class) to bottom slide-up (iPhone) automatically based on viewport
- Sidebars collapse to drill-in navigation; on iPad-class they can also collapse to icon-only for narrower content

### Image Behavior
- Hero / cover imagery preserves aspect ratio through breakpoints; the framing shifts so the subject stays centered
- Tile thumbnails crop to square consistently, with content scaled to fit
- Editorial images on prose surfaces use a 16:9 default with full-bleed option on iPad-class

### What does NOT change
- Token system (every `--goa-*` is identical across viewports)
- Color values, glass thickness, blur amounts
- The dock's collapsed-default behavior
- The chrome-only Liquid Glass scope
- Wallpaper choice (graphite for utility, coast for marketing, etc.)
- Brand mark rendering rules

## 9. Agent Prompt Guide

When generating a user-facing artifact (deck, dashboard, landing page, internal tool, prototype) inside Studio under the Goa system, follow these steps in order.

### Step 1 — Read this DESIGN.md fully
Before writing any markup or styles, read all nine sections. The token names, the chrome-only Liquid Glass scope, the wallpaper defaults, the brand-mark rules, and the do/don't list are load-bearing — guessing any of them produces drift.

### Step 2 — Bind tokens at `:root`
Open the artifact's CSS with the full `:root { --goa-* … }` block from `globals.css`. Every color, spacing, radius, shadow, blur, motion, and wallpaper value flows through a token. **Never inline a hex value outside the palette.** When the artifact must inherit BC_GOLD (brand-anchored work), append `--goa-brand-gold: oklch(75% 0.135 75);` to the `:root` block and reference via `var(--goa-brand-gold)`.

### Step 3 — Use the SF system stack via `var(--goa-font)`
No `<link>` tags for web fonts. The stack is `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`. SF Pro auto-switches Display + Text based on rendered px, so the same stack covers 11px metadata to 56px hero. Mono is `var(--goa-font-mono)`. Editorial serif (`var(--goa-font-serif)`) is reserved for long-form body via the `.goa-prose` class — never headlines.

### Step 4 — Pick the action color
For brand-anchored work (Drewlo project, owner affordances, branded marketing surfaces): use BC_GOLD (`oklch(75% 0.135 75)`) for primary actions and the Drewlo knot for the brand mark. For non-brand work (general productivity surfaces, internal tools without a Drewlo brand voice): use Goa Sea (`var(--goa-accent)`) and the GMonogram fallback. **Never run both as primary action color in the same surface.**

### Step 5 — Apply glass to chrome only
Liquid Glass treatment (`--goa-glass-*` + `--goa-blur-*` + `--goa-glass-border` + `--goa-glass-stroke`) applies only to top bars, sidebars, sheets, the dock, and popovers anchored to chrome. **Content cards stay solid** — `--goa-surface` fill, `--goa-shadow-2` resting elevation, `--goa-r-card` (20px) corners. If you find yourself wanting glass on a content card, reconsider; the answer is almost always solid.

### Step 6 — Pick the wallpaper by surface intent
- `graphite` — settings, profile, admin, dashboards, utility chrome (Goa default for utility per CLAUDE.md)
- `coast` — landing, marketing, hero, welcome, springboard
- `sunrise` — editorial morning surfaces, warm onboarding
- `forest` — editorial outdoor / serene / focus surfaces
- `noon` — neutral midday tone, brighter editorial

Apply via `applyGoaWallpaper(name, isDark)` at runtime, or set `[data-wallpaper="<name>"]` on the body and let CSS handle it. Do not invent a sixth wallpaper.

### Step 7 — Self-critique before emitting
Score the draft 1-5 in five dimensions before declaring done. Anything under 3/5 is a regression — fix and re-score before emitting.

| Dimension | What you're scoring |
|-----------|---------------------|
| **Philosophy** | Does this feel like Goa — quiet graphite, restrained chrome, system-stack typography? Or did it slip into a generic SaaS look? |
| **Hierarchy** | Is the most important action the most visible? Are headlines clearly above subheads, subheads above body? Does the eye land where it should? |
| **Execution** | Are the tokens correct? Right radius for component class? Right wallpaper for surface intent? Right shadow tier? |
| **Specificity** | Are the choices intentional and justified, or did defaults stack up unexamined? |
| **Restraint** | Did you avoid the AI-slop tells — purple gradients, emoji icons, wonky stick-figure illustrations, uniform 8px corners, three flavors of accent fighting for attention? |

### Step 8 — Use Lucide icons via the icon font
Lucide is loaded once at the top of `globals.css` via `@import "https://unpkg.com/lucide-static@0.452.0/font/lucide.css"`. Reference an icon by class, e.g. `<i class="lucide lucide-search"></i>`. Sizing helper: `.lucide` sets `line-height: 1` and `display: inline-block`. Icon size flows from the parent font-size — set on the parent or wrap in a sized container. **Never invent emoji icons** for chrome.

### Final invariant — model identifier
When generating any system-prompt or model-identifier reference (agent base fields, "powered by" footers, model labels in chat headers, agent cards, settings panes), use **`claude-sonnet-latest` exclusively**. Never `claude-haiku-*` anywhere — not in demo data, agent configs, UI copy, fallback labels, or comments. If the artifact requests a "fast" or "cheap" model variant, reject the framing and use Sonnet.

### Quick Color Reference

- **Primary action (default)**: Accent / Goa Sea (`oklch(62% 0.158 232)` light · `oklch(70% 0.160 232)` dark)
- **Primary action (brand-anchored)**: BC_GOLD (`oklch(75% 0.135 75)`)
- **Owner / privileged affordances**: BC_VIP (`oklch(83% 0.155 88)`)
- **Page canvas**: `--goa-bg` (`oklch(98.4% 0.003 230)` light · `oklch(13% 0.010 250)` dark)
- **Card / sheet fill**: `--goa-surface` (`oklch(100% 0 0)` light · `oklch(19% 0.012 250)` dark)
- **Primary text**: `--goa-fg` (`oklch(18% 0.012 250)` light · `oklch(97% 0.005 240)` dark)
- **Secondary text**: `--goa-fg-2` (`oklch(38% 0.012 250)` light · `oklch(82% 0.008 240)` dark)
- **Default divider**: `--goa-line` (`oklch(91% 0.005 240)` light · `oklch(28% 0.012 250)` dark)
- **Destructive**: `--goa-red` (`oklch(63% 0.205 25)`)
- **Success**: `--goa-green` (`oklch(68% 0.155 150)`)

### Example Component Prompts
- "Compose a settings landing on the `graphite` wallpaper with a translucent top bar (`--goa-glass` + `--goa-blur`), a 280px sidebar of GoaListRow entries, and a content pane of GoaCards at `--goa-r-card` 20px radius, `--goa-shadow-2` resting elevation, padding `--goa-5`."
- "Build a brand-anchored login on the `coast` wallpaper with the Drewlo knot rendered per §4 rules at the masthead, GoaWordmark pairing, and a primary CTA in BC_GOLD (`oklch(75% 0.135 75)`) at `--goa-r-md` 14px radius."
- "Compose an internal dashboard on `graphite` with a 4-column GoaTile grid for app entries (each 18px radius, `--goa-shadow-tile`) and a centered top bar with surface label + `more-horizontal` overflow."
- "Compose a knowledge corpus detail surface with a sidebar of bound sources (folder / tag / manual), a centered content pane of GoaCards listing effective files, and a `--goa-glass-thick` modal sheet for the source-add flow on iPad-class layouts."

### Iteration Guide
1. Lock the token block first — `:root` with the full `--goa-*` set. Do not ship a draft that hardcodes a hex outside the palette.
2. Choose the wallpaper based on surface intent — utility surfaces almost always default to `graphite`.
3. Decide brand-anchor vs not — pick BC_GOLD or Goa Sea as the action color, never both, and never mid-page.
4. Tune typography in this order: page title (xl / 2xl), section headers (lg / xl), body (base / md), micro labels (xs / sm). Match tracking preset to size class.
5. Place chrome (top bar, sidebar, dock) — apply Liquid Glass treatment.
6. Place content (cards, tiles, lists) — solid fills, `--goa-shadow-2` rest, `--goa-shadow-3` hover.
7. Run the self-critique pass (Step 7). Fix anything under 3/5 before declaring done.

### Known Constraints
- `--goa-text-5xl` (56px) is rarely correct outside of landing-only oversized hero. If the artifact is not a landing page, `--goa-text-4xl` (44px) is almost always the better hero size.
- Three-pane layouts (sidebar + secondary sidebar + content) are not part of the system. If a surface needs more than two panes, the surface design is wrong for Goa — split it into two surfaces or collapse the secondary into a popover anchored to chrome.
- The system has no "compact" / "comfortable" / "spacious" density toggle. Density is decided per surface and stays consistent across viewports.
- Multi-color category systems (e.g. each project gets its own brand color) work against the system; pick neutral chrome and let category names + iconography carry the differentiation.

### Final invariant (model identifier — repeated for emphasis)
**Use `claude-sonnet-latest` only. Never `claude-haiku-*` anywhere.** This applies to agent `base:` fields, model labels in chat headers, agent cards, settings panes, "powered by" footers in surfaces like Ask-Goa, demo data, and UI copy. If you find any string that violates this, treat it as a bug and fix it.
