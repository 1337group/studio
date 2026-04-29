# Goa — Design System

**Canonical source of truth for the Goa visual language (RC1-P1).**
This file is a verbatim extraction from the working Goa canvas. The
sources of truth in code are `globals.css`, `components/tokens.jsx`,
and `components/wallpapers.jsx`. If those three files and this
document ever disagree, the code wins — re-extract this file.

Aesthetic: frosted-chrome, OS-native, light + dark parity. System
font stack only. No web fonts imported. Quiet, serious, utility-grade.

---

## 1. Type

### Stacks

```
--goa-font:       -apple-system, BlinkMacSystemFont, "SF Pro Display",
                  "SF Pro Text", "Helvetica Neue", system-ui, sans-serif
--goa-font-mono:  ui-monospace, "SF Mono", Menlo, Monaco,
                  "Cascadia Mono", monospace
--goa-font-serif: ui-serif, "New York", "Charter", "Iowan Old Style",
                  Georgia, serif
```

`--goa-font-serif` (Apple system "New York") is reserved for long-form
prose only — briefings, articles, notes paragraph text. Titles,
labels, and chrome stay sans.

### Scale

| Token              | px   |
|--------------------|------|
| `--goa-text-xs`    | 11   |
| `--goa-text-sm`    | 13   |
| `--goa-text-base`  | 15   |
| `--goa-text-md`    | 17   |
| `--goa-text-lg`    | 20   |
| `--goa-text-xl`    | 24   |
| `--goa-text-2xl`   | 28   |
| `--goa-text-3xl`   | 34   |
| `--goa-text-4xl`   | 44   |
| `--goa-text-5xl`   | 56   |

### Tracking

| Token                     | em       |
|---------------------------|----------|
| `--goa-tracking-tight`    | -0.022   |
| `--goa-tracking-snug`     | -0.014   |
| `--goa-tracking-normal`   | -0.006   |

Body default is `--goa-tracking-normal` at `--goa-text-base`,
line-height 1.42, antialiased.

### Editorial body

```css
.goa-prose {
  font-family: var(--goa-font-serif);
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.003em;
}
```

---

## 2. Spacing — 4pt baseline

| Token        | px |
|--------------|----|
| `--goa-1`    | 4  |
| `--goa-2`    | 8  |
| `--goa-3`    | 12 |
| `--goa-4`    | 16 |
| `--goa-5`    | 20 |
| `--goa-6`    | 24 |
| `--goa-7`    | 32 |
| `--goa-8`    | 40 |
| `--goa-9`    | 56 |
| `--goa-10`   | 72 |

---

## 3. Radii

| Token              | px  | Use                  |
|--------------------|-----|----------------------|
| `--goa-r-xs`       | 6   | inline chips         |
| `--goa-r-sm`       | 10  | buttons, inputs      |
| `--goa-r-md`       | 14  | small cards          |
| `--goa-r-lg`       | 18  | panels               |
| `--goa-r-xl`       | 22  | large panels         |
| `--goa-r-2xl`      | 28  | sheets               |
| `--goa-r-tile`     | 18  | app tile (springboard) |
| `--goa-r-card`     | 20  | content card         |
| `--goa-r-sheet`    | 26  | modal sheet          |
| `--goa-r-pill`     | 999 | pills, monograms     |

---

## 4. Color — Light

### Surfaces

| Token                | Value                       |
|----------------------|-----------------------------|
| `--goa-bg`           | `oklch(98.4% 0.003 230)`    |
| `--goa-bg-elev`      | `oklch(100% 0 0)`           |
| `--goa-bg-sunken`    | `oklch(96.2% 0.004 230)`    |
| `--goa-surface`      | `oklch(100% 0 0)`           |
| `--goa-surface-2`    | `oklch(97.8% 0.003 230)`    |
| `--goa-surface-3`    | `oklch(95.4% 0.004 230)`    |

### Foreground

| Token            | Value                     |
|------------------|---------------------------|
| `--goa-fg`       | `oklch(18% 0.012 250)`    |
| `--goa-fg-2`     | `oklch(38% 0.012 250)`    |
| `--goa-fg-3`     | `oklch(56% 0.010 250)`    |
| `--goa-fg-4`     | `oklch(72% 0.008 250)`    |

### Lines

| Token                  | Value                     |
|------------------------|---------------------------|
| `--goa-line`           | `oklch(91% 0.005 240)`    |
| `--goa-line-2`         | `oklch(94.5% 0.004 240)`  |
| `--goa-line-strong`    | `oklch(85% 0.006 240)`    |

### Accent — Goa Sea

A saturated teal-blue, OS-native feel.

| Token                  | Value                     |
|------------------------|---------------------------|
| `--goa-accent`         | `oklch(62% 0.158 232)`    |
| `--goa-accent-hover`   | `oklch(57% 0.162 232)`    |
| `--goa-accent-soft`    | `oklch(94% 0.040 232)`    |
| `--goa-accent-fg`      | `oklch(100% 0 0)`         |

### System hues

| Token              | Value                     |
|--------------------|---------------------------|
| `--goa-red`        | `oklch(63% 0.205 25)`     |
| `--goa-orange`     | `oklch(72% 0.165 55)`     |
| `--goa-amber`      | `oklch(80% 0.155 85)`     |
| `--goa-green`      | `oklch(68% 0.155 150)`    |
| `--goa-mint`       | `oklch(78% 0.110 178)`    |
| `--goa-cyan`       | `oklch(72% 0.110 215)`    |
| `--goa-blue`       | `oklch(62% 0.158 232)`    |
| `--goa-indigo`     | `oklch(54% 0.180 270)`    |
| `--goa-purple`     | `oklch(58% 0.190 305)`    |
| `--goa-pink`       | `oklch(70% 0.180 355)`    |
| `--goa-brown`      | `oklch(54% 0.060 60)`     |
| `--goa-grey`       | `oklch(60% 0.008 250)`    |

---

## 5. Color — Dark

### Surfaces

| Token                | Value                       |
|----------------------|-----------------------------|
| `--goa-bg`           | `oklch(13% 0.010 250)`      |
| `--goa-bg-elev`      | `oklch(17% 0.011 250)`      |
| `--goa-bg-sunken`    | `oklch(10% 0.010 250)`      |
| `--goa-surface`      | `oklch(19% 0.012 250)`      |
| `--goa-surface-2`    | `oklch(22% 0.013 250)`      |
| `--goa-surface-3`    | `oklch(26% 0.014 250)`      |

### Foreground

| Token            | Value                     |
|------------------|---------------------------|
| `--goa-fg`       | `oklch(97% 0.005 240)`    |
| `--goa-fg-2`     | `oklch(82% 0.008 240)`    |
| `--goa-fg-3`     | `oklch(64% 0.010 240)`    |
| `--goa-fg-4`     | `oklch(48% 0.011 240)`    |

### Lines

| Token                  | Value                     |
|------------------------|---------------------------|
| `--goa-line`           | `oklch(28% 0.012 250)`    |
| `--goa-line-2`         | `oklch(24% 0.012 250)`    |
| `--goa-line-strong`    | `oklch(36% 0.014 250)`    |

### Accent (dark)

| Token                  | Value                     |
|------------------------|---------------------------|
| `--goa-accent`         | `oklch(70% 0.160 232)`    |
| `--goa-accent-hover`   | `oklch(76% 0.155 232)`    |
| `--goa-accent-soft`    | `oklch(28% 0.080 232)`    |

System hues (red/orange/amber/…) are reused unchanged from light.

### Theme override

`[data-goa-theme="dark"]` and `[data-goa-theme="light"]` on `<html>`
explicitly force a theme, overriding `prefers-color-scheme`.

---

## 6. Liquid Glass — chrome only

Used for floating chrome (top bars, docks, sheets, popovers).
Never use glass for content cards.

### Light

```
--goa-glass-thin:    rgba(255, 255, 255, 0.42)
--goa-glass:         rgba(255, 255, 255, 0.58)
--goa-glass-thick:   rgba(255, 255, 255, 0.74)
--goa-glass-tint:    rgba(248, 250, 254, 0.55)
--goa-glass-border:  rgba(255, 255, 255, 0.65)
--goa-glass-stroke:  rgba(0, 8, 24, 0.06)
```

### Dark

```
--goa-glass-thin:    rgba(28, 32, 44, 0.42)
--goa-glass:         rgba(28, 32, 44, 0.58)
--goa-glass-thick:   rgba(22, 25, 36, 0.78)
--goa-glass-tint:    rgba(34, 38, 52, 0.55)
--goa-glass-border:  rgba(255, 255, 255, 0.10)
--goa-glass-stroke:  rgba(255, 255, 255, 0.06)
```

### Blur

```
--goa-blur-thin:   blur(18px) saturate(1.4)
--goa-blur:        blur(24px) saturate(1.6)
--goa-blur-thick:  blur(40px) saturate(1.8)
```

### Utility classes

```css
.goa-glass        { background: var(--goa-glass);
                    backdrop-filter: var(--goa-blur);
                    border: 1px solid var(--goa-glass-border); }
.goa-glass-thin   { background: var(--goa-glass-thin);
                    backdrop-filter: var(--goa-blur-thin); }
.goa-glass-thick  { background: var(--goa-glass-thick);
                    backdrop-filter: var(--goa-blur-thick); }
```

`-webkit-backdrop-filter` mirrors every `backdrop-filter` for Safari.

---

## 7. Shadows

### Light

| Token                  | Value                                                                  |
|------------------------|------------------------------------------------------------------------|
| `--goa-shadow-1`       | `0 1px 2px rgba(8,12,28,.04), 0 1px 1px rgba(8,12,28,.03)`             |
| `--goa-shadow-2`       | `0 4px 12px rgba(8,12,28,.06), 0 1px 2px rgba(8,12,28,.04)`            |
| `--goa-shadow-3`       | `0 12px 28px rgba(8,12,28,.08), 0 2px 6px rgba(8,12,28,.04)`           |
| `--goa-shadow-4`       | `0 24px 56px rgba(8,12,28,.14), 0 4px 12px rgba(8,12,28,.06)`          |
| `--goa-shadow-glass`   | `0 18px 48px rgba(8,12,28,.18), 0 2px 6px rgba(8,12,28,.06)`           |
| `--goa-shadow-tile`    | `0 2px 10px rgba(8,12,28,.10), 0 1px 2px rgba(8,12,28,.04)`            |

### Dark

| Token                  | Value                                                                  |
|------------------------|------------------------------------------------------------------------|
| `--goa-shadow-1`       | `0 1px 2px rgba(0,0,0,.35)`                                            |
| `--goa-shadow-2`       | `0 4px 12px rgba(0,0,0,.40)`                                           |
| `--goa-shadow-3`       | `0 12px 28px rgba(0,0,0,.50)`                                          |
| `--goa-shadow-4`       | `0 24px 56px rgba(0,0,0,.55)`                                          |
| `--goa-shadow-glass`   | `0 18px 48px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04)`         |
| `--goa-shadow-tile`    | `0 2px 10px rgba(0,0,0,.50), 0 0 0 1px rgba(255,255,255,.04)`          |

---

## 8. Motion

| Token                | Value                                  |
|----------------------|----------------------------------------|
| `--goa-ease`         | `cubic-bezier(0.32, 0.12, 0.24, 1)`    |
| `--goa-ease-out`     | `cubic-bezier(0.16, 1, 0.3, 1)`        |
| `--goa-ease-spring`  | `cubic-bezier(0.34, 1.56, 0.64, 1)`    |
| `--goa-dur-fast`     | `140ms`                                |
| `--goa-dur`          | `220ms`                                |
| `--goa-dur-slow`     | `340ms`                                |

`--goa-ease` is the Goa signature curve — use it for everything that
isn't explicitly entrance/spring.

---

## 9. Wallpapers

Six abstract gradient wallpapers ship in the system. All have light
and dark variants. Set via `applyGoaWallpaper(key, isDark)` from
`components/wallpapers.jsx`, or replace with a user image via
`applyGoaWallpaperImage(url)`.

| Key         | Character                         |
|-------------|-----------------------------------|
| `coast`     | Default — warm coast palette      |
| `dune`      | Sand / amber / muted pink         |
| `forest`    | Mint / cyan / green               |
| `rose`      | Pink / coral / plum               |
| `graphite`  | Warm-grey, near-monochrome        |
| `aurora`    | Mint → indigo → cyan, high chroma |

**Default per surface convention (from `CLAUDE.md`):**

- App-like surfaces (springboard, messages, library, notes, files,
  studio): `coast`
- Settings-like / utility chrome (`me.html`): `graphite` — cyan reads
  too playful for utility chrome

Custom user images are stored as `--goa-wallpaper:
url("...") center/cover no-repeat` on `:root`.

---

## 10. Iconography

**Lucide only.** The system imports `lucide-static@0.452.0` as an
icon font in `globals.css`:

```css
@import "https://unpkg.com/lucide-static@0.452.0/font/lucide.css";
```

Use the `GIcon` helper from `components/tokens.jsx`:

```jsx
<GIcon name="search" size={18} />
```

Inline SVG is acceptable when you need to break out (e.g. a custom
glyph), but never bring in another icon family. No emoji in chrome.

---

## 11. Avatars / monograms

`GMonogram` from `components/tokens.jsx` renders a 1–2 letter
monogram on a tinted background. Tone is hashed from a seed string
via `gToneFor(seed)` so a given name always renders the same color.
This is the system's stand-in any time a person/agent has no real
image yet.

Available tones: `blue`, `indigo`, `purple`, `pink`, `red`, `orange`,
`amber`, `green`, `mint`, `cyan`, `grey`.

---

## 12. Brand mark — the Drewlo knot

Asset: `assets/drewlo-knot-gold-on-black.png` (gold linework on a
black square, 1024×1024).

When used as an avatar or floating action button:

- Render the PNG as a `background-image` on a `#0b0b0d` element
- Scale to ~74% so the knot has breathing room inside the circle
- Add `inset 0 0 0 1px rgba(207, 161, 76, 0.5)` for a thin gold ring

```css
.drewlo-mark {
  background: #0b0b0d url("/assets/drewlo-knot-gold-on-black.png")
              center / 74% no-repeat;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(207, 161, 76, 0.5),
              var(--goa-shadow-2);
}
```

---

## 13. Body, selection, scrollbars

```css
* { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0;
  background: var(--goa-bg);
  color: var(--goa-fg);
  font-family: var(--goa-font);
  font-size: var(--goa-text-base);
  line-height: 1.42;
  letter-spacing: var(--goa-tracking-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

::selection { background: var(--goa-accent); color: var(--goa-accent-fg); }

::-webkit-scrollbar         { width: 10px; height: 10px; }
::-webkit-scrollbar-track   { background: transparent; }
::-webkit-scrollbar-thumb   {
  background: var(--goa-line-strong);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--goa-fg-4);
  background-clip: padding-box;
  border: 2px solid transparent;
}
```

---

## 14. Project-wide conventions (from `CLAUDE.md`)

These ride along with the design system across every Drewlo project.

### Models

Use `claude-sonnet-latest` everywhere. Do not pin specific Sonnet
versions (e.g. `claude-sonnet-4-5`). Do not use Haiku at all — never
reference `claude-haiku-*` anywhere in demo data, agent configs, UI
copy, or labels.

### User identity

The demo workspace owner is **Allan Drewlo** (`allan@drewlo.com`).
Role: Owner. No pronouns displayed. No emojis in profile / status /
settings copy.

### Emojis

Avoid emojis in product UI copy unless the user explicitly asks. The
Drewlo brand reads quiet/serious — emoji noise undercuts that. Status
selectors, toggles, etc. should use words or icons, not emoji.

### Wallpaper default

`me.html` and other "settings-like" surfaces use the **graphite**
wallpaper (warm-grey), not coast/cyan. The cyan tint reads too playful
for utility chrome.

### Dock behavior

The shared dock (`GoaShellDock` in `components/goa-shell.jsx`) starts
**collapsed by default** — small dot/grid button bottom-center. Hover
expands it. Scroll re-collapses.

---

## 15. Re-extraction

Whenever `globals.css`, `components/tokens.jsx`, or
`components/wallpapers.jsx` change in the Goa canvas, re-run the
extraction and overwrite this file. Studio (and any other downstream
project) mirrors the canvas, never the other way around.

— end —
