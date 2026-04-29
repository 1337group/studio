import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import '../src/index.css';
// MERGE-NOTE: studio — load Goa primitives + Drewlo skin overlay AFTER
// upstream's index.css so the cascade order is:
//   upstream tokens (index.css)
// → Goa primitives (lib/goa/globals.css   →  --goa-* namespace)
// → Drewlo overlay (styles/drewlo-skin.css → rebinds upstream contracts
//                                            onto Goa values + brand-mark
//                                            background-image + inline-hex
//                                            patches).
// All Drewlo skin work lives in `src/styles/drewlo-skin.css` so upstream
// merges leave both this file and `index.css` clean. (Pre-Next.js this
// chain was wired in src/main.tsx; that file is gone in App Router.)
import '../src/lib/goa/globals.css';
import '../src/styles/drewlo-skin.css';

export const metadata: Metadata = {
  // MERGE-NOTE: studio — Drewlo brand identity. Page <title>, favicon,
  // and Safari mask color come from public/drewlo-knot.png + accent.
  title: 'Studio · Drewlo',
  icons: {
    icon: '/drewlo-knot.png',
    other: [{ rel: 'mask-icon', url: '/drewlo-knot.png', color: '#1a1916' }],
  },
};

export const viewport: Viewport = {
  // MERGE-NOTE: studio — themeColor matches Goa paper background.
  themeColor: '#F4EFE6',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <head>
        {/* MERGE-NOTE: studio — lucide font CSS loaded at runtime, not via
            CSS @import. Turbopack rejects server-relative @import paths at
            build time; the icon font + its woff/ttf/eot/svg siblings live
            under public/vendor/lucide/ and resolve their relative URLs
            against that directory once the browser fetches lucide.css. */}
        <link rel='stylesheet' href='/vendor/lucide/lucide.css' />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
