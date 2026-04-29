/* === Ask Goa — Universal FAB =============================================
   Single floating-action button bottom-right of every surface. Replaces the
   feedback-only bot. Opens a context-aware chat thread where the user can:

     1. Ask page-aware Q&A          ("what does this column mean?")
     2. Get tutorial / how-to help  ("how do I add a file to a corpus?")
     3. Send feedback               ("this is broken")
     4. Authorize page actions      (Concierge proposes; user confirms)

   The FAB is a thin shell over /chat/* — same SSE infra, same agent. The
   "Concierge" agent receives a <page-context> block built from each
   surface's usePageContext() provider.

   Public:
     <AskGoa surface="Knowledge" route="/knowledge" pageContext={...}
             initialState="empty" bottomOffset={20} />

   States (seeded for showcase via initialState prop):
     'empty'        first-open, just the greeting + chips
     'qa'           Q&A in progress (assistant has answered with citations)
     'tool'         pending tool-call card awaiting confirmation
     'feedback'     pivoted to feedback mode after chip tap
     'tutorial'     tutorial walkthrough mid-stream
============================================================================ */

const { useState: useStateAG, useRef: useRefAG, useEffect: useEffectAG } = React;

if (typeof window.BC_GOLD === 'undefined') window.BC_GOLD = 'oklch(75% 0.135 75)';
if (typeof window.BC_VIP  === 'undefined') window.BC_VIP  = 'oklch(83% 0.155 88)';
const AG_GOLD = window.BC_GOLD;
const AG_VIP  = window.BC_VIP;

// ─── FAB ────────────────────────────────────────────────────────────────────
function AskGoaFAB({ open, onToggle, bottomOffset = 20, hint = false }) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? 'Close Ask Goa' : 'Open Ask Goa'}
      title="Ask Goa"
      style={{
        all: 'unset', cursor: 'pointer',
        position: 'absolute', right: 20, bottom: bottomOffset, zIndex: 60,
        width: 50, height: 50, borderRadius: 25,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0b0b0d',
        backgroundImage: open ? 'none' : 'url("assets/drewlo-knot-gold-on-black.png")',
        backgroundSize: '74%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        boxShadow: '0 10px 28px rgba(8, 12, 28, 0.36), 0 2px 6px rgba(207, 161, 76, 0.32), inset 0 0 0 1px rgba(207, 161, 76, 0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
        color: AG_GOLD,
        transition: 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
    >
      <span aria-hidden style={{
        position: 'absolute', inset: -3, borderRadius: 28,
        border: `1px solid ${AG_GOLD}`, opacity: 0.4,
        animation: 'agPulse 2.6s ease-out infinite',
      }} />
      {open && <GIcon name="chevron-down" size={20} style={{ position: 'relative', zIndex: 1, color: AG_GOLD }} />}
      {hint && !open && (
        <span aria-hidden style={{
          position: 'absolute', top: 4, right: 4,
          width: 10, height: 10, borderRadius: 5,
          background: 'oklch(0.66 0.16 150)',
          border: '2px solid #fff',
        }} />
      )}
      <style>{`
        @keyframes agPulse {
          0%   { transform: scale(1);    opacity: 0.45; }
          75%  { transform: scale(1.22); opacity: 0;    }
          100% { transform: scale(1.22); opacity: 0;    }
        }
      `}</style>
    </button>
  );
}

// Goa wordmark glyph — a stylized "G" using a circular arc + dot.
// Lighter than a full word, denser than a generic sparkle.
function AskGoaGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }} aria-hidden>
      <path d="M19 8.2A8 8 0 1 0 19.6 16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="12.4" r="1.8" fill="#fff" />
    </svg>
  );
}

// ─── Bubble ─────────────────────────────────────────────────────────────────
function AGBubble({ side = 'goa', children, meta, glyph = false }) {
  const isUser = side === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end', gap: 6, marginBottom: 10,
    }}>
      {!isUser && glyph && (
        <div style={{
          width: 22, height: 22, borderRadius: 11, flexShrink: 0,
          background: '#0b0b0d',
          backgroundImage: 'url("assets/drewlo-knot-gold-on-black.png")',
          backgroundSize: '74%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5)',
          marginBottom: 2,
        }} />
      )}
      <div style={{
        maxWidth: '84%',
        padding: '9px 12px', borderRadius: 14,
        background: isUser ? 'var(--goa-fg)' : 'var(--goa-surface-2)',
        color: isUser ? 'var(--goa-bg)' : 'var(--goa-fg)',
        fontSize: 13.5, lineHeight: 1.45,
        border: isUser ? 'none' : '1px solid var(--goa-line)',
        borderTopLeftRadius: !isUser ? 4 : 14,
        borderTopRightRadius: isUser ? 4 : 14,
      }}>
        {children}
        {meta && <div style={{
          fontSize: 10.5, marginTop: 4,
          color: isUser ? 'oklch(0.85 0.005 250 / 0.7)' : 'var(--goa-fg-3)',
        }}>{meta}</div>}
      </div>
    </div>
  );
}

// ─── Tool-call card (Concierge proposes a page action) ─────────────────────
function AGToolCard({ tool, onAllow, onDeny, settled }) {
  return (
    <div style={{
      margin: '4px 0 12px 28px',
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid var(--goa-line)',
      background: 'var(--goa-bg-elev)',
      boxShadow: '0 2px 8px rgba(8,12,28,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: settled === 'allowed' ? 'oklch(0.95 0.04 150)' : settled === 'denied' ? 'oklch(0.96 0.02 25)' : 'var(--goa-surface-2)',
        borderBottom: '1px solid var(--goa-line)',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: settled === 'allowed' ? 'oklch(0.55 0.16 150)' : settled === 'denied' ? 'oklch(0.55 0.18 25)' : AG_GOLD,
        }}>
          <GIcon name={settled === 'allowed' ? 'check' : settled === 'denied' ? 'x' : tool.icon} size={12} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--goa-fg-2)' }}>
          {settled === 'allowed' ? 'Action ran' : settled === 'denied' ? 'Action denied' : 'Action proposed'}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 10.5, color: 'var(--goa-fg-3)' }}>
          {tool.name}
        </span>
      </div>
      <div style={{ padding: '10px 12px', fontSize: 12.5, color: 'var(--goa-fg)' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{tool.title}</div>
        <div style={{ color: 'var(--goa-fg-2)', lineHeight: 1.45, marginBottom: 8 }}>{tool.summary}</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 3,
          padding: '8px 10px', borderRadius: 8,
          background: 'var(--goa-surface-2)',
          border: '1px solid var(--goa-line)',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11,
        }}>
          {tool.args.map((a, i) => (
            <React.Fragment key={i}>
              <span style={{ color: 'var(--goa-fg-3)' }}>{a.k}</span>
              <span style={{ color: 'var(--goa-fg-2)' }}>{a.v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      {!settled && (
        <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px' }}>
          <button onClick={onDeny} style={{
            all: 'unset', cursor: 'pointer',
            flex: 1, textAlign: 'center',
            padding: '7px 10px', borderRadius: 9,
            fontSize: 12, fontWeight: 600, color: 'var(--goa-fg-2)',
            background: 'var(--goa-surface-2)', border: '1px solid var(--goa-line)',
          }}>Deny</button>
          <button onClick={onAllow} style={{
            all: 'unset', cursor: 'pointer',
            flex: 1.4, textAlign: 'center',
            padding: '7px 10px', borderRadius: 9,
            fontSize: 12, fontWeight: 700, color: '#fff',
            background: `linear-gradient(160deg, ${AG_VIP}, ${AG_GOLD})`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 1px 3px rgba(207,161,76,0.32)',
          }}>Allow once</button>
        </div>
      )}
    </div>
  );
}

// ─── Citation pill (links to the doc the answer was drawn from) ─────────────
function AGCitation({ source, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '1px 7px 1px 6px', borderRadius: 999,
      fontSize: 10.5, fontWeight: 600,
      background: 'var(--goa-surface-2)', border: '1px solid var(--goa-line)',
      color: 'var(--goa-fg-2)', verticalAlign: 'baseline',
      margin: '0 2px',
    }}>
      <GIcon name={source === 'docs' ? 'book-open' : source === 'kb' ? 'database' : 'file-text'} size={9} />
      <span style={{ fontFamily: source === 'kb' ? 'ui-monospace, SFMono-Regular, monospace' : 'inherit' }}>{label}</span>
    </span>
  );
}

// ─── Context strip — shows the structured page-context payload ──────────────
function AGContextStrip({ ctx, expanded, onToggle }) {
  const summary = ctx.selection ? `${ctx.selection.kind}: ${ctx.selection.name}` : `${ctx.surface} · ${ctx.route}`;
  return (
    <div style={{
      borderBottom: '1px solid var(--goa-line)',
      background: 'var(--goa-surface-2)',
    }}>
      <button onClick={onToggle} style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        padding: '7px 12px',
        fontSize: 11, color: 'var(--goa-fg-3)',
      }}>
        <GIcon name="map-pin" size={11} style={{ color: AG_GOLD }} />
        <span>Goa sees</span>
        <span style={{ color: 'var(--goa-fg-2)', fontWeight: 600 }}>{summary}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
          <GIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={11} />
        </span>
      </button>
      {expanded && (
        <div style={{
          padding: '0 12px 10px',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 10.5,
          color: 'var(--goa-fg-3)',
          display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 3,
        }}>
          <span>surface</span><span style={{ color: 'var(--goa-fg-2)' }}>{ctx.surface}</span>
          <span>route</span><span style={{ color: 'var(--goa-fg-2)' }}>{ctx.route}</span>
          {ctx.selection && (<>
            <span>selection</span><span style={{ color: 'var(--goa-fg-2)' }}>{ctx.selection.kind} · {ctx.selection.name}</span>
          </>)}
          {ctx.visible && Object.entries(ctx.visible).map(([k, v]) => (
            <React.Fragment key={k}>
              <span>{k}</span><span style={{ color: 'var(--goa-fg-2)' }}>{String(v)}</span>
            </React.Fragment>
          ))}
          <span>theme</span><span style={{ color: 'var(--goa-fg-2)' }}>{ctx.theme}</span>
          <span>build</span><span style={{ color: 'var(--goa-fg-2)' }}>{ctx.build}</span>
        </div>
      )}
    </div>
  );
}

// ─── Seeded threads (one per state) ─────────────────────────────────────────
function seedThread(state, surface) {
  if (state === 'qa') {
    return [
      { id: 1, side: 'user', text: 'What does the "indexed" badge on a corpus actually mean?' },
      { id: 2, side: 'goa', kind: 'answer',
        body: (<>
          A corpus shows <b>Indexed</b> when every file it binds is fully embedded and
          searchable. New files trigger an incremental reindex (~30 s/file) — the badge
          flips to <b style={{ color: 'oklch(0.65 0.13 60)' }}>Reindexing</b> until done.
          You can force a rebuild from the corpus menu.
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AGCitation source="docs" label="docs/knowledge.md" />
            <AGCitation source="kb" label="bcs-engineering" />
          </div>
        </>),
      },
    ];
  }
  if (state === 'tool') {
    return [
      { id: 1, side: 'user', text: 'add the Q4 board pack to my Renewals knowledge' },
      { id: 2, side: 'goa', kind: 'answer',
        body: <>I can do that. The file is in <code>/Files/Q4-2025/board-pack.pdf</code> — adding it to <b>Renewals Knowledge</b> doesn't copy the file, just binds it for retrieval. Confirm?</>,
      },
      { id: 3, side: 'goa', kind: 'tool',
        tool: {
          name: 'addFileToCorpus', icon: 'database', title: 'Add file to corpus',
          summary: 'Bind board-pack.pdf to Renewals Knowledge — file stays in /Files; reindex runs in background.',
          args: [
            { k: 'fileId',   v: 'fil_8e21c4' },
            { k: 'corpusId', v: 'cor_renewals' },
            { k: 'reindex',  v: 'true' },
          ],
        },
      },
    ];
  }
  if (state === 'feedback') {
    return [
      { id: 1, side: 'user', text: 'This Files split-view scrolls weird on iPad — the right pane judders when I drag.' },
      { id: 2, side: 'goa', kind: 'answer',
        body: (<>
          Logged as <b style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>FB-4831</b> against the <b>Files</b> surface. I attached your viewport, theme, and the build SHA so the team can repro. Want me to mark it urgent?
          <div style={{ marginTop: 6 }}>
            <AGCitation source="ticket" label="FB-4831" />
          </div>
        </>),
      },
    ];
  }
  if (state === 'tutorial') {
    return [
      { id: 1, side: 'user', text: 'how do I share a note with someone outside Drewlo?' },
      { id: 2, side: 'goa', kind: 'answer',
        body: (<>
          From any note: hit <b>Share</b> top-right → switch to <b>Public link</b>. Anyone with the link can read it; toggle <b>Allow comments</b> if you want feedback. Public notes render unauth at <code style={{ fontSize: 11.5 }}>/share/note/[slug]</code>.
          <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--goa-surface-2)', border: '1px solid var(--goa-line)', fontSize: 11.5, color: 'var(--goa-fg-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontWeight: 700, color: 'var(--goa-fg)' }}>
              <GIcon name="lightbulb" size={11} style={{ color: AG_GOLD }} /> Tip
            </div>
            Public links are stamped with your name. Revoke any time from <b>Note settings → Sharing</b>.
          </div>
          <div style={{ marginTop: 6 }}>
            <AGCitation source="docs" label="docs/notes-sharing.md" />
          </div>
        </>),
      },
    ];
  }
  return []; // empty
}

// ─── Main panel ─────────────────────────────────────────────────────────────
function AskGoa({
  surface = 'Springboard',
  route = '/',
  pageContext = {},
  initialState = 'empty',
  initialOpen = false,
  bottomOffset = 20,
}) {
  const [open, setOpen] = useStateAG(initialOpen);
  const [thread, setThread] = useStateAG(() => seedThread(initialState, surface));
  const [draft, setDraft] = useStateAG('');
  const [chipMode, setChipMode] = useStateAG(initialState === 'feedback' ? 'feedback' : initialState === 'tutorial' ? 'tutorial' : 'ask');
  const [ctxOpen, setCtxOpen] = useStateAG(false);
  const [toolStates, setToolStates] = useStateAG({}); // { messageId: 'allowed' | 'denied' }
  const [thinking, setThinking] = useStateAG(false);
  const scrollerRef = useRefAG(null);
  const inputRef = useRefAG(null);

  const ctx = {
    surface,
    route,
    selection: pageContext.selection || null,
    visible: pageContext.visible || {},
    theme: typeof document !== 'undefined' ? (document.documentElement.dataset.theme || 'light') : 'light',
    build: 'rc1-p1.0428',
  };

  useEffectAG(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, thinking, open]);

  function pushUser(text, mode) {
    const id = Date.now();
    const userMsg = { id, side: 'user', text };
    setThread(t => [...t, userMsg]);
    setThinking(true);
    // Mock assistant reply
    setTimeout(() => {
      setThinking(false);
      const reply = mockReply(text, mode, ctx, id + 1);
      setThread(t => [...t, ...reply]);
    }, 700);
  }

  function onSend() {
    const v = draft.trim();
    if (!v) return;
    pushUser(v, chipMode);
    setDraft('');
  }

  function settleTool(messageId, verdict) {
    setToolStates(s => ({ ...s, [messageId]: verdict }));
    setTimeout(() => {
      setThread(t => [...t, {
        id: Date.now(), side: 'goa', kind: 'answer',
        body: verdict === 'allowed'
          ? <>Done. Reindex queued — I'll ping you when it's searchable.</>
          : <>Skipped. Anything else?</>,
      }]);
    }, 350);
  }

  // Default greeting based on chipMode
  const greeting = chipMode === 'feedback'
    ? <>Tell me what's broken or what would make <b>{surface}</b> better. I'll attach this page's context — viewport, route, build — so the team can debug without you typing it out.</>
    : chipMode === 'tutorial'
    ? <>I can walk you through anything in <b>{surface}</b>. Ask in plain language — "how do I…", "where is…", "what's the difference between…"</>
    : <>I'm Goa's concierge. I can answer about <b>{surface}</b>, run page actions for you, or take feedback. What do you need?</>;

  return (
    <>
      <AskGoaFAB open={open} onToggle={() => setOpen(o => !o)} bottomOffset={bottomOffset} />
      {open && (
        <div style={{
          position: 'absolute', right: 20, bottom: bottomOffset + 60, zIndex: 60,
          width: 'min(380px, calc(100% - 24px))',
          height: 'min(520px, calc(100% - 100px))',
          display: 'flex', flexDirection: 'column',
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          borderRadius: 22,
          boxShadow: '0 28px 64px rgba(8, 12, 28, 0.34), 0 2px 6px rgba(8,12,28,0.12)',
          overflow: 'hidden',
          animation: `agIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          transformOrigin: 'bottom right',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 12px 11px 14px',
            borderBottom: '1px solid var(--goa-line)',
            background: 'var(--goa-bg-elev)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: '#0b0b0d',
              backgroundImage: 'url("assets/drewlo-knot-gold-on-black.png")',
              backgroundSize: '74%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
              boxShadow: 'inset 0 0 0 1px rgba(207, 161, 76, 0.5), 0 1px 3px rgba(8, 12, 28, 0.2)',
              position: 'relative', flexShrink: 0,
            }}>
              <span aria-hidden style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 9, height: 9, borderRadius: 5,
                background: 'oklch(0.66 0.16 150)',
                border: '2px solid var(--goa-bg-elev)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--goa-fg)' }}>
                Ask Goa
              </div>
              <div style={{ fontSize: 11, color: 'var(--goa-fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: 'oklch(0.66 0.16 150)' }} />
                Concierge agent · claude-sonnet-latest
              </div>
            </div>
            <button title="Open in Chat" aria-label="Open in Chat" style={{
              all: 'unset', cursor: 'pointer',
              width: 28, height: 28, borderRadius: 14,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--goa-fg-3)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--goa-surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <GIcon name="external-link" size={15} />
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{
              all: 'unset', cursor: 'pointer',
              width: 28, height: 28, borderRadius: 14,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--goa-fg-3)',
            }}>
              <GIcon name="x" size={16} />
            </button>
          </div>

          {/* Context strip */}
          <AGContextStrip ctx={ctx} expanded={ctxOpen} onToggle={() => setCtxOpen(o => !o)} />

          {/* Messages */}
          <div ref={scrollerRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 4px' }}>
            {thread.length === 0 && (
              <AGBubble side="goa" glyph>{greeting}</AGBubble>
            )}
            {thread.map(m => {
              if (m.side === 'user') return <AGBubble key={m.id} side="user">{m.text}</AGBubble>;
              if (m.kind === 'tool') {
                const settled = toolStates[m.id];
                return (
                  <AGToolCard
                    key={m.id} tool={m.tool} settled={settled}
                    onAllow={() => settleTool(m.id, 'allowed')}
                    onDeny={() => settleTool(m.id, 'denied')}
                  />
                );
              }
              return <AGBubble key={m.id} side="goa" glyph>{m.body || m.text}</AGBubble>;
            })}
            {thinking && (
              <AGBubble side="goa" glyph>
                <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', padding: '2px 0' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--goa-fg-3)', animation: 'agDot 1.2s ease-in-out infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--goa-fg-3)', animation: 'agDot 1.2s ease-in-out 0.15s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--goa-fg-3)', animation: 'agDot 1.2s ease-in-out 0.3s infinite' }} />
                </span>
              </AGBubble>
            )}
          </div>

          {/* Chips */}
          <div style={{
            display: 'flex', gap: 5, padding: '6px 10px 0', flexWrap: 'wrap',
          }}>
            {[
              { id: 'ask',      label: 'Help with this page', icon: 'help-circle' },
              { id: 'tutorial', label: 'How do I…',            icon: 'book-open'   },
              { id: 'feedback', label: 'Send feedback',        icon: 'message-square' },
            ].map(c => {
              const active = chipMode === c.id;
              return (
                <button key={c.id} onClick={() => {
                  setChipMode(c.id);
                  if (c.id === 'feedback') inputRef.current?.focus();
                }} style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  background: active ? 'var(--goa-fg)' : 'transparent',
                  color: active ? 'var(--goa-bg)' : 'var(--goa-fg-3)',
                  border: '1px solid ' + (active ? 'var(--goa-fg)' : 'var(--goa-line)'),
                }}>
                  <GIcon name={c.icon} size={10} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Composer */}
          <div style={{
            padding: 10, paddingTop: 8,
            background: 'var(--goa-bg-elev)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 6,
              padding: '6px 6px 6px 12px',
              background: 'var(--goa-surface-2)',
              border: '1px solid var(--goa-line)',
              borderRadius: 18,
            }}>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                placeholder={
                  chipMode === 'feedback' ? `What's broken on ${surface}? What did you expect?`
                : chipMode === 'tutorial' ? `How do I… on ${surface}?`
                                          : `Ask about ${surface}…`
                }
                rows={1}
                style={{
                  flex: 1, resize: 'none', outline: 'none', border: 'none',
                  background: 'transparent', color: 'var(--goa-fg)',
                  fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.4,
                  maxHeight: 96, padding: '6px 0',
                }}
              />
              <button aria-label="Voice" style={{
                all: 'unset', cursor: 'pointer',
                width: 32, height: 32, borderRadius: 16,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--goa-fg-3)',
              }}>
                <GIcon name="mic" size={15} />
              </button>
              <button
                onClick={onSend}
                disabled={!draft.trim()}
                aria-label="Send"
                style={{
                  all: 'unset', cursor: draft.trim() ? 'pointer' : 'default',
                  width: 32, height: 32, borderRadius: 16,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: draft.trim() ? 'var(--goa-fg)' : 'var(--goa-line)',
                  color: draft.trim() ? 'var(--goa-bg)' : 'var(--goa-fg-3)',
                }}>
                <GIcon name="arrow-up" size={14} />
              </button>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              marginTop: 6, padding: '0 4px',
              fontSize: 10, color: 'var(--goa-fg-3)',
            }}>
              <GIcon name="shield-check" size={10} style={{ color: AG_GOLD }} />
              <span>Page context attached · actions ask before they run · {chipMode === 'feedback' ? 'routes to Allan' : 'thread carries to /chat'}</span>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes agIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes agDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40%           { opacity: 1;   transform: scale(1.1);  }
        }
      `}</style>
    </>
  );
}

// ─── Mock reply (canned, illustrative — real impl streams from the API) ─────
function mockReply(input, mode, ctx, baseId) {
  const lower = input.toLowerCase();
  if (mode === 'feedback') {
    const ticket = `FB-${4830 + Math.floor(Math.random() * 30)}`;
    return [{
      id: baseId, side: 'goa', kind: 'answer',
      body: <>Logged as <b style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{ticket}</b> against <b>{ctx.surface}</b>. Context attached. Want to add a screenshot?</>,
    }];
  }
  if (lower.includes('how do i') || lower.includes('where is') || mode === 'tutorial') {
    return [{
      id: baseId, side: 'goa', kind: 'answer',
      body: <>Walking through it: open the kebab menu on any item → <b>Add to corpus</b> → pick the corpus → confirm. Reindex runs in the background.</>,
    }];
  }
  if (lower.includes('add') && (lower.includes('corpus') || lower.includes('knowledge'))) {
    return [
      { id: baseId, side: 'goa', kind: 'answer', body: <>Got it — proposing the action. Confirm to run.</> },
      { id: baseId + 1, side: 'goa', kind: 'tool', tool: {
          name: 'addFileToCorpus', icon: 'database', title: 'Add to corpus',
          summary: 'Bind the focused file to the named corpus. File stays in /Files.',
          args: [{ k: 'fileId', v: ctx.selection?.id || 'fil_xxxx' }, { k: 'corpusId', v: 'cor_renewals' }, { k: 'reindex', v: 'true' }],
        },
      },
    ];
  }
  return [{
    id: baseId, side: 'goa', kind: 'answer',
    body: <>Reading the current view of <b>{ctx.surface}</b>… here's what I see — {Object.keys(ctx.visible || {}).length || 0} items in scope, {ctx.selection?.name ? `${ctx.selection.name} focused` : 'nothing focused'}. What would you like me to do with it?</>,
  }];
}

Object.assign(window, { AskGoa, AskGoaFAB, AskGoaGlyph });
