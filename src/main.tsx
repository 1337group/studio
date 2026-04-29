import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n';
import './index.css';
// MERGE-NOTE: studio — load Goa CSS variables + lucide iconfont after the
// upstream open-design tokens. Goa lives in its own `--goa-*` namespace
// so it doesn't override `--bg`/`--text`/etc.; surfaces opt into Goa
// explicitly. Surface restructure (P1.2.2) wires Goa primitives in as the
// upstream chrome gets replaced.
import './lib/goa/globals.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root element not found');
createRoot(el).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
