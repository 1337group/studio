import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import '../src/index.css';
// MERGE-NOTE: studio — load Goa primitives + ShapeShifter skin overlay
// AFTER upstream's index.css so the cascade order is:
//   upstream tokens (index.css)
// → Goa primitives (lib/goa/globals.css        →  --goa-* namespace)
// → ShapeShifter   (styles/shapeshifter-skin.css → rebinds upstream
//                                                  contracts onto Goa
//                                                  values + brand-mark
//                                                  background-image
//                                                  + inline-hex patches).
// All ShapeShifter skin work lives in `src/styles/shapeshifter-skin.css`
// so upstream merges leave both this file and `index.css` clean.
// (Pre-Next.js this chain was wired in src/main.tsx; that file is
// gone in App Router.)
import '../src/lib/goa/globals.css';
import '../src/styles/shapeshifter-skin.css';

export const metadata: Metadata = {
  // MERGE-NOTE: studio — ShapeShifter brand identity. Page <title>,
  // favicon, and Safari mask color come from public/shapeshifter-knot.png.
  title: 'ShapeShifter Studio',
  icons: {
    icon: '/shapeshifter-knot.png',
    other: [{ rel: 'mask-icon', url: '/shapeshifter-knot.png', color: '#1a1916' }],
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
