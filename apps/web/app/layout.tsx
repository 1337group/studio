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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* MERGE-NOTE: studio — runtime <link> for self-hosted lucide font.
            Turbopack rejects server-relative `@import` in CSS, so we wire it
            here instead of inside `index.css` / `shapeshifter-skin.css`. */}
        <link rel="stylesheet" href="/vendor/lucide/lucide.css" />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
