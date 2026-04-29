/* === Drewlo Feedback Bot ==================================================
   Always-on circular floating action button in the bottom-right of every
   surface. Opens a chatbot-style panel that ONLY accepts feedback (bug
   reports, requests, praise) by voice or text. Routes to the build team's
   feedback pipeline; Claude triages.

   Auto-attaches the current surface, route, viewport, theme and build SHA
   so reports are debuggable without the user having to describe context.

   Public component:
     <BCFeedbackBot surface="Springboard" route="/today" />

   Both props default to sensible values; callers should pass `surface` so
   the bot's greeting/header matches the user's current screen.
============================================================================ */

const { useState: useStateFB, useRef: useRefFB, useEffect: useEffectFB } = React;

// Briefcase gold accent — defined here so feedback-bot.jsx is self-contained.
// (springboard.jsx also defines these as const; we set on window so it's safe across files.)
if (typeof window.BC_GOLD === 'undefined') window.BC_GOLD = 'oklch(75% 0.135 75)';
if (typeof window.BC_VIP  === 'undefined') window.BC_VIP  = 'oklch(83% 0.155 88)';
const BC_GOLD = window.BC_GOLD;
const BC_VIP  = window.BC_VIP;

// ---- FAB --------------------------------------------------------------------
function BCFeedbackFAB({ open, onToggle, unread = false, bottomOffset = 20 }) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? 'Close feedback' : 'Open feedback'}
      title="Send feedback"
      style={{
        all: 'unset', cursor: 'pointer',
        position: 'absolute', right: 20, bottom: bottomOffset, zIndex: 60,
        width: 48, height: 48, borderRadius: 24,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0b0b0d',
        backgroundImage: open ? 'none' : 'url("assets/drewlo-knot-gold-on-black.png")',
        backgroundSize: '108%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        boxShadow: '0 8px 22px rgba(8, 12, 28, 0.32), 0 2px 6px rgba(207, 161, 76, 0.30), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(207, 161, 76, 0.45)',
        color: BC_GOLD,
        transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 200ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
    >
      {/* Subtle ring pulse to read as 'always on' */}
      <span aria-hidden style={{
        position: 'absolute', inset: -4, borderRadius: 32,
        border: `1px solid ${BC_GOLD}`, opacity: 0.5,
        animation: 'fbPulse 2.4s ease-out infinite',
      }} />
      {open && <GIcon name="x" size={19} style={{ position: 'relative', zIndex: 1, color: BC_GOLD }} />}
      {unread && !open && (
        <span aria-hidden style={{
          position: 'absolute', top: 6, right: 6,
          width: 10, height: 10, borderRadius: 5,
          background: 'oklch(0.62 0.2 25)',
          border: '2px solid #fff',
        }} />
      )}
      <style>{`
        @keyframes fbPulse {
          0%   { transform: scale(1);    opacity: 0.5; }
          70%  { transform: scale(1.18); opacity: 0;   }
          100% { transform: scale(1.18); opacity: 0;   }
        }
      `}</style>
    </button>
  );
}

// ---- Chat bubble ------------------------------------------------------------
function FBBubble({ side = 'bot', children, meta }) {
  const isUser = side === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 8,
    }}>
      <div style={{
        maxWidth: '82%',
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

// ---- Voice recorder inline --------------------------------------------------
function FBVoicePill({ recording, seconds, onToggle, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px 8px 8px', borderRadius: 999,
      background: 'var(--goa-bg-elev)', border: '1px solid var(--goa-line)',
      flex: 1,
    }}>
      <button onClick={onToggle} aria-label={recording ? 'Stop' : 'Record'} style={{
        all: 'unset', cursor: 'pointer',
        width: 30, height: 30, borderRadius: 15,
        background: recording ? 'oklch(0.62 0.2 25)' : `linear-gradient(160deg, ${BC_VIP}, ${BC_GOLD})`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <GIcon name={recording ? 'square' : 'mic'} size={recording ? 11 : 14} />
      </button>
      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 18, flex: 1 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const h = recording
            ? 3 + (Math.abs(Math.sin((seconds * 6 + i) * 0.55)) * 14)
            : 3 + ((i * 7) % 11);
          return <span key={i} style={{
            width: 2, height: h, borderRadius: 1,
            background: recording ? BC_GOLD : 'var(--goa-line)',
            opacity: recording ? 0.95 : 0.55,
          }} />;
        })}
      </div>
      <span style={{
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        fontSize: 11.5, color: 'var(--goa-fg-2)', minWidth: 36, textAlign: 'right',
      }}>{`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}</span>
      <button onClick={onCancel} aria-label="Cancel" style={{
        all: 'unset', cursor: 'pointer',
        width: 22, height: 22, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--goa-fg-3)',
      }}>
        <GIcon name="x" size={12} />
      </button>
    </div>
  );
}

// ---- Main bot panel ---------------------------------------------------------
function BCFeedbackBot({ surface = 'Springboard', route = '/', bottomOffset = 20 }) {
  const [open, setOpen] = useStateFB(false);
  const [tab, setTab] = useStateFB('chat');                // chat | recent
  const [kind, setKind] = useStateFB('bug');               // bug | request | question | praise
  const [mode, setMode] = useStateFB('text');              // text | voice
  const [text, setText] = useStateFB('');
  const [recording, setRecording] = useStateFB(false);
  const [seconds, setSeconds] = useStateFB(0);
  const [messages, setMessages] = useStateFB([
    {
      side: 'bot', kind: 'greeting',
      text: `Hey — I'm the Drewlo feedback line, reading from "${surface}" right now. Tell me what's broken, what you'd like better, or what works. Voice or text — your call.`,
    },
  ]);
  const scrollerRef = useRefFB(null);

  // Build context — auto-attached to every report
  const ctx = {
    surface,
    route,
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '—',
    theme: typeof document !== 'undefined' ? (document.documentElement.dataset.theme || 'light') : 'light',
    build: 'rc1-p1.0428',
    user: 'Allan Drewlo (Owner)',
  };

  // Reset greeting if surface changes
  useEffectFB(() => {
    setMessages(prev => prev.length === 1 && prev[0].kind === 'greeting' ? [{
      side: 'bot', kind: 'greeting',
      text: `Hey — I'm the Drewlo feedback line, reading from "${surface}" right now. Tell me what's broken, what you'd like better, or what works. Voice or text — your call.`,
    }] : prev);
  }, [surface]);

  // Recording timer
  useEffectFB(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  // Auto-scroll on new message
  useEffectFB(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, open]);

  const KINDS = [
    { id: 'bug',      label: 'Bug',      icon: 'bug',         tone: 'red'  },
    { id: 'request',  label: 'Request',  icon: 'sparkles',    tone: 'gold' },
    { id: 'question', label: 'Question', icon: 'help-circle', tone: 'blue' },
    { id: 'praise',   label: 'Praise',   icon: 'heart',       tone: 'pink' },
  ];

  function submit(content, contentMode) {
    const ticket = `FB-${Math.floor(1000 + Math.random() * 9000)}`;
    const userMsg = {
      side: 'user',
      kind, mode: contentMode,
      text: contentMode === 'voice' ? `🎙 Voice memo · ${seconds}s` : content,
      meta: contentMode === 'voice' ? `${seconds}s recording` : null,
    };
    setMessages(m => [...m, userMsg]);
    setText('');
    setSeconds(0);
    setRecording(false);
    setMode('text');

    // Bot ack after small delay
    setTimeout(() => {
      const ackByKind = {
        bug:      `Got it — logged as ${ticket}. I'll dedupe against open issues, attach the context below, and route to whoever owns "${surface}".`,
        request:  `Saved as ${ticket}. I'll add it to the request backlog and tag the right owner. Anything else you'd like to add?`,
        question: `Filed as ${ticket}. I'll route this to the team and pull the relevant docs. Expect a reply in Notifications.`,
        praise:   `${ticket} logged. Passed to the build team — they like hearing this. 🙏`,
      };
      setMessages(m => [
        ...m,
        { side: 'bot', kind: 'ack', ticket, text: ackByKind[kind] },
        { side: 'bot', kind: 'context', ctx, ticket },
      ]);
    }, 500);
  }

  function onSend() {
    if (mode === 'text') {
      if (!text.trim()) return;
      submit(text.trim(), 'text');
    } else {
      if (seconds < 1) return;
      submit('', 'voice');
    }
  }

  return (
    <>
      <BCFeedbackFAB open={open} onToggle={() => setOpen(o => !o)} bottomOffset={bottomOffset} />
      {open && (
        <div style={{
          position: 'absolute', right: 20, bottom: bottomOffset + 58, zIndex: 60,
          width: 'min(323px, calc(100% - 24px))', height: 'min(459px, calc(100% - 100px))',
          display: 'flex', flexDirection: 'column',
          background: 'var(--goa-bg-elev)',
          border: '1px solid var(--goa-line)',
          borderRadius: 22,
          boxShadow: '0 28px 60px rgba(8, 12, 28, 0.32), 0 2px 6px rgba(8,12,28,0.12)',
          overflow: 'hidden',
          animation: `fbBotIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          transformOrigin: 'bottom right',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px',
            borderBottom: '1px solid var(--goa-line)',
            background: 'var(--goa-surface-2)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 17,
              background: `linear-gradient(160deg, ${BC_VIP}, ${BC_GOLD})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 1px 4px rgba(207, 161, 76, 0.32)',
              position: 'relative',
            }}>
              <GIcon name="message-circle-question" size={16} style={{ color: '#fff' }} />
              <span aria-hidden style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: 5,
                background: 'oklch(0.66 0.16 150)',
                border: '2px solid var(--goa-surface-2)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--goa-fg)' }}>
                Drewlo Feedback
              </div>
              <div style={{ fontSize: 11, color: 'var(--goa-fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: 'oklch(0.66 0.16 150)' }} />
                Online · routes to Allan
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{
              all: 'unset', cursor: 'pointer',
              width: 28, height: 28, borderRadius: 14,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--goa-fg-3)',
            }}>
              <GIcon name="x" size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4, borderBottom: '1px solid var(--goa-line)' }}>
            {[
              { id: 'chat',   label: 'Report',  icon: 'message-square' },
              { id: 'recent', label: 'My reports', icon: 'inbox' },
            ].map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 10px',
                  fontSize: 12, fontWeight: 600,
                  color: active ? 'var(--goa-fg)' : 'var(--goa-fg-3)',
                  borderBottom: `2px solid ${active ? BC_GOLD : 'transparent'}`,
                  marginBottom: -1,
                }}>
                  <GIcon name={t.icon} size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'chat' ? (
            <>
              {/* Context strip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                padding: '8px 12px',
                background: 'var(--goa-surface-2)',
                borderBottom: '1px solid var(--goa-line)',
                fontSize: 10.5, color: 'var(--goa-fg-3)',
              }}>
                <GIcon name="map-pin" size={11} style={{ color: BC_GOLD }} />
                <span><b style={{ color: 'var(--goa-fg-2)', fontWeight: 600 }}>{ctx.surface}</b></span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{ctx.route}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{ctx.viewport}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{ctx.theme}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{ctx.build}</span>
              </div>

              {/* Messages */}
              <div ref={scrollerRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
                {messages.map((m, i) => {
                  if (m.kind === 'context') {
                    return (
                      <div key={i} style={{
                        margin: '4px 0 10px', padding: 10, borderRadius: 12,
                        background: 'var(--goa-surface-2)',
                        border: '1px dashed var(--goa-line)',
                        fontSize: 11, color: 'var(--goa-fg-3)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <GIcon name="paperclip" size={11} />
                          <span style={{ fontWeight: 600, color: 'var(--goa-fg-2)' }}>Attached automatically · {m.ticket}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8, rowGap: 2, fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 10.5 }}>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>surface</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.surface}</span>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>route</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.route}</span>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>viewport</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.viewport}</span>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>theme</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.theme}</span>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>build</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.build}</span>
                          <span style={{ color: 'var(--goa-fg-4, var(--goa-fg-3))' }}>user</span><span style={{ color: 'var(--goa-fg-2)' }}>{m.ctx.user}</span>
                        </div>
                      </div>
                    );
                  }
                  return <FBBubble key={i} side={m.side} meta={m.meta}>{m.text}</FBBubble>;
                })}
              </div>

              {/* Kind chips */}
              <div style={{ display: 'flex', gap: 4, padding: '8px 10px 0', flexWrap: 'wrap' }}>
                {KINDS.map(k => {
                  const active = kind === k.id;
                  return (
                    <button key={k.id} onClick={() => setKind(k.id)} style={{
                      all: 'unset', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 9px', borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      background: active ? 'var(--goa-fg)' : 'transparent',
                      color: active ? 'var(--goa-bg)' : 'var(--goa-fg-3)',
                      border: '1px solid ' + (active ? 'var(--goa-fg)' : 'var(--goa-line)'),
                    }}>
                      <GIcon name={k.icon} size={10} />
                      {k.label}
                    </button>
                  );
                })}
              </div>

              {/* Composer */}
              <div style={{
                padding: 10, borderTop: '1px solid var(--goa-line)',
                background: 'var(--goa-bg-elev)',
              }}>
                {mode === 'voice' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FBVoicePill
                      recording={recording}
                      seconds={seconds}
                      onToggle={() => { if (recording) setRecording(false); else { setSeconds(0); setRecording(true); } }}
                      onCancel={() => { setMode('text'); setRecording(false); setSeconds(0); }}
                    />
                    <button
                      onClick={onSend}
                      disabled={seconds < 1}
                      aria-label="Send"
                      style={{
                        all: 'unset', cursor: seconds < 1 ? 'default' : 'pointer',
                        width: 36, height: 36, borderRadius: 18,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--goa-fg)', color: 'var(--goa-bg)',
                        opacity: seconds < 1 ? 0.4 : 1,
                      }}>
                      <GIcon name="arrow-up" size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'flex-end', gap: 6,
                    padding: '6px 6px 6px 12px',
                    background: 'var(--goa-surface-2)',
                    border: '1px solid var(--goa-line)',
                    borderRadius: 18,
                  }}>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                      placeholder={
                        kind === 'bug'      ? 'What broke? What did you expect?'
                      : kind === 'request'  ? 'What would make this better?'
                      : kind === 'question' ? 'What do you need to know?'
                                            : 'Tell us what you love.'
                      }
                      rows={1}
                      style={{
                        flex: 1, resize: 'none', outline: 'none', border: 'none',
                        background: 'transparent', color: 'var(--goa-fg)',
                        fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.4,
                        maxHeight: 96, padding: '6px 0',
                      }}
                    />
                    <button onClick={() => { setMode('voice'); setSeconds(0); setRecording(true); }} aria-label="Record voice" style={{
                      all: 'unset', cursor: 'pointer',
                      width: 32, height: 32, borderRadius: 16,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--goa-fg-3)',
                    }}>
                      <GIcon name="mic" size={16} />
                    </button>
                    <button
                      onClick={onSend}
                      disabled={!text.trim()}
                      aria-label="Send"
                      style={{
                        all: 'unset', cursor: text.trim() ? 'pointer' : 'default',
                        width: 32, height: 32, borderRadius: 16,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: text.trim() ? 'var(--goa-fg)' : 'var(--goa-line)',
                        color: text.trim() ? 'var(--goa-bg)' : 'var(--goa-fg-3)',
                      }}>
                      <GIcon name="arrow-up" size={14} />
                    </button>
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  marginTop: 7, padding: '0 4px',
                  fontSize: 10, color: 'var(--goa-fg-3)',
                }}>
                  <GIcon name="shield-check" size={10} style={{ color: BC_GOLD }} />
                  <span>Goes to Allan · context auto-attached · Claude triages first</span>
                </div>
              </div>
            </>
          ) : (
            <BCFBRecent />
          )}
        </div>
      )}
      <style>{`
        @keyframes fbBotIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

// ---- "My reports" tab — recent submissions placeholder ---------------------
function BCFBRecent() {
  const recent = [
    { id: 'FB-4821', kind: 'bug',     surface: 'Springboard', text: 'Dock collapsed FAB takes two taps to expand on iPad.', when: '2h ago',  status: 'In review' },
    { id: 'FB-4807', kind: 'request', surface: 'Messages',    text: 'Add a Group thread filter for Property Mgmt.',         when: 'Yesterday', status: 'Planned' },
    { id: 'FB-4791', kind: 'praise',  surface: 'Briefcase',   text: 'The KPI ribbon is exactly what I wanted.',             when: '2d ago',  status: 'Closed' },
  ];
  const tones = { bug: 'red', request: 'gold', praise: 'pink', question: 'blue' };
  const icons = { bug: 'bug', request: 'sparkles', praise: 'heart', question: 'help-circle' };
  const statusTone = { 'In review': 'amber', 'Planned': 'blue', 'Closed': 'green' };
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 12px' }}>
      {recent.map(r => (
        <div key={r.id} style={{
          padding: '12px 12px',
          borderBottom: '1px solid var(--goa-line-2, var(--goa-line))',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: `var(--goa-${tones[r.kind]}-soft, var(--goa-surface-2))`,
            color: `var(--goa-${tones[r.kind]})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <GIcon name={icons[r.kind]} size={13} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--goa-fg-2)', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{r.id}</span>
              <span style={{ fontSize: 10.5, color: 'var(--goa-fg-3)' }}>· {r.surface}</span>
              <span style={{ fontSize: 10.5, color: 'var(--goa-fg-3)', marginLeft: 'auto' }}>{r.when}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--goa-fg)', lineHeight: 1.4 }}>{r.text}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 999,
                fontSize: 10.5, fontWeight: 600,
                background: `var(--goa-${statusTone[r.status]}-soft, var(--goa-surface-2))`,
                color: `var(--goa-${statusTone[r.status]}, var(--goa-fg-2))`,
              }}>{r.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BCFeedbackBot, BCFeedbackFAB });
