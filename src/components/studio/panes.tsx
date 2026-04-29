// MERGE-NOTE: studio — ShapeShifter addition. The 5 Goa-designed Studio surfaces,
// ported verbatim from `reference/mockups/phase-1.2/components/studio-panes.jsx`
// (which Goa generated for surface 09 in the canvas).
//
// Surfaces:
//   StdAppDetail — browse mode (read-only)
//   StdPropose   — propose changes (forked, hero)
//   StdScratch   — build from scratch (empty canvas)
//   StdLaunch    — Dev → Beta → Prod stepper
//   StdReview    — Allan's review queue
//
// D-21: each surface ships with mock content (Maria, Renewals desk, etc.) for
// visual P1.2 approval. Real data wiring lands in P1.3+; at that point each
// surface swaps its `STD_*` import for a hook against the daemon.

import { useState, type ReactNode } from 'react';

import { GIcon } from '../../lib/goa/tokens';
import {
  STD_GOLD,
  STD_FOCUS_APP,
  STD_CHAT_BROWSE,
  STD_CHAT_PROPOSE,
  STD_CHAT_SCRATCH,
  STD_DIFF,
  STD_PREVIEW_LETTER,
  STD_TESTS,
  STD_REVIEW_QUEUE,
  STD_LAUNCH_APP,
  STD_LAUNCH_STEPS,
  STD_HIVE_ENV,
  STD_BETA_TESTERS,
  type StdMessage,
} from './data';

const KNOT_BG = '/assets/shapeshifter-knot-gold-on-black.png';

type ShellProps = {
  leftHeader: ReactNode;
  leftBody: ReactNode;
  leftFooter?: ReactNode;
  rightHeader: ReactNode;
  rightBody: ReactNode;
  leftWidth?: number;
};

function StdShell({ leftHeader, leftBody, leftFooter, rightHeader, rightBody, leftWidth = 380 }: ShellProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: `${leftWidth}px 1fr`,
        background: 'var(--goa-bg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          borderRight: '1px solid var(--goa-line)',
          background: 'var(--goa-bg-elev)',
        }}
      >
        {leftHeader}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{leftBody}</div>
        {leftFooter}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        {rightHeader}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{rightBody}</div>
      </div>
    </div>
  );
}

function StdChatHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid var(--goa-line)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: '#0b0b0d',
          backgroundImage: `url("${KNOT_BG}")`,
          backgroundSize: '74%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--goa-fg)' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--goa-fg-3)' }}>{subtitle}</div>
      </div>
      {badge}
    </div>
  );
}

function StdChatBubble({ m }: { m: StdMessage }) {
  const isMaria = m.role === 'maria';
  const isGoa = m.role === 'goa';
  return (
    <div style={{ display: 'flex', justifyContent: isMaria ? 'flex-end' : 'flex-start', marginBottom: 12, gap: 8 }}>
      {isGoa && (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            flexShrink: 0,
            background: '#0b0b0d',
            backgroundImage: `url("${KNOT_BG}")`,
            backgroundSize: '74%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5)',
            marginTop: 2,
          }}
        />
      )}
      <div
        style={{
          maxWidth: '82%',
          padding: '9px 12px',
          borderRadius: 14,
          background: isMaria ? 'var(--goa-fg)' : 'var(--goa-surface-2)',
          color: isMaria ? 'var(--goa-bg)' : 'var(--goa-fg)',
          fontSize: 13,
          lineHeight: 1.55,
          border: isMaria ? 'none' : '1px solid var(--goa-line)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {m.text.split('\n').map((line, i) => {
          const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
          return (
            <div key={i} style={{ minHeight: line === '' ? 6 : undefined }}>
              {parts.map((p, j) => {
                if (p.startsWith('**')) return <b key={j}>{p.slice(2, -2)}</b>;
                if (p.startsWith('`'))
                  return (
                    <code
                      key={j}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: 11.5,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: isMaria ? 'oklch(30% 0.012 250)' : 'var(--goa-bg)',
                        border: isMaria ? 'none' : '1px solid var(--goa-line)',
                      }}
                    >
                      {p.slice(1, -1)}
                    </code>
                  );
                return <span key={j}>{p}</span>;
              })}
            </div>
          );
        })}
        {m.tool_use && (
          <div
            style={{
              marginTop: 8,
              padding: '7px 10px',
              borderRadius: 8,
              background: 'oklch(96% 0.04 80)',
              border: '1px solid oklch(85% 0.08 80)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11.5,
            }}
          >
            <GIcon name="pencil" size={11} style={{ color: STD_GOLD }} />
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: STD_GOLD, fontWeight: 700 }}>
              {m.tool_use.file}
            </span>
            <span style={{ color: 'var(--goa-fg-3)' }}>{m.tool_use.summary}</span>
          </div>
        )}
        <div style={{ fontSize: 10.5, marginTop: 4, color: isMaria ? 'oklch(85% 0.005 250 / 0.7)' : 'var(--goa-fg-3)' }}>
          {m.when}
        </div>
      </div>
    </div>
  );
}

function StdComposer({ placeholder = 'Ask Goa…' }: { placeholder?: string }) {
  return (
    <div style={{ borderTop: '1px solid var(--goa-line)', padding: 14, background: 'var(--goa-bg-elev)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          padding: '9px 9px 9px 14px',
          background: 'var(--goa-bg)',
          border: '1px solid var(--goa-line)',
          borderRadius: 16,
        }}
      >
        <span style={{ flex: 1, fontSize: 13, color: 'var(--goa-fg-3)', padding: '4px 0' }}>{placeholder}</span>
        <button
          type="button"
          style={{
            all: 'unset',
            cursor: 'pointer',
            width: 30,
            height: 30,
            borderRadius: 15,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--goa-fg)',
            color: 'var(--goa-bg)',
          }}
        >
          <GIcon name="arrow-up" size={13} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 11, color: 'var(--goa-fg-3)' }}>
        <GIcon name="shield-check" size={11} style={{ color: STD_GOLD }} />
        <span>Read-only access · changes save as a draft until you submit</span>
      </div>
    </div>
  );
}

function StdCanvasHeader({
  title,
  subtitle,
  tabs,
  actions,
}: {
  title: string;
  subtitle: string;
  tabs?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 22px',
        borderBottom: '1px solid var(--goa-line)',
        background: 'var(--goa-bg-elev)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--goa-fg)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{subtitle}</div>
      </div>
      {tabs}
      <div style={{ flex: 1 }} />
      {actions}
    </div>
  );
}

type BtnTone = 'primary' | 'gold' | 'ghost' | 'danger';

function StdBtn({ icon, label, tone = 'ghost' }: { icon?: string; label: string; tone?: BtnTone }) {
  const palettes: Record<BtnTone, { bg: string; fg: string; border: string }> = {
    primary: { bg: 'var(--goa-fg)', fg: 'var(--goa-bg)', border: 'transparent' },
    gold: { bg: 'oklch(28% 0.06 75)', fg: STD_GOLD, border: STD_GOLD },
    ghost: { bg: 'var(--goa-bg-elev)', fg: 'var(--goa-fg-2)', border: 'var(--goa-line)' },
    danger: { bg: 'oklch(56% 0.20 25)', fg: '#fff', border: 'transparent' },
  };
  const p = palettes[tone];
  return (
    <button
      type="button"
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        background: p.bg,
        color: p.fg,
        border: '1px solid ' + p.border,
      }}
    >
      {icon && <GIcon name={icon} size={12} />}
      {label}
    </button>
  );
}

function StdLetterPreview() {
  const p = STD_PREVIEW_LETTER;
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 40px', background: 'oklch(96% 0.005 240)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 11.5, color: 'var(--goa-fg-3)' }}>Tenant</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--goa-bg-elev)',
            border: '1px solid var(--goa-line)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--goa-fg)',
          }}
        >
          {p.tenant_name} · {p.unit}
          <GIcon name="chevron-down" size={11} style={{ color: 'var(--goa-fg-3)' }} />
        </div>
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'oklch(96% 0.04 80)',
            border: '1px solid oklch(85% 0.08 80)',
            fontSize: 11,
            fontWeight: 700,
            color: STD_GOLD,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <GIcon name="globe" size={10} />
          Lang · {p.language_chip}
        </span>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid var(--goa-line)',
          borderRadius: 12,
          padding: '36px 44px',
          boxShadow: '0 6px 18px rgba(8, 12, 28, 0.06)',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            paddingBottom: 14,
            borderBottom: '1px solid var(--goa-line)',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: '#0b0b0d',
              backgroundImage: `url("${KNOT_BG}")`,
              backgroundSize: '74%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: STD_GOLD,
                textTransform: 'uppercase',
              }}
            >
              Drewlo · Casa Linda
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--goa-fg-3)' }}>Renewal of lease · 22 abril 2026</div>
          </div>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 10.5,
              color: 'var(--goa-fg-3)',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          >
            Apt 4B · {p.current_rent} → {p.new_rent}
          </span>
        </div>

        <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--goa-fg)', fontFamily: 'Georgia, ui-serif, serif' }}>
          {p.body_es.map((line, i) => (
            <p key={i} style={{ margin: line === '' ? '12px 0' : '0 0 8px', minHeight: line === '' ? 8 : undefined }}>
              {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                part.startsWith('**') ? (
                  <b key={j} style={{ color: STD_GOLD }}>
                    {part.slice(2, -2)}
                  </b>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          maxWidth: 720,
          margin: '14px auto 0',
          padding: '10px 14px',
          borderRadius: 10,
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          fontSize: 11.5,
          color: 'var(--goa-fg-3)',
        }}
      >
        <GIcon name="clock" size={12} />
        <span>
          Live preview · re-renders when you edit · last update <b style={{ color: 'var(--goa-fg-2)' }}>2s ago</b>
        </span>
      </div>
    </div>
  );
}

export function StdAppDetail() {
  return (
    <StdShell
      leftWidth={400}
      leftHeader={
        <StdChatHeader
          title="Studio · Renewals desk"
          subtitle="Browsing · read-only"
          badge={
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999,
                background: 'oklch(95% 0.04 145)',
                color: 'oklch(40% 0.14 145)',
                border: '1px solid oklch(85% 0.08 145)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Production
            </span>
          }
        />
      }
      leftBody={
        <div style={{ padding: '14px 18px' }}>
          {STD_CHAT_BROWSE.map((m, i) => (
            <StdChatBubble key={i} m={m} />
          ))}
        </div>
      }
      leftFooter={
        <div
          style={{
            borderTop: '1px solid var(--goa-line)',
            padding: 14,
            background: 'var(--goa-bg-elev)',
            display: 'flex',
            gap: 8,
          }}
        >
          <StdBtn icon="git-branch" label="Fork & propose changes" tone="primary" />
          <StdBtn icon="file-text" label="See prompt" tone="ghost" />
        </div>
      }
      rightHeader={
        <StdCanvasHeader
          title="How it runs"
          subtitle="Live · last invocation 4 min ago by Diego"
          actions={
            <>
              <StdBtn icon="play" label="Run a sample" tone="ghost" />
              <StdBtn icon="external-link" label="Open card" tone="ghost" />
            </>
          }
        />
      }
      rightBody={<StdAppDetailCanvas />}
    />
  );
}

function StdAppDetailCanvas() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'oklch(96% 0.005 240)' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--goa-line)',
          borderRadius: 14,
          padding: '22px 26px',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: STD_GOLD,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GIcon name="file-text" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--goa-fg)' }}>
              {STD_FOCUS_APP.title}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--goa-fg-3)', marginTop: 3 }}>
              by {STD_FOCUS_APP.owner} · {STD_FOCUS_APP.used_by} active users · {STD_FOCUS_APP.forks} forks
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--goa-fg-2)', lineHeight: 1.55, marginTop: 8 }}>
              {STD_FOCUS_APP.blurb}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--goa-fg-3)',
            marginBottom: 8,
          }}
        >
          How it works
        </div>
        {[
          { n: 1, title: 'Reads payment history', detail: '12 months of rent payments per tenant from Hive.' },
          { n: 2, title: 'Pulls comparable rates', detail: 'Within 0.5 mi, ±10% sqft, from MLS sub-market data.' },
          { n: 3, title: 'Drafts the letter', detail: 'Comp median minus 1.5% for rate-sensitive tenants.' },
        ].map((s) => (
          <div
            key={s.n}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--goa-line)',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: 'oklch(96% 0.04 80)',
                color: STD_GOLD,
                border: '1px solid oklch(85% 0.08 80)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s.n}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--goa-fg)' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--goa-fg-3)', marginTop: 1 }}>{s.detail}</div>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--goa-surface-2)',
            border: '1px solid var(--goa-line)',
            fontSize: 12,
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
            <GIcon name="info" size={12} style={{ color: STD_GOLD }} /> What you can change
          </div>
          When you fork, you can edit the prompt, change the rate-card numbers, add tools, or branch the logic by tenant
          type. You can't change the data sources — those stay read-only.
        </div>
      </div>
    </div>
  );
}

export function StdPropose() {
  const [tab, setTab] = useState<'preview' | 'diff' | 'tests'>('preview');
  return (
    <StdShell
      leftWidth={420}
      leftHeader={
        <StdChatHeader
          title="Studio · Renewals desk"
          subtitle="Your fork · 1 file modified · saved 14s ago"
          badge={
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999,
                background: 'oklch(96% 0.04 80)',
                color: STD_GOLD,
                border: '1px solid oklch(85% 0.08 80)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Draft
            </span>
          }
        />
      }
      leftBody={
        <div style={{ padding: '14px 18px' }}>
          {STD_CHAT_PROPOSE.map((m, i) => (
            <StdChatBubble key={i} m={m} />
          ))}
        </div>
      }
      leftFooter={
        <>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--goa-line)', display: 'flex', gap: 8 }}>
            <StdBtn icon="check" label="Submit for review" tone="gold" />
            <StdBtn icon="trash-2" label="Discard fork" tone="ghost" />
            <span style={{ flex: 1 }} />
            <StdBtn icon="git-compare" label="See diff" tone="ghost" />
          </div>
          <StdComposer placeholder="Ask Goa to change something…" />
        </>
      }
      rightHeader={
        <StdCanvasHeader
          title="Renewals desk · live preview"
          subtitle="Your fork · changes applied"
          tabs={
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--goa-surface-2)',
                borderRadius: 8,
                border: '1px solid var(--goa-line)',
                marginLeft: 10,
              }}
            >
              {(
                [
                  { id: 'preview', label: 'Preview', icon: 'eye' },
                  { id: 'diff', label: 'Diff', icon: 'git-compare' },
                  { id: 'tests', label: 'Tests', icon: 'check-circle' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: tab === t.id ? 'var(--goa-bg-elev)' : 'transparent',
                    color: tab === t.id ? 'var(--goa-fg)' : 'var(--goa-fg-3)',
                    boxShadow: tab === t.id ? '0 1px 2px rgba(8, 12, 28, 0.06)' : 'none',
                    margin: 2,
                  }}
                >
                  <GIcon name={t.icon} size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          }
          actions={
            <>
              <StdBtn icon="refresh-cw" label="Re-run" tone="ghost" />
              <StdBtn icon="rotate-ccw" label="Undo" tone="ghost" />
            </>
          }
        />
      }
      rightBody={tab === 'preview' ? <StdLetterPreview /> : tab === 'diff' ? <StdDiffView /> : <StdTestsView />}
    />
  );
}

function StdDiffView() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px 28px', background: 'var(--goa-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--goa-fg)',
          }}
        >
          system_prompt.md
        </span>
        <span style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>4 added · 1 removed</span>
      </div>
      <div
        style={{
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          borderRadius: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          fontSize: 12.5,
          lineHeight: 1.65,
          overflow: 'hidden',
        }}
      >
        {STD_DIFF.map((row, i) => {
          const bg =
            row.kind === 'add' ? 'oklch(96% 0.05 145)' : row.kind === 'remove' ? 'oklch(96% 0.05 25)' : 'transparent';
          const fg =
            row.kind === 'add' ? 'oklch(35% 0.12 145)' : row.kind === 'remove' ? 'oklch(40% 0.14 25)' : 'var(--goa-fg)';
          const sign = row.kind === 'add' ? '+' : row.kind === 'remove' ? '−' : ' ';
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '52px 24px 1fr',
                background: bg,
                color: fg,
                padding: '0 14px',
              }}
            >
              <span style={{ textAlign: 'right', paddingRight: 12, color: 'var(--goa-fg-3)', userSelect: 'none' }}>
                {row.line}
              </span>
              <span style={{ textAlign: 'center', color: 'var(--goa-fg-3)', userSelect: 'none' }}>{sign}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{row.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StdTestsView() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--goa-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--goa-fg)' }}>Test results</span>
        <span style={{ fontSize: 11, color: 'oklch(40% 0.14 145)', fontWeight: 600 }}>2 passing</span>
        <span style={{ fontSize: 11, color: 'oklch(48% 0.16 75)', fontWeight: 600 }}>1 warning</span>
        <span style={{ flex: 1 }} />
        <StdBtn icon="play" label="Re-run all" tone="ghost" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STD_TESTS.map((t) => {
          const tone =
            t.status === 'pass'
              ? { bg: 'oklch(96% 0.04 145)', fg: 'oklch(40% 0.14 145)', border: 'oklch(85% 0.08 145)', icon: 'check-circle' }
              : t.status === 'warn'
              ? { bg: 'oklch(96% 0.05 75)', fg: 'oklch(45% 0.14 75)', border: 'oklch(85% 0.10 75)', icon: 'alert-circle' }
              : { bg: 'oklch(96% 0.05 25)', fg: 'oklch(45% 0.16 25)', border: 'oklch(85% 0.10 25)', icon: 'x-circle' };
          return (
            <div
              key={t.id}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <GIcon name={tone.icon} size={16} style={{ color: tone.fg, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: tone.fg,
                  }}
                >
                  {t.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--goa-fg-2)', marginTop: 1 }}>{t.detail}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{t.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StdScratch() {
  return (
    <StdShell
      leftWidth={420}
      leftHeader={
        <StdChatHeader title="Studio · New project" subtitle="Your own Docker workspace · Hive backend ready" />
      }
      leftBody={
        <div style={{ padding: '14px 18px' }}>
          {STD_CHAT_SCRATCH.map((m, i) => (
            <StdChatBubble key={i} m={m} />
          ))}
        </div>
      }
      leftFooter={<StdComposer placeholder="What do you want to build?" />}
      rightHeader={<StdCanvasHeader title="Empty canvas" subtitle="Will fill as you describe what you want" />}
      rightBody={<StdScratchCanvas />}
    />
  );
}

function StdScratchCanvas() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(96% 0.005 240)',
        backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(88% 0.005 240) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 460,
          padding: '36px 32px',
          borderRadius: 18,
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          boxShadow: '0 6px 18px rgba(8, 12, 28, 0.06)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            margin: '0 auto 14px',
            background: '#0b0b0d',
            backgroundImage: `url("${KNOT_BG}")`,
            backgroundSize: '74%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5)',
          }}
        />
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--goa-fg)' }}>
          Tell Goa what you need
        </div>
        <div style={{ fontSize: 13, color: 'var(--goa-fg-3)', marginTop: 6, lineHeight: 1.55 }}>
          A few examples to get unstuck:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 14, textAlign: 'left' }}>
          {[
            'Help tenants schedule move-out cleanings',
            'Auto-summarize the daily concrete pour reports',
            'Send weekly KPI digests to investors',
          ].map((s) => (
            <button
              key={s}
              type="button"
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '9px 12px',
                borderRadius: 9,
                background: 'var(--goa-surface-2)',
                border: '1px solid var(--goa-line)',
                fontSize: 12.5,
                color: 'var(--goa-fg-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <GIcon name="sparkles" size={11} style={{ color: STD_GOLD }} />
              <span>{s}</span>
              <span style={{ flex: 1 }} />
              <GIcon name="arrow-right" size={11} style={{ color: 'var(--goa-fg-3)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StdLaunch() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: 'oklch(96% 0.005 240)',
        padding: '32px 40px',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 13,
              background: STD_GOLD,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GIcon name="rocket" size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: STD_GOLD,
                textTransform: 'uppercase',
              }}
            >
              Launch
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '2px 0 4px',
                color: 'var(--goa-fg)',
              }}
            >
              {STD_LAUNCH_APP.name}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--goa-fg-3)' }}>
              by {STD_LAUNCH_APP.author} · built in {STD_LAUNCH_APP.built_in} · {STD_LAUNCH_APP.iterations} iterations
            </div>
          </div>
          <StdBtn icon="rocket" label="Launch to beta" tone="gold" />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            padding: 18,
            borderRadius: 14,
            background: 'var(--goa-bg-elev)',
            border: '1px solid var(--goa-line)',
            marginBottom: 18,
            position: 'relative',
          }}
        >
          {STD_LAUNCH_STEPS.map((s, i) => {
            const isDone = s.state === 'done';
            const isCurrent = s.state === 'current';
            const dotBg = isDone ? 'oklch(60% 0.14 145)' : isCurrent ? STD_GOLD : 'var(--goa-bg)';
            const dotFg = isDone || isCurrent ? '#fff' : 'var(--goa-fg-3)';
            const dotBorder = isDone || isCurrent ? 'transparent' : 'var(--goa-line)';
            return (
              <div key={s.id} style={{ position: 'relative' }}>
                {i < STD_LAUNCH_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 7px)',
                      top: 16,
                      width: 14,
                      height: 1,
                      background: 'var(--goa-line)',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: dotBg,
                      color: dotFg,
                      border: '1.5px solid ' + dotBorder,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {isDone ? <GIcon name="check" size={14} /> : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--goa-fg)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: isCurrent ? STD_GOLD : 'var(--goa-fg-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {s.hint}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--goa-fg-2)', lineHeight: 1.5 }}>{s.detail}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 14,
            background: 'var(--goa-bg-elev)',
            border: '1px solid var(--goa-line)',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--goa-fg)' }}>Beta testers</div>
              <div style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>
                3 of 10 selected · they'll see this app on their springboard immediately
              </div>
            </div>
            <StdBtn icon="user-plus" label="Invite by email" tone="ghost" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STD_BETA_TESTERS.map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 10px',
                  borderRadius: 9,
                  background: t.selected ? 'oklch(96% 0.04 80)' : 'transparent',
                  border: '1px solid ' + (t.selected ? 'oklch(85% 0.08 80)' : 'transparent'),
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: t.selected ? STD_GOLD : 'var(--goa-bg)',
                    border: '1.5px solid ' + (t.selected ? STD_GOLD : 'var(--goa-line)'),
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {t.selected && <GIcon name="check" size={10} />}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: t.tone,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {t.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--goa-fg)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 14,
            background: 'var(--goa-bg-elev)',
            border: '1px solid var(--goa-line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--goa-fg)' }}>Hive backend</div>
              <div style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>Environment variables · injected at deploy</div>
            </div>
            <StdBtn icon="plus" label="Add variable" tone="ghost" />
          </div>
          <div style={{ borderRadius: 9, overflow: 'hidden', border: '1px solid var(--goa-line)' }}>
            {STD_HIVE_ENV.map((e, i) => (
              <div
                key={e.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr auto',
                  gap: 12,
                  padding: '10px 14px',
                  background: i % 2 ? 'var(--goa-bg)' : 'transparent',
                  borderBottom: i < STD_HIVE_ENV.length - 1 ? '1px solid var(--goa-line)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: 12,
                    fontWeight: 700,
                    color: STD_GOLD,
                  }}
                >
                  {e.key}
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: 12,
                    color: 'var(--goa-fg)',
                  }}
                >
                  {e.value}
                </span>
                <span style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{e.hint}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StdReview() {
  const focused = STD_REVIEW_QUEUE.find((p) => p.selected);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--goa-bg)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 22px',
          borderBottom: '1px solid var(--goa-line)',
          background: 'var(--goa-bg-elev)',
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--goa-fg)' }}>
            Review queue
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--goa-fg-3)' }}>
            3 awaiting review · 1 changes requested · 1 approved this week
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StdBtn icon="filter" label="Filter" tone="ghost" />
        <StdBtn icon="external-link" label="Open in GitHub" tone="ghost" />
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: 0 }}>
        <div
          style={{
            borderRight: '1px solid var(--goa-line)',
            overflowY: 'auto',
            background: 'var(--goa-bg-elev)',
          }}
        >
          {STD_REVIEW_QUEUE.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '14px 16px',
                background: p.selected ? 'var(--goa-bg)' : 'transparent',
                borderLeft: p.selected ? `3px solid ${STD_GOLD}` : '3px solid transparent',
                borderBottom: '1px solid var(--goa-line)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    background: p.avatar_tone,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9.5,
                    fontWeight: 700,
                  }}
                >
                  {p.initials}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    color: 'var(--goa-fg-3)',
                  }}
                >
                  {p.id}
                </span>
                <span style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>·</span>
                <span style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{p.app}</span>
                <span style={{ flex: 1 }} />
                <StdReviewStatus status={p.status} />
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: p.selected ? 700 : 600,
                  color: 'var(--goa-fg)',
                  lineHeight: 1.35,
                }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--goa-fg-3)', marginTop: 2 }}>
                {p.author} · {p.when}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 6,
                  fontSize: 10.5,
                  color: 'var(--goa-fg-3)',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                }}
              >
                <span style={{ color: 'oklch(40% 0.14 145)' }}>+{p.diff_stat.added}</span>
                <span style={{ color: 'oklch(45% 0.16 25)' }}>−{p.diff_stat.removed}</span>
                <span>{p.diff_stat.files} files</span>
                <span style={{ flex: 1 }} />
                <span>
                  <b style={{ color: 'oklch(40% 0.14 145)' }}>{p.tests.passing}</b> ✓
                </span>
                {p.tests.warning > 0 && (
                  <span>
                    <b style={{ color: 'oklch(48% 0.16 75)' }}>{p.tests.warning}</b> !
                  </span>
                )}
                {p.tests.failing > 0 && (
                  <span>
                    <b style={{ color: 'oklch(45% 0.16 25)' }}>{p.tests.failing}</b> ✗
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {focused && <StdReviewDetail p={focused} />}
      </div>
    </div>
  );
}

type ReviewStatus = 'awaiting-review' | 'changes-requested' | 'approved';

function StdReviewStatus({ status }: { status: ReviewStatus }) {
  const tones: Record<ReviewStatus, { label: string; bg: string; fg: string; border: string }> = {
    'awaiting-review': { label: 'Awaiting review', bg: 'oklch(96% 0.04 80)', fg: STD_GOLD, border: 'oklch(85% 0.08 80)' },
    'changes-requested': {
      label: 'Changes requested',
      bg: 'oklch(96% 0.05 25)',
      fg: 'oklch(48% 0.16 25)',
      border: 'oklch(85% 0.08 25)',
    },
    approved: { label: 'Approved', bg: 'oklch(95% 0.04 145)', fg: 'oklch(40% 0.14 145)', border: 'oklch(85% 0.08 145)' },
  };
  const t = tones[status];
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 7px',
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: '1px solid ' + t.border,
      }}
    >
      {t.label}
    </span>
  );
}

function StdReviewDetail({ p }: { p: (typeof STD_REVIEW_QUEUE)[number] }) {
  return (
    <div style={{ overflowY: 'auto', padding: '24px 32px', background: 'var(--goa-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: p.avatar_tone,
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {p.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--goa-fg-3)',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          >
            {p.id} · {p.app}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '2px 0 4px',
              color: 'var(--goa-fg)',
            }}
          >
            {p.title}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--goa-fg-3)' }}>
            by {p.author} · {p.when}
          </div>
        </div>
        <StdBtn icon="message-square" label="Comment" tone="ghost" />
      </div>

      <div style={{ fontSize: 13, color: 'var(--goa-fg-2)', lineHeight: 1.6, marginBottom: 18 }}>{p.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        <StdReviewKpi
          icon="git-pull-request"
          label="Diff"
          value={`+${p.diff_stat.added} / −${p.diff_stat.removed}`}
          hint={`${p.diff_stat.files} files`}
        />
        <StdReviewKpi
          icon="check-circle"
          label="Tests"
          value={`${p.tests.passing} pass`}
          hint={p.tests.warning ? `${p.tests.warning} warning` : 'all green'}
          tone={p.tests.warning ? 'warn' : 'good'}
        />
        <StdReviewKpi icon="users" label="Affected users" value="47" hint="active users on this app" />
      </div>

      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--goa-fg-3)',
          marginBottom: 8,
        }}
      >
        What changed
      </div>
      <StdDiffView />

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 18,
          padding: '14px 16px',
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 -4px 12px rgba(8, 12, 28, 0.04)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--goa-fg-3)' }}>Decide for Maria's fork</span>
        <span style={{ flex: 1 }} />
        <StdBtn icon="message-square" label="Request changes" tone="ghost" />
        <StdBtn icon="check" label="Approve & merge" tone="gold" />
      </div>
    </div>
  );
}

function StdReviewKpi({
  icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'neutral' | 'good' | 'warn';
}) {
  const fg = tone === 'good' ? 'oklch(40% 0.14 145)' : tone === 'warn' ? 'oklch(45% 0.14 75)' : 'var(--goa-fg)';
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        background: 'var(--goa-bg-elev)',
        border: '1px solid var(--goa-line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--goa-fg-3)',
        }}
      >
        <GIcon name={icon} size={11} /> {label}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.015em',
          color: fg,
          marginTop: 3,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--goa-fg-3)' }}>{hint}</div>
    </div>
  );
}
