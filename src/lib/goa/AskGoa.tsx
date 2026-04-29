// MERGE-NOTE: studio — Drewlo addition.
//
// Ask Goa — Universal FAB. TypeScript port of the canvas's
// `components/ask-goa.jsx`. Bottom-right floating-action button with the
// Drewlo knot mark; opens a chat panel anchored to the current Studio
// surface.
//
// D-21 content-strip applied: the canvas version of `ask-goa.jsx` ships
// mock seed threads referencing Renewals desk / Maria / corpora / etc.
// Studio doesn't have those data sources. This port renders the empty
// greeting state only and stubs the composer with a "Coming P1.3" hint
// until the concierge wiring is in (real /api/chat dispatch with a
// per-surface page-context provider).
//
// Surfaces in Studio that need this FAB:
//   * EntryView — surface = 'Studio · home', route = '/'
//   * ProjectView — surface = `Studio · ${project.name}`, route = `/projects/<id>`
//
// Re-extraction rule: when Goa canon updates `components/ask-goa.jsx`,
// re-port the visual chrome here but keep the D-21 strip + the P1.3 stub.
// Real /api/chat wiring lands in Studio's P1.3 alongside a Concierge agent
// definition in `daemon/agents.js`.

import { useEffect, useState } from 'react';
import { GIcon } from './tokens';

const GOLD = 'oklch(75% 0.135 75)';

interface AskGoaProps {
  surface: string;
  route: string;
  bottomOffset?: number;
}

export function AskGoa({ surface, route, bottomOffset = 20 }: AskGoaProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AskGoaFAB open={open} onToggle={() => setOpen((o) => !o)} bottomOffset={bottomOffset} />
      {open ? <AskGoaPanel surface={surface} route={route} bottomOffset={bottomOffset} onClose={() => setOpen(false)} /> : null}
      <AskGoaKeyframes />
    </>
  );
}

interface AskGoaFABProps {
  open: boolean;
  onToggle: () => void;
  bottomOffset: number;
}

function AskGoaFAB({ open, onToggle, bottomOffset }: AskGoaFABProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? 'Close Ask Goa' : 'Open Ask Goa'}
      title="Ask Goa"
      style={{
        all: 'unset',
        cursor: 'pointer',
        position: 'fixed',
        right: 20,
        bottom: bottomOffset,
        zIndex: 60,
        width: 50,
        height: 50,
        borderRadius: 25,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0b0d',
        backgroundImage: open ? 'none' : 'url("/assets/drewlo-knot-gold-on-black.png")',
        backgroundSize: '74%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow:
          '0 10px 28px rgba(8, 12, 28, 0.36), 0 2px 6px rgba(207, 161, 76, 0.32), inset 0 0 0 1px rgba(207, 161, 76, 0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
        color: GOLD,
        transition:
          'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.07)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.93)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.07)';
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 28,
          border: `1px solid ${GOLD}`,
          opacity: 0.4,
          animation: 'agPulse 2.6s ease-out infinite',
        }}
      />
      {open ? (
        <GIcon
          name="chevron-down"
          size={20}
          style={{ position: 'relative', zIndex: 1, color: GOLD }}
        />
      ) : null}
    </button>
  );
}

interface AskGoaPanelProps {
  surface: string;
  route: string;
  bottomOffset: number;
  onClose: () => void;
}

function AskGoaPanel({ surface, route, bottomOffset, onClose }: AskGoaPanelProps) {
  const [ctxOpen, setCtxOpen] = useState(false);

  // Close on Escape — matches the dismissal pattern the rest of Goa uses.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Ask Goa"
      style={{
        position: 'fixed',
        right: 20,
        bottom: bottomOffset + 60,
        zIndex: 60,
        width: 'min(380px, calc(100% - 24px))',
        height: 'min(520px, calc(100% - 100px))',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--goa-bg-elev)',
        border: '1px solid var(--goa-line)',
        borderRadius: 22,
        boxShadow:
          '0 28px 64px rgba(8, 12, 28, 0.34), 0 2px 6px rgba(8,12,28,0.12)',
        overflow: 'hidden',
        animation: 'agIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        transformOrigin: 'bottom right',
        color: 'var(--goa-fg)',
        fontFamily: 'var(--goa-font)',
      }}
    >
      <Header onClose={onClose} />
      <ContextStrip
        surface={surface}
        route={route}
        expanded={ctxOpen}
        onToggle={() => setCtxOpen((o) => !o)}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 4px' }}>
        <Greeting surface={surface} />
        <ComingSoonNote />
      </div>
      <Composer surface={surface} />
    </div>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 12px 11px 14px',
        borderBottom: '1px solid var(--goa-line)',
        background: 'var(--goa-bg-elev)',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          background: '#0b0b0d',
          backgroundImage: 'url("/assets/drewlo-knot-gold-on-black.png")',
          backgroundSize: '74%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow:
            'inset 0 0 0 1px rgba(207, 161, 76, 0.5), 0 1px 3px rgba(8, 12, 28, 0.2)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--goa-fg)',
          }}
        >
          Ask Goa
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--goa-fg-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              background: 'oklch(0.66 0.16 150)',
            }}
          />
          Concierge · arriving in P1.3
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          all: 'unset',
          cursor: 'pointer',
          width: 28,
          height: 28,
          borderRadius: 14,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--goa-fg-3)',
        }}
      >
        <GIcon name="x" size={16} />
      </button>
    </div>
  );
}

interface ContextStripProps {
  surface: string;
  route: string;
  expanded: boolean;
  onToggle: () => void;
}

function ContextStrip({ surface, route, expanded, onToggle }: ContextStripProps) {
  const summary = `${surface} · ${route}`;
  return (
    <div
      style={{
        borderBottom: '1px solid var(--goa-line)',
        background: 'var(--goa-surface-2)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '7px 12px',
          fontSize: 11,
          color: 'var(--goa-fg-3)',
          boxSizing: 'border-box',
        }}
      >
        <GIcon name="map-pin" size={11} style={{ color: GOLD }} />
        <span>Goa sees</span>
        <span style={{ color: 'var(--goa-fg-2)', fontWeight: 600 }}>{summary}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
          <GIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={11} />
        </span>
      </button>
      {expanded ? (
        <div
          style={{
            padding: '0 12px 10px',
            fontFamily: 'var(--goa-font-mono)',
            fontSize: 10.5,
            color: 'var(--goa-fg-3)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 10,
            rowGap: 3,
          }}
        >
          <span>surface</span>
          <span style={{ color: 'var(--goa-fg-2)' }}>{surface}</span>
          <span>route</span>
          <span style={{ color: 'var(--goa-fg-2)' }}>{route}</span>
        </div>
      ) : null}
    </div>
  );
}

function Greeting({ surface }: { surface: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        marginBottom: 12,
        alignItems: 'flex-end',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          flexShrink: 0,
          background: '#0b0b0d',
          backgroundImage: 'url("/assets/drewlo-knot-gold-on-black.png")',
          backgroundSize: '74%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5)',
          marginBottom: 2,
        }}
      />
      <div
        style={{
          maxWidth: '84%',
          padding: '9px 12px',
          borderRadius: 14,
          borderTopLeftRadius: 4,
          background: 'var(--goa-surface-2)',
          color: 'var(--goa-fg)',
          fontSize: 13.5,
          lineHeight: 1.45,
          border: '1px solid var(--goa-line)',
        }}
      >
        I'm Goa's concierge. When this is wired up, I'll answer questions
        about <b>{surface}</b>, run page actions for you, or take feedback to
        Allan.
      </div>
    </div>
  );
}

function ComingSoonNote() {
  return (
    <div
      style={{
        margin: '4px 0 12px 28px',
        padding: '10px 12px',
        borderRadius: 14,
        background: 'var(--goa-bg-elev)',
        border: '1px dashed var(--goa-line-strong)',
        fontSize: 12.5,
        color: 'var(--goa-fg-2)',
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
          fontWeight: 700,
          color: 'var(--goa-fg)',
        }}
      >
        <GIcon name="lightbulb" size={11} style={{ color: GOLD }} />
        <span>Wiring up in P1.3</span>
      </div>
      The composer below is a stub. Studio's next phase wires this to a
      Concierge agent over the same SSE infrastructure that powers the
      project chat — same model (<code>claude-sonnet-latest</code>), with a
      page-context payload describing the current surface and selection.
    </div>
  );
}

interface ComposerProps {
  surface: string;
}

const Composer = ({ surface }: ComposerProps) => {
  return (
    <div
      style={{
        padding: 10,
        paddingTop: 8,
        background: 'var(--goa-bg-elev)',
        borderTop: '1px solid var(--goa-line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          padding: '6px 6px 6px 12px',
          background: 'var(--goa-surface-2)',
          border: '1px solid var(--goa-line)',
          borderRadius: 18,
          opacity: 0.65,
        }}
      >
        <textarea
          disabled
          rows={1}
          placeholder={`Ask about ${surface}… (P1.3)`}
          style={{
            flex: 1,
            resize: 'none',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--goa-fg-3)',
            fontSize: 13.5,
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: 96,
            padding: '6px 0',
          }}
        />
        <button
          disabled
          aria-label="Send (disabled)"
          style={{
            all: 'unset',
            cursor: 'not-allowed',
            width: 32,
            height: 32,
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--goa-line)',
            color: 'var(--goa-fg-3)',
          }}
        >
          <GIcon name="arrow-up" size={14} />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 6,
          padding: '0 4px',
          fontSize: 10,
          color: 'var(--goa-fg-3)',
        }}
      >
        <GIcon name="shield-check" size={10} style={{ color: GOLD }} />
        <span>Page context attached when active · actions ask before they run</span>
      </div>
    </div>
  );
};

function AskGoaKeyframes() {
  return (
    <style>{`
      @keyframes agPulse {
        0%   { transform: scale(1);    opacity: 0.45; }
        75%  { transform: scale(1.22); opacity: 0;    }
        100% { transform: scale(1.22); opacity: 0;    }
      }
      @keyframes agIn {
        from { opacity: 0; transform: translateY(8px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  );
}
