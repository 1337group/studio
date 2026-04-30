// ShapeShifter Studio brand-string overrides on top of upstream open-design locales.
//
// SINGLE SOURCE for every place the surface displays brand identity.
// Upstream merge discipline: edit this file, never `src/i18n/locales/*.ts`.
//
// Runtime wiring lives in `src/i18n/index.tsx` (one MERGE-NOTE marked
// edit) where each upstream Dict gets shallow-merged with its matching
// override. Missing locales fall back to English brand strings.
//
// When upstream adds a new locale (e.g. pt-BR via PR #79), add an entry
// here for it — otherwise the brand strings stay in upstream's language.
// This file alone is the diff that re-skins identity; everything else
// stays in upstream.
import type { Dict, Locale } from './types';

export type ShapeShifterOverrideMap = Partial<Record<Locale, Partial<Dict>>>;

export const shapeshifterOverrides: ShapeShifterOverrideMap = {
  en: {
    'app.brand': 'Studio',
    'app.brandPill': 'Beta',
    'app.brandSubtitle': 'by ShapeShifter',
    'settings.welcomeTitle': 'Set up Studio',
  },
  'zh-CN': {
    'app.brand': 'Studio',
    'app.brandPill': '测试版',
    'app.brandSubtitle': '由 ShapeShifter 出品',
    'settings.welcomeTitle': '初始化 Studio',
  },
};
