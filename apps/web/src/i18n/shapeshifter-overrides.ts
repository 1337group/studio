// ShapeShifter Studio brand-string overrides on top of upstream open-design locales.
//
// SINGLE SOURCE for every place the surface displays brand identity.
// Upstream merge discipline: edit this file, never `src/i18n/locales/*.ts`.
//
// Runtime wiring lives in `src/i18n/index.tsx` (one MERGE-NOTE marked
// edit) where each upstream Dict gets shallow-merged with its matching
// override. Missing locales fall back to English brand strings.
//
// COVERAGE: every locale upstream ships gets an entry here. When upstream
// adds a new locale, add a matching entry — otherwise its brand strings
// stay in upstream's "Open Design" naming. Translations are kept short
// because the brand layout splits "Studio" + subtitle "by ShapeShifter"
// + pill — full "Studio by ShapeShifter" reads naturally as a unit.
import type { Dict, Locale } from './types';

export type ShapeShifterOverrideMap = Partial<Record<Locale, Partial<Dict>>>;

export const shapeshifterOverrides: ShapeShifterOverrideMap = {
  en: {
    'app.brand': 'Studio',
    'app.brandPill': 'Beta',
    'app.brandSubtitle': 'by ShapeShifter',
    'settings.welcomeTitle': 'Set up Studio by ShapeShifter',
  },
  'zh-CN': {
    'app.brand': 'Studio',
    'app.brandPill': '测试版',
    'app.brandSubtitle': '由 ShapeShifter 出品',
    'settings.welcomeTitle': '初始化 Studio by ShapeShifter',
  },
  'zh-TW': {
    'app.brand': 'Studio',
    'app.brandPill': '測試版',
    'app.brandSubtitle': '由 ShapeShifter 出品',
    'settings.welcomeTitle': '初始化 Studio by ShapeShifter',
  },
  'pt-BR': {
    'app.brand': 'Studio',
    'app.brandPill': 'Beta',
    'app.brandSubtitle': 'por ShapeShifter',
    'settings.welcomeTitle': 'Configure o Studio by ShapeShifter',
  },
  ru: {
    'app.brand': 'Studio',
    'app.brandPill': 'Бета',
    'app.brandSubtitle': 'от ShapeShifter',
    'settings.welcomeTitle': 'Настройка Studio by ShapeShifter',
  },
  fa: {
    'app.brand': 'Studio',
    'app.brandPill': 'بتا',
    'app.brandSubtitle': 'توسط ShapeShifter',
    'settings.welcomeTitle': 'راه‌اندازی Studio by ShapeShifter',
  },
};
