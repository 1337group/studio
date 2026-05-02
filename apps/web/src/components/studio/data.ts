// MERGE-NOTE: studio — ShapeShifter addition. Mock data for the Goa-designed Studio
// surfaces (StdAppDetail / StdPropose / StdScratch / StdLaunch / StdReview).
// Ported verbatim from `reference/mockups/phase-1.2/components/studio-data.jsx`.
// D-21: this file ships mock content for the visual P1.2 port. Real data
// wiring (workspace `apps` table, conversation streams, PR queue) is P1.3+;
// at that point each surface swaps its mock import for a hook against the
// daemon's API and this file shrinks to type definitions only.

export const STD_GOLD = 'oklch(70% 0.135 75)';

export const STD_APPS = [
  {
    id: 'renewals-desk',
    title: 'Renewals desk',
    capability: 'Property Mgmt',
    blurb:
      "Drafts lease-renewal letters using comp data, the rate card, and the tenant's payment history.",
    owner: 'Diego Martinez',
    lifecycle: 'production',
    forks: 14,
    last_updated: '3 days ago',
    icon_tone: STD_GOLD,
    glyph: 'file-text',
    used_by: 47,
    accent: 'oklch(96% 0.04 80)',
  },
  {
    id: 'concrete-quoter',
    title: 'Concrete quoter',
    capability: 'Concrete',
    blurb:
      'Pulls slab specs from PDFs and produces a price-book quote with line-item breakdowns.',
    owner: 'Diego Martinez',
    lifecycle: 'production',
    forks: 6,
    last_updated: '1 week ago',
    icon_tone: 'oklch(58% 0.10 45)',
    glyph: 'hard-hat',
    used_by: 22,
    accent: 'oklch(95% 0.04 45)',
  },
  {
    id: 'maint-dispatch',
    title: 'Maintenance dispatch',
    capability: 'Property Mgmt',
    blurb:
      'Triages work orders, looks up vendor coverage, sends SMS to the right contractor.',
    owner: 'Property Ops',
    lifecycle: 'production',
    forks: 3,
    last_updated: '2 weeks ago',
    icon_tone: 'oklch(58% 0.14 45)',
    glyph: 'wrench',
    used_by: 31,
    accent: 'oklch(96% 0.04 65)',
  },
];

export const STD_FOCUS_APP = STD_APPS[0]!;

export type StdMessage = {
  role: 'goa' | 'maria';
  text: string;
  when: string;
  tool_use?: { kind: string; file: string; summary: string };
};

export const STD_CHAT_PROPOSE: StdMessage[] = [
  {
    role: 'goa',
    text: "You're looking at a fork of Renewals desk. The original belongs to Diego. Anything you change here lives only for you until you submit it for review. What were you hoping to fix or add?",
    when: '11:02',
  },
  {
    role: 'maria',
    text: 'Half my tenants speak Spanish at home. The renewal letters always come out in English and I have to translate them by hand. It takes 10 min per letter.',
    when: '11:03',
  },
  {
    role: 'goa',
    text: "That's 10 min you don't have. Two ways I can do this — tell me which feels right:\n\n1. **Detect & translate** — keep the prompt the same, but translate the final letter when the tenant's preferred language is Spanish.\n\n2. **Write in Spanish from the start** — branch the prompt itself, so the agent thinks in Spanish for those tenants. Slower, but reads more natural.\n\nDo you want me to show you a quick comparison of how each one reads?",
    when: '11:03',
  },
  {
    role: 'maria',
    text: 'Option 2. I read the translated ones and they sound stiff.',
    when: '11:04',
  },
  {
    role: 'goa',
    text: "Good call. I'll add a language branch in the prompt. Pulling the tenant's preferred language from the contact record — that field already exists on every lease, so we don't need anything new.\n\nGive me a second to draft it. I'll show you a side-by-side preview of an English and Spanish letter once it's ready.",
    when: '11:04',
    tool_use: { kind: 'edit', file: 'system_prompt.md', summary: 'Add Spanish language branch' },
  },
  {
    role: 'goa',
    text: "Done. The canvas on the right shows a live preview — switch the tenant in the dropdown to see Mrs. Hernández's renewal in Spanish.\n\nI also noticed: your fork doesn't handle the case where a tenant's preferred language is unknown. Want me to default that to English with a small note in the audit log? It's the safer behavior for the review.",
    when: '11:05',
  },
];

export const STD_CHAT_BROWSE: StdMessage[] = [
  {
    role: 'goa',
    text: "This is **Renewals desk**, written by Diego on the property side. It drafts renewal letters using your rate card, comp data from MLS, and the tenant's payment history.\n\nYou're looking at it read-only. Want me to walk you through how it decides what rate to offer, or jump straight to forking it so you can change something?",
    when: '10:48',
  },
  {
    role: 'maria',
    text: 'Walk me through it. I want to understand before I change anything.',
    when: '10:48',
  },
  {
    role: 'goa',
    text: 'Three steps when a renewal letter is requested:\n\n1. It pulls the tenant\'s last 12 months of payments. Anyone with more than 2 late payments in 12 months gets flagged as "rate-sensitive."\n\n2. It asks the comp puller for what similar units rent for in the sub-market — within 0.5 mi, ±10% sqft.\n\n3. The system prompt says "offer the comp median, minus 1.5% for rate-sensitive tenants." Diego put that 1.5% in to keep good payers.\n\nThat\'s the whole thing. The rest is letter formatting. Want to see the prompt itself, or fork it and try a change?',
    when: '10:49',
  },
];

export const STD_CHAT_SCRATCH: StdMessage[] = [
  {
    role: 'goa',
    text: "Empty canvas. What problem are you trying to solve?\n\nDon't worry about how — tell me about the moment in your week where you wish a tool existed.",
    when: '14:22',
  },
];

export const STD_DIFF = [
  { line: 12, kind: 'context', text: 'Use the rate card to compute the offer.' },
  { line: 13, kind: 'context', text: '' },
  { line: 14, kind: 'context', text: '## Tone' },
  { line: 15, kind: 'remove', text: 'Write the letter in English.' },
  {
    line: 15,
    kind: 'add',
    text: 'If `tenant.preferred_language == "es"`, write the letter in natural Mexican-Spanish',
  },
  { line: 16, kind: 'add', text: '— not translated. Use respectful "usted." Otherwise write in English.' },
  { line: 17, kind: 'add', text: 'If `preferred_language` is unknown, default to English and note this in' },
  { line: 18, kind: 'add', text: 'the audit log.' },
  { line: 19, kind: 'context', text: '' },
  { line: 20, kind: 'context', text: '## Closing' },
  { line: 21, kind: 'context', text: "Sign with the property manager's name from `manager.name`." },
] as const;

export const STD_PREVIEW_LETTER = {
  tenant_name: 'Sra. Hernández',
  unit: 'Apt 4B · Casa Linda',
  current_rent: '$1,825',
  new_rent: '$1,895',
  language_chip: 'es',
  body_es: [
    'Estimada Sra. Hernández,',
    '',
    'Esperamos que se encuentre bien. Le escribimos para informarle que su contrato de arrendamiento en Apt 4B está próximo a vencer el 31 de mayo.',
    '',
    'Después de revisar las rentas comparables en su área y su historial de pagos puntuales durante los últimos doce meses, nos complace ofrecerle la renovación de su contrato a una renta mensual de **$1,895** — un ajuste moderado que refleja las condiciones del mercado.',
    '',
    'Si desea continuar con su contrato bajo estos términos, por favor responda a este mensaje o llámenos al (323) 555-0142 antes del 15 de mayo.',
    '',
    'Le agradecemos sinceramente por ser parte de la comunidad de Casa Linda.',
    '',
    'Atentamente,',
    'Maria Chen',
    'Property Manager · Acme Properties',
  ],
};

export const STD_TESTS = [
  { id: 'baseline.test', status: 'pass', detail: 'English renewal still reads correctly · 8 cases', when: '12s' },
  { id: 'spanish.test', status: 'pass', detail: 'Spanish letter uses "usted" + correct currency format · 5 cases', when: '14s' },
  {
    id: 'fallback.test',
    status: 'warn',
    detail: 'Unknown-language case: writes in English (expected) but no audit-log entry yet',
    when: '6s',
  },
];

export const STD_REVIEW_QUEUE = [
  {
    id: 'PR-218',
    app: 'Renewals desk',
    author: 'Maria Chen',
    avatar_tone: 'oklch(58% 0.16 25)',
    initials: 'MC',
    title: 'Spanish-language renewal letters',
    summary:
      'Adds a language branch in the system prompt. Pulls preferred language from tenant.preferred_language. Falls back to English if unknown.',
    when: '5 min ago',
    status: 'awaiting-review' as const,
    diff_stat: { added: 4, removed: 1, files: 2 },
    tests: { passing: 11, failing: 0, warning: 1 },
    selected: true,
  },
  {
    id: 'PR-217',
    app: 'Concrete quoter',
    author: 'Diego Martinez',
    avatar_tone: 'oklch(58% 0.10 45)',
    initials: 'DM',
    title: 'Honor regional sales tax',
    summary:
      'Quotes were missing tax for jobs outside LA County. Adds a tax-rate lookup by ZIP.',
    when: '2 hours ago',
    status: 'awaiting-review' as const,
    diff_stat: { added: 18, removed: 2, files: 3 },
    tests: { passing: 14, failing: 0, warning: 0 },
    selected: false,
  },
  {
    id: 'PR-216',
    app: 'Tenant FAQ',
    author: 'Maria Chen',
    avatar_tone: 'oklch(58% 0.16 25)',
    initials: 'MC',
    title: 'Add pet-policy answers',
    summary:
      'Pulls house rules and weight limits per property. Was answering "I don\'t know" too often on dog questions.',
    when: 'Yesterday',
    status: 'changes-requested' as const,
    diff_stat: { added: 32, removed: 8, files: 4 },
    tests: { passing: 9, failing: 1, warning: 0 },
    selected: false,
  },
  {
    id: 'PR-215',
    app: 'Investor decks',
    author: 'Marketing',
    avatar_tone: 'oklch(58% 0.16 280)',
    initials: 'MK',
    title: 'New brand template (Q2)',
    summary: 'Updates the master template to match the 2026 brand book.',
    when: '2 days ago',
    status: 'approved' as const,
    diff_stat: { added: 64, removed: 24, files: 6 },
    tests: { passing: 4, failing: 0, warning: 0 },
    selected: false,
  },
];

export const STD_LAUNCH_APP = {
  name: 'Tenant move-out checklist',
  description:
    'Walks tenants through the move-out process, generates the punch list, schedules the cleaning vendor.',
  author: 'Maria Chen',
  built_in: '2 hours',
  iterations: 14,
};

export const STD_LAUNCH_STEPS = [
  { id: 'dev', label: 'Development', state: 'done', hint: 'Built · 14 iterations', detail: 'Your fork ran clean for 4 days. 28 test cases pass.' },
  {
    id: 'beta',
    label: 'Beta',
    state: 'current',
    hint: 'Pick beta testers',
    detail: 'Choose up to 10 staff who will see this app in their springboard before it goes wide.',
  },
  {
    id: 'prod',
    label: 'Production',
    state: 'pending',
    hint: 'After 7 days in beta',
    detail:
      "Auto-promotes after 7 days with no failed runs and no negative feedback. You can promote earlier with Isaac's approval.",
  },
] as const;

export const STD_HIVE_ENV = [
  { key: 'HIVE_BACKEND_URL', value: 'https://hive.drewlo.com', hint: 'Auto-set from workspace' },
  { key: 'TENANT_TABLE', value: 'tenants_v2', hint: 'Read-only' },
  { key: 'CLEANING_VENDOR_API', value: '••••••••••••••', hint: 'Stored encrypted in Hive vault' },
  { key: 'TIMEZONE', value: 'America/Los_Angeles', hint: 'Workspace default' },
];

export const STD_BETA_TESTERS = [
  { name: 'Diego Martinez', role: 'Property Mgmt', initials: 'DM', tone: 'oklch(58% 0.10 45)', selected: true },
  { name: 'Sarah Wong', role: 'Property Mgmt', initials: 'SW', tone: 'oklch(58% 0.12 145)', selected: true },
  { name: 'Carlos Reyes', role: 'Concrete', initials: 'CR', tone: 'oklch(58% 0.14 65)', selected: true },
  { name: 'Jenna Park', role: 'Marketing', initials: 'JP', tone: 'oklch(58% 0.16 280)', selected: false },
  { name: 'Tomás Lugo', role: 'Property Mgmt', initials: 'TL', tone: 'oklch(58% 0.10 30)', selected: false },
];
