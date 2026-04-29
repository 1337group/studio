/* === Goa Shell — universal chrome for every app =====================================
   Surface contract (locked):
     • TOP BAR (always present)
        – left:    focus pill (Personal / Property Mgmt / IT …)
        – center:  optional in-app tab bar (only if the app has >1 page)
        – right:   actions (search • bell • launchpad • theme • avatar)
     • CONTENT (consumer-provided)
     • FOOTER (always present)
        – collapsing 7-dot dock with app shortcuts (iOS-26 Liquid Glass behavior)
        – feedback bot FAB (bottom-right, always-on)

   Gold accent (BC_GOLD) is the brand thread. Reused from springboard.
   Components exposed:
     <GoaShell focus tabs dock apps onTabChange surface route>{children}</GoaShell>
     <GoaShellTopBar />, <GoaShellFooter />     (lower-level, if needed)
   ============================================================================ */

const { useState: useShellState, useRef: useShellRef, useEffect: useShellEffect } = React;

// Gold accent — matches springboard's BC_GOLD so visuals stay consistent
const SHELL_GOLD = 'oklch(75% 0.135 75)';

// === Default focuses (the same six used in springboard) ==============================
const SHELL_FOCUSES = [
  { id: 'me',       label: 'Personal',      tone: 'amber'  },
  { id: 'pm',       label: 'Property Mgmt', tone: 'blue'   },
  { id: 'it',       label: 'IT',            tone: 'indigo' },
  { id: 'mkt',      label: 'Marketing',     tone: 'pink'   },
  { id: 'land',     label: 'Land Planning', tone: 'green'  },
  { id: 'concrete', label: 'Concrete',      tone: 'orange' },
];

// === Default dock entries (what springboard defines) =================================
const SHELL_DEFAULT_DOCK = [
  { label: 'Messages', icon: 'message-square', tone: 'green', href: 'messages.html' },
  { label: 'Library',  icon: 'users-round',    tone: 'indigo', href: 'library.html' },
  { label: 'Notes',    icon: 'sticky-note',    tone: 'amber',  href: 'notes.html' },
  { label: 'Spotlight',icon: 'search',         tone: 'grey'  },
];

// === Default launchpad apps ==========================================================
const SHELL_DEFAULT_APPS = [
  { label: 'Messages',   icon: 'message-square', tone: 'green',  kind: 'app',   href: 'messages.html' },
  { label: 'Files',      icon: 'folder',         tone: 'cyan',   kind: 'app' },
  { label: 'Notes',      icon: 'sticky-note',    tone: 'amber',  kind: 'app',   href: 'notes.html' },
  { label: 'Library',    icon: 'users-round',    tone: 'indigo', kind: 'app',   href: 'library.html' },
  { label: 'REMS',       icon: 'building-2',     tone: 'blue',   kind: 'app' },
  { label: 'Vacancy',    icon: 'door-open',      tone: 'pink',   kind: 'app' },
  { label: 'Renewals',   icon: 'file-signature', tone: 'orange', kind: 'agent' },
  { label: 'Concierge',  icon: 'sparkles',       tone: 'gold',   kind: 'agent' },
  { label: 'Workforce',  icon: 'users-round',    tone: 'mint',   kind: 'app' },
  { label: 'Buildings',  icon: 'map-pin',        tone: 'red',    kind: 'app' },
  { label: 'Templates',  icon: 'file-text',      tone: 'indigo', kind: 'app' },
  { label: 'Spotlight',  icon: 'search',         tone: 'grey',   kind: 'app' },
  { label: 'App Store',  icon: 'shopping-bag',   tone: 'blue',   kind: 'app' },
  { label: 'Voice Memos',icon: 'mic',            tone: 'red',    kind: 'app' },
  { label: 'Sandbox',    icon: 'flask-conical',  tone: 'purple', kind: 'app' },
  { label: 'Settings',   icon: 'settings',       tone: 'grey',   kind: 'app' },
];

// === Tile (small icon button used in dock + launchpad) ==============================
function ShellTile({ label, icon, tone = 'blue', kind = 'app', onClick, href, large = false, badge }) {
  const tones = {
    blue:   'linear-gradient(160deg, oklch(74% 0.13 250), oklch(56% 0.16 248))',
    cyan:   'linear-gradient(160deg, oklch(82% 0.12 200), oklch(64% 0.13 198))',
    indigo: 'linear-gradient(160deg, oklch(70% 0.16 285), oklch(54% 0.18 280))',
    purple: 'linear-gradient(160deg, oklch(74% 0.17 305), oklch(56% 0.20 310))',
    pink:   'linear-gradient(160deg, oklch(78% 0.18 350), oklch(60% 0.20 350))',
    red:    'linear-gradient(160deg, oklch(72% 0.20 22), oklch(56% 0.22 22))',
    orange: 'linear-gradient(160deg, oklch(82% 0.16 60), oklch(66% 0.18 50))',
    amber:  'linear-gradient(160deg, oklch(86% 0.15 90), oklch(70% 0.16 80))',
    gold:   `linear-gradient(160deg, oklch(83% 0.155 88), ${SHELL_GOLD})`,
    green:  'linear-gradient(160deg, oklch(78% 0.16 150), oklch(60% 0.17 148))',
    mint:   'linear-gradient(160deg, oklch(86% 0.13 178), oklch(68% 0.13 175))',
    grey:   'linear-gradient(160deg, oklch(78% 0.01 250), oklch(56% 0.01 250))',
  };
  const size = large ? 76 : 60;
  const handle = (e) => {
    if (onClick) return onClick(e);
    if (href) window.location.href = href;
  };
  return (
    <button onClick={handle} title={label} aria-label={label} style={{
      all: 'unset', cursor: 'pointer',
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 7,
    }}>
      <span style={{
        position: 'relative',
        width: size, height: size, borderRadius: size * 0.27,
        background: tones[tone] || tones.blue,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.30), 0 6px 14px -4px rgba(0,0,0,.22)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'white',
      }}>
        <GIcon name={icon} size={size * 0.42} />
        {kind === 'agent' && (
          <span style={{
            position: 'absolute', right: -3, bottom: -3,
            width: 18, height: 18, borderRadius: 9,
            background: SHELL_GOLD, color: 'white',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--goa-bg)',
          }}>
            <GIcon name="sparkles" size={9} />
          </span>
        )}
        {badge && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
            background: 'oklch(64% 0.20 22)', color: 'white',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
            border: '2px solid var(--goa-bg)',
          }}>{badge}</span>
        )}
      </span>
      {label && <span style={{ fontSize: 11, color: 'var(--goa-fg-2)', fontWeight: 500 }}>{label}</span>}
    </button>
  );
}

// === Focus pill (mirrors BCFocusPill from springboard) =============================
function ShellFocusPill({ focuses, value, onChange }) {
  const f = focuses.find(x => x.id === value) || focuses[0];
  const [open, setOpen] = useShellState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 30, padding: '0 12px',
        background: 'var(--goa-surface-2)', border: '1px solid var(--goa-line)',
        borderRadius: 999,
        fontSize: 12, fontWeight: 600, color: 'var(--goa-fg)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: `var(--goa-${f.tone || 'accent'})` }} />
        {f.label}
        <GIcon name="chevron-down" size={12} style={{ color: 'var(--goa-fg-3)' }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
          <div style={{
            position: 'absolute', top: 36, left: 0, zIndex: 31,
            background: 'var(--goa-bg-elev)', border: '1px solid var(--goa-line)',
            borderRadius: 14, padding: 6, minWidth: 200,
            boxShadow: 'var(--goa-shadow-3)',
          }}>
            {focuses.map(o => (
              <button key={o.id} onClick={() => { onChange?.(o.id); setOpen(false); }} style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', boxSizing: 'border-box',
                padding: '8px 10px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, color: 'var(--goa-fg)',
                background: o.id === value ? 'var(--goa-surface-2)' : 'transparent',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: `var(--goa-${o.tone || 'accent'})` }} />
                {o.label}
                {o.id === value && <GIcon name="check" size={14} style={{ color: SHELL_GOLD, marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// === In-app tab bar — center of the top bar (only when app has >1 page) ============
function ShellTabBar({ tabs = [], active, onChange, accent = SHELL_GOLD }) {
  if (!tabs || tabs.length === 0) return null;
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {tabs.map(t => {
        const id = typeof t === 'string' ? t : t.id;
        const label = typeof t === 'string' ? t : t.label;
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange?.(id)} style={{
            all: 'unset', cursor: 'pointer',
            position: 'relative',
            padding: '6px 14px', borderRadius: 999,
            fontSize: 13, fontWeight: isActive ? 700 : 500,
            color: isActive ? 'var(--goa-fg)' : 'var(--goa-fg-3)',
            background: isActive ? 'var(--goa-surface-2)' : 'transparent',
            transition: 'all 160ms ease',
          }}>
            {label}
            {isActive && (
              <span style={{
                position: 'absolute', left: '24%', right: '24%', bottom: 2,
                height: 2, borderRadius: 2, background: accent,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// === Launchpad — iCloud-style top-right launcher ===================================
function ShellLaunchpad({ open, onClose, apps }) {
  const [tab, setTab] = useShellState('All');
  if (!open) return null;
  const filtered = tab === 'All' ? apps
    : tab === 'Apps'   ? apps.filter(a => a.kind === 'app')
    : tab === 'Agents' ? apps.filter(a => a.kind === 'agent')
    : tab === 'Models' ? apps.filter(a => a.kind === 'model')
    : apps;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
      <div style={{
        position: 'absolute', top: 56, right: 16, zIndex: 61,
        width: 460, padding: 18,
        background: 'var(--goa-glass-thick)',
        backdropFilter: 'var(--goa-blur-thick)',
        WebkitBackdropFilter: 'var(--goa-blur-thick)',
        border: '1px solid var(--goa-glass-border)',
        borderRadius: 20,
        boxShadow: 'var(--goa-shadow-glass)',
        animation: `shellLaunchIn 200ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
        transformOrigin: 'top right',
      }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {['All','Apps','Agents','Models'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              all: 'unset', cursor: 'pointer',
              padding: '5px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 600,
              color: tab === t ? 'var(--goa-fg)' : 'var(--goa-fg-3)',
              background: tab === t ? 'var(--goa-surface-2)' : 'transparent',
            }}>{t}</button>
          ))}
          <span style={{ flex: 1 }} />
          <GoaSearchField placeholder="Search…" style={{ width: 160, height: 28, fontSize: 12 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map(a => <ShellTile key={a.label} {...a} onClick={() => { onClose?.(); a.onClick?.(); if (a.href) window.location.href = a.href; }} />)}
        </div>
      </div>
      <style>{`
        @keyframes shellLaunchIn {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

// === Top bar ========================================================================
function ShellAppTitle({ title }) {
  return (
    <span style={{
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: '-0.005em',
      color: 'var(--goa-fg)',
      whiteSpace: 'nowrap',
    }}>{title}</span>
  );
}

function GoaShellTopBar({
  focuses = SHELL_FOCUSES,
  focusId = 'me',
  onFocusChange,
  tabs,
  activeTab,
  onTabChange,
  apps = SHELL_DEFAULT_APPS,
  theme = 'light',
  setTheme,
  user = { initials: 'AD', name: 'Allan Drewlo' },
  bell = true,
  height = 48,
  appTitle,
}) {
  const [launchOpen, setLaunchOpen] = useShellState(false);
  const hasTabs = tabs && tabs.length > 1;
  return (
    <>
      <GoaTopBar
        height={height}
        left={<ShellFocusPill focuses={focuses} value={focusId} onChange={onFocusChange} />}
        center={hasTabs
          ? <ShellTabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
          : (appTitle ? <ShellAppTitle title={appTitle} /> : null)
        }
        right={<>
          <GoaIconButton icon="search" size={32} label="Search" />
          {bell && <GoaIconButton icon="bell" size={32} label="Notifications" />}
          <GoaIconButton icon="layout-grid" size={32} label="Apps" onClick={() => setLaunchOpen(o => !o)} active={launchOpen} />
          <GoaIconButton
            icon={theme === 'dark' ? 'moon' : 'sun'}
            size={32}
            label="Theme"
            onClick={() => setTheme?.(theme === 'dark' ? 'light' : 'dark')}
          />
          <button title={user.name} style={{
            all: 'unset', cursor: 'pointer',
            width: 30, height: 30, borderRadius: 15,
            background: `linear-gradient(160deg, ${SHELL_GOLD}, oklch(58% 0.13 65))`,
            color: 'white', fontSize: 12, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{user.initials}</button>
        </>}
      />
      <ShellLaunchpad open={launchOpen} onClose={() => setLaunchOpen(false)} apps={apps} />
    </>
  );
}

// === Collapsing dock (footer) ======================================================
function GoaShellDock({ dock = SHELL_DEFAULT_DOCK, scrollRef, currentApp }) {
  const [collapsed, setCollapsed] = useShellState(true);
  const [hover, setHover] = useShellState(false);

  useShellEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    let lastY = 0;
    const onScroll = () => {
      const y = el.scrollTop;
      const dy = y - lastY;
      lastY = y;
      // Scroll always re-collapses; user must hover the dot to peek.
      if (dy > 4) setCollapsed(true);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  const expanded = !collapsed || hover;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)',
        zIndex: 20, transition: 'all 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        // Generous hover halo so the user can find the dot without precision.
        padding: '20px 24px', margin: '-20px -24px',
      }}>
      {expanded ? (
        <div style={{
          background: 'var(--goa-glass-thick)',
          backdropFilter: 'var(--goa-blur-thick)',
          WebkitBackdropFilter: 'var(--goa-blur-thick)',
          border: '1px solid var(--goa-glass-border)',
          borderRadius: 24, padding: '10px 12px',
          boxShadow: 'var(--goa-shadow-glass)',
          display: 'inline-flex', alignItems: 'center', gap: 12,
          animation: 'shellDockExpand 280ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}>
          {dock.map(d => (
            <ShellTile key={d.label} {...d}
              onClick={() => { d.onClick?.(); if (d.href) window.location.href = d.href; }}
              badge={currentApp === d.label ? undefined : d.badge}
            />
          ))}
        </div>
      ) : (
        <button onClick={() => setCollapsed(false)} aria-label="Show dock" style={{
          all: 'unset', cursor: 'pointer',
          width: 48, height: 48, borderRadius: 24,
          background: 'var(--goa-glass-thick)',
          backdropFilter: 'var(--goa-blur-thick)',
          WebkitBackdropFilter: 'var(--goa-blur-thick)',
          border: '1px solid var(--goa-glass-border)',
          boxShadow: 'var(--goa-shadow-glass)',
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
          color: 'var(--goa-fg-2)', padding: '7px 0',
          animation: 'shellDockCollapse 280ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: 'currentColor' }} />
          <span style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 4px)', gap: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: 'currentColor' }} />
            ))}
          </span>
        </button>
      )}
      <style>{`
        @keyframes shellDockExpand {
          from { opacity: 0.4; transform: scale(0.86); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shellDockCollapse {
          from { opacity: 0.4; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// === GoaShell — top bar + content + footer dock + feedback bot ====================
function GoaShell({
  // top bar
  focuses, focusId, onFocusChange,
  tabs, activeTab, onTabChange,
  apps, theme, setTheme, user, bell,
  appTitle,                    // app name shown center top — falls back to currentApp
  // dock
  dock, scrollRef, currentApp,
  // feedback bot
  surface = 'App', route = '/',
  showFeedback = true,
  // content
  children,
  // layout
  contentStyle = {},
}) {
  const internalScrollRef = useShellRef(null);
  const sRef = scrollRef || internalScrollRef;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="goa-wallpaper">
      <GoaShellTopBar
        focuses={focuses} focusId={focusId} onFocusChange={onFocusChange}
        tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}
        apps={apps} theme={theme} setTheme={setTheme} user={user} bell={bell}
        appTitle={appTitle || currentApp}
      />
      <div ref={sRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative', ...contentStyle }}>
        {children}
      </div>
      <GoaShellDock dock={dock} scrollRef={sRef} currentApp={currentApp} />
      {showFeedback && typeof AskGoa === 'function' ? (
        <AskGoa surface={surface} route={route} />
      ) : showFeedback && typeof BCFeedbackBot === 'function' ? (
        <BCFeedbackBot surface={surface} route={route} />
      ) : null}
    </div>
  );
}

// === Phone shell (more compact) =====================================================
// Same contract but: focus pill stays, tabs (if any) sit just under the top bar,
// no launchpad in top bar (uses dock instead), bottom dock is a 5-tab strip.
function GoaShellPhone({
  focuses, focusId, onFocusChange,
  apps,
  appTitle,                   // big title under the top bar (e.g. "Library", "Notes")
  appAction,                  // optional right-side action (compose / +)
  tabs, activeTab, onTabChange,
  dock = SHELL_DEFAULT_DOCK,
  currentApp,
  theme = 'light',
  user = { initials: 'AD' },
  surface = 'App', route = '/',
  showFeedback = true,
  contentStyle = {},
  children,
}) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="goa-wallpaper">
      <GoaStatusBar dark={theme === 'dark'} />
      <div style={{
        padding: '6px 16px 10px',
        background: 'var(--goa-glass-tint)',
        backdropFilter: 'var(--goa-blur)',
        WebkitBackdropFilter: 'var(--goa-blur)',
        borderBottom: '0.5px solid var(--goa-glass-stroke)',
      }}>
        {/* Row 1: focus pill (left) + actions (right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
          <ShellFocusPill focuses={focuses || SHELL_FOCUSES} value={focusId} onChange={onFocusChange} />
          <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <GoaIconButton icon="search" size={28} label="Search" />
            {appAction || null}
            <span title={user.name} style={{
              width: 28, height: 28, borderRadius: 14,
              background: `linear-gradient(160deg, ${SHELL_GOLD}, oklch(58% 0.13 65))`,
              color: 'white', fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{user.initials}</span>
          </div>
        </div>
        {/* Row 2: app title */}
        {appTitle && (
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.022em', marginTop: 2 }}>{appTitle}</div>
        )}
        {/* Row 3: optional in-app tabs */}
        {tabs && tabs.length > 1 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, overflowX: 'auto' }}>
            <ShellTabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative', ...contentStyle }}>
        {children}
      </div>

      {/* Bottom dock — phone version: 5 fixed tabs (Home, Chat, Library, Notes, Me) */}
      <GoaShellPhoneDock dock={dock.slice(0, 5)} currentApp={currentApp} />

      {showFeedback && typeof AskGoa === 'function' ? (
        <AskGoa surface={surface} route={route} bottomOffset={110} />
      ) : showFeedback && typeof BCFeedbackBot === 'function' ? (
        <BCFeedbackBot surface={surface} route={route} bottomOffset={110} />
      ) : null}
    </div>
  );
}

function GoaShellPhoneDock({ dock, currentApp }) {
  return (
    <div style={{
      height: 70, padding: '8px 14px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      background: 'var(--goa-glass-thick)',
      backdropFilter: 'var(--goa-blur)',
      WebkitBackdropFilter: 'var(--goa-blur)',
      borderTop: '0.5px solid var(--goa-glass-stroke)',
    }}>
      {dock.map(d => {
        const isActive = currentApp === d.label;
        return (
          <button key={d.label} onClick={() => { d.onClick?.(); if (d.href) window.location.href = d.href; }} style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? 'var(--goa-accent)' : 'var(--goa-fg-3)',
            fontSize: 10, fontWeight: 600,
          }}>
            <GIcon name={d.icon} size={22} />
            <span>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Export everything to window so other Babel scripts can use them
Object.assign(window, {
  GoaShell, GoaShellPhone, GoaShellTopBar, GoaShellDock, GoaShellPhoneDock,
  ShellFocusPill, ShellTabBar, ShellLaunchpad, ShellTile,
  SHELL_FOCUSES, SHELL_DEFAULT_DOCK, SHELL_DEFAULT_APPS, SHELL_GOLD,
});
