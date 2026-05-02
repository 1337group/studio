import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import '../src/index.css';
// MERGE-NOTE: studio — ShapeShifter skin overlay imports loaded AFTER upstream's
// index.css so the cascade puts ShapeShifter rebinds last (last rule wins).
import '../src/lib/goa/globals.css';
import '../src/styles/shapeshifter-skin.css';

export const metadata: Metadata = {
  // MERGE-NOTE: studio — brand title
  title: 'ShapeShifter Studio',
  icons: {
    // MERGE-NOTE: studio — favicon swapped to ShapeShifter knot
    icon: '/shapeshifter-knot.png',
    other: [{ rel: 'mask-icon', url: '/shapeshifter-knot.png', color: '#0b0b0d' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#F4EFE6',
};

/**
 * Inline script that runs before React hydrates to apply the saved theme
 * preference without a flash of unstyled content. It reads the same
 * localStorage key used by `state/config.ts` and sets `data-theme` on
 * `<html>` immediately — before any CSS or React paint.
 */
const themeInitScript = `(function(){try{var t=JSON.parse(localStorage.getItem('open-design:config')||'{}').theme;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme-init inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
