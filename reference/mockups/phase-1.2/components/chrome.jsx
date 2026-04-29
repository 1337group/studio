/* Goa shared chrome:
   - GoaTopBar — frosted top navigation, scales iPhone → desktop
   - GoaSidebar — translucent left sidebar (iPad split-view)
   - GoaSheet — modal sheet/popover
   - GoaSegmented — pill-style segmented control
   - GoaSearchField, GoaButton, GoaTabBar (mobile bottom-anchored only when explicitly requested), GoaIconButton
   - GoaDeviceFrame — light wrappers to render iPhone & iPad next to each other
   - GoaWordmark — temporary "ShapeShifter" wordmark + "SS" monogram
*/

const { useState, useEffect, useRef, useMemo } = React;

// === Wordmark / logo placeholder ===
function GoaWordmark({ size = 18, color, monoOnly = false }) {
  const fg = color || GoaTokens.color.fg;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: fg, fontFamily: GoaTokens.font }}>
      <div style={{
        width: size + 8, height: size + 8, borderRadius: (size + 8) * 0.28,
        background: `linear-gradient(135deg, var(--goa-accent) 0%, var(--goa-indigo) 100%)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: size * 0.62,
        letterSpacing: '-0.04em',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.15)',
      }}>SS</div>
      {!monoOnly && (
        <span style={{ fontSize: size, fontWeight: 600, letterSpacing: '-0.018em' }}>ShapeShifter</span>
      )}
    </div>
  );
}

// === Top Bar (frosted glass, anchored top) ===
function GoaTopBar({ left, center, right, height = 52, padding = 16, style = {} }) {
  return (
    <div style={{
      height, padding: `0 ${padding}px`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      background: 'var(--goa-glass-tint)',
      backdropFilter: 'var(--goa-blur)',
      WebkitBackdropFilter: 'var(--goa-blur)',
      borderBottom: '1px solid var(--goa-glass-stroke)',
      position: 'relative', zIndex: 10,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', minWidth: 0 }}>{left}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', justifyContent: 'center', minWidth: 0 }}>{center}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>{right}</div>
    </div>
  );
}

// === iPad sidebar (translucent, scrollable list) ===
function GoaSidebar({ children, width = 264, style = {} }) {
  return (
    <aside style={{
      width, flexShrink: 0,
      background: 'var(--goa-glass-thin)',
      backdropFilter: 'var(--goa-blur)',
      WebkitBackdropFilter: 'var(--goa-blur)',
      borderRight: '1px solid var(--goa-glass-stroke)',
      overflowY: 'auto',
      padding: '14px 10px',
      ...style,
    }}>{children}</aside>
  );
}

function GoaSidebarSection({ title, children, action }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 12px 8px',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--goa-fg-3)',
        }}>
          <span>{title}</span>
          {action}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  );
}

function GoaSidebarItem({ icon, label, count, active, tone = 'blue', onClick }) {
  const toneColor = tone && tone !== 'blue' ? `var(--goa-${tone})` : 'var(--goa-accent)';
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px',
        borderRadius: 8,
        background: active ? 'var(--goa-accent-soft)' : 'transparent',
        color: active ? 'var(--goa-accent)' : 'var(--goa-fg)',
        transition: `background ${GoaTokens.motion.durFast} ${GoaTokens.motion.ease}`,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--goa-surface-2)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {icon && <span style={{ color: active ? 'var(--goa-accent)' : toneColor, display: 'inline-flex', width: 18 }}>
        <GIcon name={icon} size={16} />
      </span>}
      <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: '-0.005em' }}>{label}</span>
      {count != null && <span style={{
        fontSize: 12, color: 'var(--goa-fg-3)', fontVariantNumeric: 'tabular-nums',
      }}>{count}</span>}
    </button>
  );
}

// === Buttons ===
function GoaButton({ children, variant = 'primary', size = 'md', icon, onClick, style = {}, disabled, full }) {
  const sizes = {
    sm: { h: 28, px: 12, fs: 13, gap: 6, ic: 14 },
    md: { h: 34, px: 16, fs: 14, gap: 8, ic: 16 },
    lg: { h: 44, px: 22, fs: 16, gap: 10, ic: 18 },
  }[size];
  const variants = {
    primary: { background: 'var(--goa-accent)', color: 'var(--goa-accent-fg)', border: '1px solid transparent' },
    secondary: { background: 'var(--goa-surface-2)', color: 'var(--goa-fg)', border: '1px solid var(--goa-line)' },
    ghost: { background: 'transparent', color: 'var(--goa-accent)', border: '1px solid transparent' },
    glass: { background: 'var(--goa-glass)', color: 'var(--goa-fg)', border: '1px solid var(--goa-glass-stroke)', backdropFilter: 'var(--goa-blur-thin)' },
    danger: { background: 'var(--goa-red)', color: 'white', border: '1px solid transparent' },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      all: 'unset', cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sizes.gap,
      height: sizes.h, padding: `0 ${sizes.px}px`, fontSize: sizes.fs, fontWeight: 600,
      borderRadius: sizes.h / 2, letterSpacing: '-0.005em',
      width: full ? '100%' : 'auto',
      opacity: disabled ? 0.5 : 1,
      transition: `all ${GoaTokens.motion.durFast} ${GoaTokens.motion.ease}`,
      ...variants,
      backdropFilter: variants.backdropFilter,
      WebkitBackdropFilter: variants.backdropFilter,
      ...style,
    }}>
      {icon && <GIcon name={icon} size={sizes.ic} />}
      {children}
    </button>
  );
}

function GoaIconButton({ icon, label, onClick, size = 32, style = {}, active, tone }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{
      all: 'unset', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: size * 0.32,
      color: active ? 'var(--goa-accent)' : (tone ? `var(--goa-${tone})` : 'var(--goa-fg-2)'),
      background: active ? 'var(--goa-accent-soft)' : 'transparent',
      transition: `all ${GoaTokens.motion.durFast} ${GoaTokens.motion.ease}`,
      ...style,
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--goa-surface-2)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <GIcon name={icon} size={Math.round(size * 0.52)} />
    </button>
  );
}

// === Segmented control ===
function GoaSegmented({ options, value, onChange, size = 'md', style = {} }) {
  const sizes = { sm: { h: 26, fs: 12, px: 10 }, md: { h: 32, fs: 13, px: 14 }, lg: { h: 38, fs: 14, px: 18 } }[size];
  return (
    <div style={{
      display: 'inline-flex', padding: 2,
      background: 'var(--goa-surface-3)', borderRadius: sizes.h / 2,
      ...style,
    }}>
      {options.map(opt => {
        const active = (typeof opt === 'string' ? opt : opt.value) === value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const val = typeof opt === 'string' ? opt : opt.value;
        return (
          <button key={val} onClick={() => onChange?.(val)} style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            height: sizes.h - 4, padding: `0 ${sizes.px}px`, fontSize: sizes.fs,
            fontWeight: 600, color: active ? 'var(--goa-fg)' : 'var(--goa-fg-3)',
            background: active ? 'var(--goa-bg-elev)' : 'transparent',
            borderRadius: (sizes.h - 4) / 2,
            boxShadow: active ? 'var(--goa-shadow-1)' : 'none',
            transition: `all ${GoaTokens.motion.durFast} ${GoaTokens.motion.ease}`,
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// === Search field ===
function GoaSearchField({ placeholder = 'Search', value, onChange, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 32, padding: '0 10px',
      background: 'var(--goa-surface-3)', borderRadius: 8,
      color: 'var(--goa-fg-3)',
      ...style,
    }}>
      <GIcon name="search" size={14} />
      <input
        value={value || ''} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          all: 'unset', flex: 1, fontSize: 13, color: 'var(--goa-fg)', fontFamily: GoaTokens.font,
        }}
      />
    </div>
  );
}

// === Sheet / overlay ===
function GoaSheet({ open, onClose, children, width = 480, height, style = {} }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(8, 12, 28, 0.32)',
        backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'relative', width, maxWidth: '100%', maxHeight: height || '85%',
        background: 'var(--goa-bg-elev)',
        borderRadius: 'var(--goa-r-sheet)',
        boxShadow: 'var(--goa-shadow-4)',
        overflow: 'hidden',
        border: '1px solid var(--goa-line)',
        ...style,
      }}>{children}</div>
    </div>
  );
}

// === Surface device frames (iPhone + iPad/desktop wrappers used inside our HTML pages) ===
function GoaiPhone({ children, label, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--goa-fg-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>}
      <div style={{
        width: 390, height: 844,
        borderRadius: 54,
        padding: 12,
        background: 'linear-gradient(180deg, #1a1d24, #0d0f14)',
        boxShadow: '0 30px 80px rgba(8,12,28,0.30), 0 8px 18px rgba(8,12,28,0.18), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
        position: 'relative',
        ...style,
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 42, overflow: 'hidden',
          background: 'var(--goa-bg)',
          position: 'relative',
        }}>
          {/* Dynamic Island */}
          <div style={{
            position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
            width: 122, height: 36, borderRadius: 22,
            background: '#000', zIndex: 50,
          }} />
          {children}
        </div>
      </div>
    </div>
  );
}

function GoaiPad({ children, label, width = 1180, height = 820, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--goa-fg-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>}
      <div style={{
        width, height,
        borderRadius: 28,
        padding: 10,
        background: 'linear-gradient(180deg, #1a1d24, #0d0f14)',
        boxShadow: '0 36px 90px rgba(8,12,28,0.30), 0 10px 24px rgba(8,12,28,0.18), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
        position: 'relative',
        ...style,
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 19, overflow: 'hidden',
          background: 'var(--goa-bg)',
          position: 'relative',
        }}>{children}</div>
      </div>
    </div>
  );
}

// === iOS-style status bar (for iPhone frames) ===
function GoaStatusBar({ time = '9:41', dark }) {
  const fg = dark ? '#fff' : '#000';
  return (
    <div style={{
      height: 50, padding: '14px 32px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: fg, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
      position: 'relative', zIndex: 60,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <GIcon name="signal" size={14} />
        <GIcon name="wifi" size={14} />
        <GIcon name="battery-full" size={18} />
      </div>
    </div>
  );
}

// === Section header (used in card-grids) ===
function GoaSectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '12px 4px 14px' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.020em', color: 'var(--goa-fg)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--goa-fg-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// === Page-shell layouts ===
// iPad split-view shell: sidebar + content
function GoaSplitView({ sidebar, children, sidebarWidth = 264 }) {
  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      <GoaSidebar width={sidebarWidth}>{sidebar}</GoaSidebar>
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>{children}</main>
    </div>
  );
}

// === Theme toggle (moon/sun) ===
function GoaThemeToggle({ theme, setTheme }) {
  return (
    <GoaIconButton
      icon={theme === 'dark' ? 'sun' : 'moon'}
      label="Toggle appearance"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );
}

Object.assign(window, {
  GoaWordmark, GoaTopBar, GoaSidebar, GoaSidebarSection, GoaSidebarItem,
  GoaButton, GoaIconButton, GoaSegmented, GoaSearchField, GoaSheet,
  GoaiPhone, GoaiPad, GoaStatusBar, GoaSectionHeader, GoaSplitView, GoaThemeToggle,
});
