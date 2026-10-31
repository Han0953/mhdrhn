'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  SlidersHorizontal,
  FolderKanban,
  History,
  Cpu,
  FileBadge,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AdminThemeToggle } from './AdminThemeToggle';
import { revalidateCacheAction } from '@/app/admin/actions';

interface AdminShellProps {
  username: string;
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Ringkasan', tag: '01', Icon: LayoutDashboard },
  { href: '/admin/home-layout', label: 'Tata Letak Home', tag: '02', Icon: SlidersHorizontal },
  { href: '/admin/projects', label: 'Proyek', tag: '03', Icon: FolderKanban },
  { href: '/admin/experiences', label: 'Pengalaman', tag: '04', Icon: History },
  { href: '/admin/skills', label: 'Keahlian', tag: '05', Icon: Cpu },
  { href: '/admin/certificates', label: 'Sertifikat', tag: '06', Icon: FileBadge },
];

export function AdminShell({ username, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handlePurgeCache() {
    setPurging(true);
    try {
      await revalidateCacheAction();
      setPurgeSuccess(true);
      router.refresh();
      setTimeout(() => setPurgeSuccess(false), 3000);
    } finally {
      setPurging(false);
    }
  }

  async function handleLogout() {
    if (!confirm('Yakin ingin keluar dari sesi admin mhdrhn.?')) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  // Find active nav item
  const currentNav = navItems.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  ) || navItems[0];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* MOBILE TOPBAR (Visible only on < lg) */}
      {/* ============================================================ */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 border border-border/80 bg-canvas/80 flex items-center justify-center text-ink hover:text-accent transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/admin" className="font-display text-lg font-bold tracking-tight text-ink">
            mhdrhn<span className="text-accent">.</span>{' '}
            <span className="font-mono text-[10px] text-ink/60 uppercase">Console</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <AdminThemeToggle compact />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-10 h-10 border border-border/80 bg-canvas/80 flex items-center justify-center text-accent hover:bg-accent/10 transition-colors cursor-pointer"
            title="Keluar"
            aria-label="Keluar dari sesi"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE DRAWER BACKDROP (Visible only when mobileOpen) */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-surface border-r border-border p-5 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <div className="font-mono text-[10px] text-accent font-bold uppercase tracking-widest">
                    [SECURE_NODE]
                  </div>
                  <div className="font-display text-xl font-bold text-ink">
                    mhdrhn<span className="text-accent">.</span> Console
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-ink/60 hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active =
                    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  const Icon = item.Icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 text-xs font-mono border transition-all ${
                        active
                          ? 'border-accent bg-accent/10 text-accent font-bold'
                          : 'border-transparent text-ink/70 hover:bg-canvas/60 hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={active ? 'text-accent' : 'text-ink/60'} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-ink/40">{item.tag}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-ink/60">TEMA</span>
                <AdminThemeToggle />
              </div>

              <button
                type="button"
                onClick={handlePurgeCache}
                disabled={purging}
                className="w-full py-2.5 px-3 border border-border bg-canvas/60 hover:border-accent text-xs font-mono text-ink/80 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={purging ? 'animate-spin text-accent' : ''} />
                <span>{purging ? 'MEMBERSIHKAN...' : purgeSuccess ? 'CACHE BERSIH ✓' : 'BERSIHKAN CACHE'}</span>
              </button>

              <Link
                href="/"
                target="_blank"
                className="w-full py-2.5 px-3 border border-border bg-canvas/60 hover:border-accent text-xs font-mono text-ink/80 flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>LIHAT SITUS WEB ↗</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full py-2.5 px-3 bg-accent/10 hover:bg-accent/20 border border-accent/40 text-accent text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>KELUAR SESI ADMIN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP COLLAPSIBLE SIDEBAR (Visible only on lg+) */}
      {/* ============================================================ */}
      <aside
        className={`hidden lg:flex flex-col justify-between border-r border-border bg-surface/70 backdrop-blur-md sticky top-0 h-screen transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div
            className={`border-b border-border/70 p-4 flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!collapsed && (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10px] text-accent font-bold tracking-widest uppercase">
                    LIVE CONSOLE
                  </span>
                </div>
                <Link
                  href="/admin"
                  className="font-display text-xl font-bold tracking-tight text-ink block"
                >
                  mhdrhn<span className="text-accent">.</span>
                </Link>
              </div>
            )}

            {collapsed && (
              <Link
                href="/admin"
                className="font-display text-2xl font-bold text-accent"
                title="mhdrhn. Console"
              >
                m.
              </Link>
            )}

            {/* Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 border border-border/80 hover:border-accent hover:text-accent text-ink/70 bg-canvas/50 transition-colors cursor-pointer rounded-xs"
              title={collapsed ? 'Buka Panel Navigasi (Expand)' : 'Perkecil Panel Navigasi (Collapse)'}
              aria-label={collapsed ? 'Buka Panel Navigasi' : 'Perkecil Panel Navigasi'}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* User Status Bar */}
          {!collapsed && (
            <div className="px-4 py-2 border-b border-border/40 bg-canvas/30 flex items-center justify-between font-mono text-[11px] text-ink/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-accent" />
                <span>OP: {username.toUpperCase()}</span>
              </span>
              <span className="text-[10px] text-ink/40">FIRESTORE</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.Icon;

              if (collapsed) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={`${item.tag} // ${item.label}`}
                    className={`w-full h-11 flex items-center justify-center border transition-all ${
                      active
                        ? 'border-accent bg-accent/10 text-accent font-bold'
                        : 'border-transparent text-ink/60 hover:text-ink hover:bg-canvas/50'
                    }`}
                  >
                    <Icon size={18} />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-mono border transition-all ${
                    active
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                      : 'border-transparent text-ink/70 hover:border-border hover:bg-canvas/50 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={active ? 'text-accent' : 'text-ink/60'} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] ${active ? 'text-accent' : 'text-ink/40'}`}>
                    {item.tag}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Bar & Actions */}
        <div className="p-3 border-t border-border/70 bg-canvas/40 space-y-2">
          {/* Theme Switcher */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between pb-1'}`}>
            {!collapsed && <span className="font-mono text-[11px] text-ink/60">TEMA</span>}
            <AdminThemeToggle compact={collapsed} />
          </div>

          {/* Purge Cache Action */}
          <button
            type="button"
            onClick={handlePurgeCache}
            disabled={purging}
            className={`w-full border border-border bg-surface/60 hover:border-accent text-ink/80 hover:text-accent font-mono text-[11px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              collapsed ? 'h-9 px-0' : 'py-2 px-3'
            }`}
            title="Bersihkan Cache Next.js (Purge ISR Cache)"
            aria-label="Bersihkan Cache Portofolio"
          >
            <RefreshCw size={13} className={purging ? 'animate-spin text-accent' : ''} />
            {!collapsed && (
              <span>{purging ? 'MEMBERSIHKAN...' : purgeSuccess ? 'CACHE DIBERSIHKAN ✓' : 'BERSIHKAN CACHE'}</span>
            )}
          </button>

          {/* View Website */}
          <Link
            href="/"
            target="_blank"
            className={`w-full border border-border bg-surface/60 hover:border-accent text-ink/80 hover:text-ink font-mono text-[11px] transition-colors flex items-center justify-center gap-2 ${
              collapsed ? 'h-9 px-0' : 'py-2 px-3'
            }`}
            title="Buka Website Portofolio Publik di Tab Baru"
          >
            <ExternalLink size={13} />
            {!collapsed && <span>LIHAT SITUS WEB ↗</span>}
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={`w-full border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-[11px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              collapsed ? 'h-9 px-0' : 'py-2 px-3'
            }`}
            title="Keluar dari Sesi Administrator"
            aria-label="Keluar dari Sesi Administrator"
          >
            <LogOut size={13} />
            {!collapsed && <span>KELUAR SESI</span>}
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top desktop breadcrumb bar */}
        <div className="hidden lg:flex items-center justify-between border-b border-border/60 px-8 py-3.5 bg-surface/40 font-mono text-xs">
          <div className="flex items-center gap-2 text-ink/60">
            <span>ADMIN_ROOT</span>
            <span>/</span>
            <span className="text-accent font-bold uppercase">{currentNav.label}</span>
            <span className="text-[10px] text-ink/40">[{currentNav.tag}]</span>
          </div>

          <div className="flex items-center gap-4 text-ink/50 text-[11px]">
            <span>NODE: FIRESTORE REST</span>
            <span>·</span>
            <span>SESI AKTIF: {username}</span>
          </div>
        </div>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-border/60 py-6 px-6 text-center text-xs font-mono text-ink/50 bg-canvas/40">
          <div>
            mhdrhn. Field Console · Redline System Architecture v4.1 · Node.js Firestore REST
          </div>
        </footer>
      </div>
    </div>
  );
}
