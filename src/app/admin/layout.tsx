import React from 'react';
import { getAdminSession } from '@/lib/auth/session';
import { AdminHeader } from './AdminHeader';
import { Manrope } from 'next/font/google';
import localFont from 'next/font/local';
import '../globals.css';

const brand = localFont({
  src: '../fonts/ClashDisplay-Semibold.woff2',
  variable: '--font-brand',
  weight: '600',
  style: 'normal',
  display: 'swap',
});
const body = Manrope({ variable: '--font-body', subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'mhdrhn. — Admin Console',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <html lang="id" suppressHydrationWarning className={`${brand.variable} ${body.variable}`}>
      <body className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent/20">
        {session ? (
          <>
            <AdminHeader username={session.username} />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
              {children}
            </main>
            <footer className="border-t border-border/60 py-6 px-4 sm:px-6 text-center text-xs font-mono text-ink/50 bg-canvas/60">
              <div>mhdrhn. Field Console · Redline System Architecture v4.1 · Node.js Firestore REST</div>
            </footer>
          </>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
