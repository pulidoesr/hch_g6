// components/PageFrame.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // routes you want vertically+horizontally centered
  const centeredRoutes = new Set<string>(['/signin', '/profile']);

  const mainClass = centeredRoutes.has(pathname)
    ? 'flex-1 flex items-center justify-center px-4 py-8'
    : 'flex-1'; // normal pages (home, shop, etc.)

  return <main className={mainClass}>{children}</main>;
}
