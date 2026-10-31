import React from 'react';
import { getAdminSession } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';
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
      <body className="min-h-screen bg-canvas text-ink font-sans selection:bg-accent/20">
        <AdminThemeProvider>
          {session ? (
            <AdminShell username={session.username}>
              {children}
            </AdminShell>
          ) : (
            children
          )}
        </AdminThemeProvider>
      </body>
    </html>
  );
}
