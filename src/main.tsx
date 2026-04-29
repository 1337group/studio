import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n';
import './index.css';
// MERGE-NOTE: studio — load Goa primitives + Drewlo skin overlay AFTER
// upstream's index.css so the cascade order is:
//   upstream tokens → Goa primitives (--goa-*) → Drewlo overlay (rebinds
//   --bg/--text/--accent etc. onto Goa values + brand-mark + inline-hex
//   patches). All Drewlo skin work lives in `src/styles/drewlo-skin.css`
//   so upstream merges leave both this file and `index.css` clean.
import './lib/goa/globals.css';
import './styles/drewlo-skin.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root element not found');
createRoot(el).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
