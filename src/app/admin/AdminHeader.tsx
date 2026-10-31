'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { revalidateCacheAction } from './actions';

interface AdminHeaderProps {
  username: string;
}

export function AdminHeader({ username }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [purging, setPurging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Ringkasan', tag: '01' },
    { href: '/admin/home-layout', label: 'Tata Letak Home', tag: '02' },
    { href: '/admin/projects', label: 'Proyek', tag: '03' },
    { href: '/admin/experiences', label: 'Pengalaman', tag: '04' },
    { href: '/admin/skills', label: 'Keahlian', tag: '05' },
    { href: '/admin/certificates', label: 'Sertifikat', tag: '06' },
  ];

  async function handlePurgeCache() {
    setPurging(true);
    try {
      await revalidateCacheAction();
      router.refresh();
      alert('Cache portofolio berhasil dibersihkan! Halaman publik telah disegarkan.');
    } finally {
      setPurging(false);
    }
  }

  async function handleLogout() {
    if (!confirm('Yakin ingin keluar dari sesi admin?')) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top technical status bar */}
      <div className="border-b border-border/40 px-4 sm:px-6 py-1.5 flex items-center justify-between font-mono text-[11px] text-ink/70 bg-canvas/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-accent font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            LIVE CONSOLE
          </span>
          <span className="hidden sm:inline-block text-border">|</span>
          <span className="hidden sm:inline-block">NODE: FIRESTORE (DEFAULT)</span>
          <span className="hidden sm:inline-block text-border">|</span>
          <span className="hidden sm:inline-block">USER: {username.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeCache}
            disabled={purging}
            className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Bersihkan Next.js Data Cache"
          >
            [PURGE_CACHE {purging ? '...' : '↺'}]
          </button>
          <span className="text-border">|</span>
          <Link href="/" target="_blank" className="hover:text-accent transition-colors">
            LIHAT WEB ↗
          </Link>
          <span className="text-border">|</span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-accent hover:underline cursor-pointer disabled:opacity-50"
          >
            KELUAR
          </button>
        </div>
      </div>

      {/* Main Header & Nav */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-xl font-bold tracking-tight text-ink">
            mhdrhn<span className="text-accent">.</span> <span className="text-xs font-mono font-normal uppercase text-ink/70">Console</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors border ${
                    active
                      ? 'border-accent text-accent font-semibold bg-accent/5'
                      : 'border-transparent text-ink/70 hover:text-ink hover:border-border'
                  }`}
                >
                  <span className="text-[10px] text-ink/40 mr-1.5">{item.tag}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-3 py-2 border border-border text-xs font-mono text-ink flex items-center gap-2"
          >
            MENU {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-4 py-3 grid grid-cols-2 gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`p-2.5 text-xs font-mono border ${
                  active
                    ? 'border-accent text-accent font-semibold bg-accent/5'
                    : 'border-border text-ink/80 hover:border-accent/40'
                }`}
              >
                <div className="text-[10px] text-accent/70">{item.tag}</div>
                <div>{item.label}</div>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
