'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from './auth';
import Sidebar from './sidebar';

/** Login renders bare; every other route requires a signed-in user and gets the sidebar shell. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user && pathname !== '/login') router.replace('/login');
    if (user && pathname === '/login') router.replace('/');
  }, [ready, user, pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (!ready || !user) return null;

  return (
    <>
      <Sidebar />
      <div className="min-h-screen md:pl-[232px]">
        <main className="mx-auto max-w-[1180px] px-6 py-8">{children}</main>
      </div>
    </>
  );
}
