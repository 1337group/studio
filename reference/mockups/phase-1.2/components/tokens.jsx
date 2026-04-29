/* Goa tokens — JS surface for components.
   The CSS variables in globals.css are the source of truth.
   This file exposes them by name for convenience inside JSX. */

const GoaTokens = {
  font: 'var(--goa-font)',
  fontMono: 'var(--goa-font-mono)',
  fontSerif: 'var(--goa-font-serif)',

  text: {
    xs: 'var(--goa-text-xs)', sm: 'var(--goa-text-sm)', base: 'var(--goa-text-base)',
    md: 'var(--goa-text-md)', lg: 'var(--goa-text-lg)', xl: 'var(--goa-text-xl)',
    xl2: 'var(--goa-text-2xl)', xl3: 'var(--goa-text-3xl)',
    xl4: 'var(--goa-text-4xl)', xl5: 'var(--goa-text-5xl)',
  },
  tracking: { tight: 'var(--goa-tracking-tight)', snug: 'var(--goa-tracking-snug)', normal: 'var(--goa-tracking-normal)' },

  color: {
    bg: 'var(--goa-bg)', bgElev: 'var(--goa-bg-elev)', bgSunken: 'var(--goa-bg-sunken)',
    surface: 'var(--goa-surface)', surface2: 'var(--goa-surface-2)', surface3: 'var(--goa-surface-3)',
    fg: 'var(--goa-fg)', fg2: 'var(--goa-fg-2)', fg3: 'var(--goa-fg-3)', fg4: 'var(--goa-fg-4)',
    line: 'var(--goa-line)', line2: 'var(--goa-line-2)', lineStrong: 'var(--goa-line-strong)',
    accent: 'var(--goa-accent)', accentHover: 'var(--goa-accent-hover)', accentSoft: 'var(--goa-accent-soft)', accentFg: 'var(--goa-accent-fg)',
    red: 'var(--goa-red)', orange: 'var(--goa-orange)', amber: 'var(--goa-amber)',
    green: 'var(--goa-green)', mint: 'var(--goa-mint)', cyan: 'var(--goa-cyan)',
    blue: 'var(--goa-blue)', indigo: 'var(--goa-indigo)', purple: 'var(--goa-purple)',
    pink: 'var(--goa-pink)', brown: 'var(--goa-brown)', grey: 'var(--goa-grey)',
  },

  radius: {
    xs: 'var(--goa-r-xs)', sm: 'var(--goa-r-sm)', md: 'var(--goa-r-md)',
    lg: 'var(--goa-r-lg)', xl: 'var(--goa-r-xl)', xl2: 'var(--goa-r-2xl)',
    tile: 'var(--goa-r-tile)', card: 'var(--goa-r-card)', sheet: 'var(--goa-r-sheet)', pill: 'var(--goa-r-pill)',
  },

  space: {
    1: 'var(--goa-1)', 2: 'var(--goa-2)', 3: 'var(--goa-3)', 4: 'var(--goa-4)',
    5: 'var(--goa-5)', 6: 'var(--goa-6)', 7: 'var(--goa-7)', 8: 'var(--goa-8)',
    9: 'var(--goa-9)', 10: 'var(--goa-10)',
  },

  shadow: {
    1: 'var(--goa-shadow-1)', 2: 'var(--goa-shadow-2)', 3: 'var(--goa-shadow-3)', 4: 'var(--goa-shadow-4)',
    glass: 'var(--goa-shadow-glass)', tile: 'var(--goa-shadow-tile)',
  },

  motion: {
    ease: 'var(--goa-ease)', easeOut: 'var(--goa-ease-out)', spring: 'var(--goa-ease-spring)',
    dur: 'var(--goa-dur)', durFast: 'var(--goa-dur-fast)', durSlow: 'var(--goa-dur-slow)',
  },
};

// Lucide icon helper — uses the lucide-static font CSS we import in globals.
function GIcon({ name, size = 18, style = {}, className = '' }) {
  // lucide-static iconfont uses `icon-<name>` class names
  return <i className={`icon-${name} ${className}`} style={{ fontSize: size, lineHeight: 1, display: 'inline-block', ...style }} />;
}

// Monogram avatar — used everywhere a person/agent has no real image yet.
function GMonogram({ label = '', tone = 'blue', size = 36, radius }) {
  const initials = (label || '').split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '·';
  const tones = {
    blue: { bg: 'oklch(94% 0.04 232)', fg: 'oklch(38% 0.12 232)' },
    indigo: { bg: 'oklch(94% 0.04 270)', fg: 'oklch(38% 0.14 270)' },
    purple: { bg: 'oklch(94% 0.04 305)', fg: 'oklch(40% 0.14 305)' },
    pink: { bg: 'oklch(94% 0.04 355)', fg: 'oklch(44% 0.14 355)' },
    red: { bg: 'oklch(94% 0.04 25)', fg: 'oklch(46% 0.16 25)' },
    orange: { bg: 'oklch(94% 0.04 55)', fg: 'oklch(46% 0.14 55)' },
    amber: { bg: 'oklch(94% 0.04 85)', fg: 'oklch(44% 0.13 85)' },
    green: { bg: 'oklch(94% 0.04 150)', fg: 'oklch(40% 0.13 150)' },
    mint: { bg: 'oklch(94% 0.04 178)', fg: 'oklch(40% 0.12 178)' },
    cyan: { bg: 'oklch(94% 0.04 215)', fg: 'oklch(40% 0.12 215)' },
    grey: { bg: 'oklch(93% 0.005 250)', fg: 'oklch(38% 0.010 250)' },
  };
  const t = tones[tone] || tones.blue;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius ?? size * 0.34,
      background: t.bg, color: t.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.42, letterSpacing: '-0.01em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// Hash a string to a tone — keeps avatars stable per name.
function gToneFor(seed = '') {
  const tones = ['blue','indigo','purple','pink','red','orange','amber','green','mint','cyan','grey'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return tones[Math.abs(h) % tones.length];
}

Object.assign(window, { GoaTokens, GIcon, GMonogram, gToneFor });
