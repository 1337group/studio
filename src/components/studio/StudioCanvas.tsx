// MERGE-NOTE: studio — ShapeShifter addition. Wraps the 5 Goa-designed Studio
// surfaces in a labelled vertical canvas — the same presentation Goa uses
// inside `studio.html` (canvas → DCSection → DCArtboard). For P1.2 visual
// approval: Isaac scrolls through and signs off. Real navigation (one
// route per surface, deep-link to a fork, etc.) comes in P1.3.

import type { ReactNode } from 'react';

import { StdAppDetail, StdPropose, StdScratch, StdLaunch, StdReview } from './panes';

const STD_GOLD = 'oklch(70% 0.135 75)';

type SectionProps = {
  index: string;
  title: string;
  subtitle: string;
  artboardLabel: string;
  artboardSize: { w: number; h: number };
  children: ReactNode;
};

function Section({ index, title, subtitle, artboardLabel, artboardSize, children }: SectionProps) {
  return (
    <section style={{ padding: '40px 28px 0' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: STD_GOLD,
              textTransform: 'uppercase',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          >
            {index}
          </span>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--goa-fg)',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
        <p
          style={{
            fontSize: 13,
            color: 'var(--goa-fg-3)',
            margin: '0 0 18px',
            maxWidth: 820,
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>

        <div style={{ marginBottom: 6, fontSize: 11, color: 'var(--goa-fg-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--goa-line)',
              border: '1px solid var(--goa-fg-3)',
            }}
          />
          <span>{artboardLabel}</span>
        </div>

        <div
          style={{
            width: '100%',
            height: artboardSize.h,
            border: '1px solid var(--goa-line)',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'var(--goa-bg)',
            boxShadow: '0 8px 28px rgba(8, 12, 28, 0.06)',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function StudioCanvas() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'oklch(94% 0.005 240)',
        paddingBottom: 80,
      }}
    >
      <header
        style={{
          padding: '24px 28px 8px',
          borderBottom: '1px solid var(--goa-line)',
          background: 'color-mix(in oklab, var(--goa-bg) 88%, transparent)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 1480, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--goa-fg)',
            }}
          >
            Studio · build apps for the workspace
          </h1>
          <p
            style={{
              fontSize: 12.5,
              color: 'var(--goa-fg-3)',
              margin: '4px 0 12px',
              maxWidth: 820,
              lineHeight: 1.55,
            }}
          >
            Two on-ramps: <b>fork an existing app</b> (browse → propose changes, the meat) or{' '}
            <b>build from scratch</b> (your own Docker workspace, Hive backend wired). Submit fork → Allan reviews →
            ship to dev → beta → prod. Goa is the coach — asks about the problem, then writes the code with you.
          </p>
        </div>
      </header>

      <Section
        index="01"
        title="Fork & propose changes (the hero)"
        subtitle="Maria forks Renewals desk to add Spanish-first letters. Goa coaches her through the prompt edit; preview re-renders live; she can flip to diff or test results before submitting for review."
        artboardLabel="01 · Studio · Fork & propose changes (hero)"
        artboardSize={{ w: 1480, h: 920 }}
      >
        <StdPropose />
      </Section>

      <Section
        index="02"
        title="Browse before forking"
        subtitle="Read-only, friendly entry point. Plain-English explanation of how the app works + sample run. Big primary action: 'Fork & propose changes.'"
        artboardLabel="02 · Studio · App detail (read-only)"
        artboardSize={{ w: 1480, h: 920 }}
      >
        <StdAppDetail />
      </Section>

      <Section
        index="03"
        title="Build from scratch"
        subtitle="Empty canvas with starter prompts. Goa-as-coach picks up the conversation; canvas fills as the app takes shape."
        artboardLabel="03 · Studio · Build from scratch"
        artboardSize={{ w: 1480, h: 920 }}
      >
        <StdScratch />
      </Section>

      <Section
        index="04"
        title="Launch · Dev → Beta → Prod"
        subtitle="Once a from-scratch app is ready, walk it through three lifecycle stages. Pick beta testers from Library; Hive env vars auto-injected; Allan still gates the production cutover."
        artboardLabel="04 · Studio · Launch stepper"
        artboardSize={{ w: 1240, h: 1080 }}
      >
        <StdLaunch />
      </Section>

      <Section
        index="05"
        title="Allan's review queue"
        subtitle="Owner-only. PRs from the workspace land here. Diff + tests + affected-user count + approve / request-changes in one pane. Same chrome as Studio so the loop stays cohesive."
        artboardLabel="05 · Studio · Review queue (Allan's view)"
        artboardSize={{ w: 1480, h: 920 }}
      >
        <StdReview />
      </Section>
    </div>
  );
}
