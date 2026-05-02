'use client';

// Universal mount point for the AskGoa FAB. Sits in the root layout so the
// FAB appears on every surface (entry view, project view, settings dialog).
// The surface label and route come from the current pathname so the panel's
// agent dispatch knows the context.
//
// MERGE-NOTE: studio — additive overlay component. Keep AskGoa.tsx free of
// Next.js imports (it's pure React); this wrapper is the only place that
// touches `next/navigation`.

import { usePathname } from 'next/navigation';
import { AskGoa } from './AskGoa';

function deriveSurfaceLabel(pathname: string | null): string {
  if (!pathname || pathname === '/') return 'home';
  if (pathname.startsWith('/projects/') && pathname.includes('/files/')) return 'project-file';
  if (pathname.startsWith('/projects/')) return 'project';
  return 'unknown';
}

export function AskGoaMount() {
  const pathname = usePathname();
  return <AskGoa surface={deriveSurfaceLabel(pathname)} route={pathname || '/'} />;
}
