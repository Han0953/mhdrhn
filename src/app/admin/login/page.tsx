'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { AdminThemeToggle } from '@/components/admin/AdminThemeToggle';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Otentikasi gagal. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Koneksi server gagal. Periksa koneksi jaringan Anda.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-accent/20">
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Utility Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/60 pb-4 max-w-5xl w-full mx-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-mono text-ink/70 hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>PORTFOLIO_SITE</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-ink/60">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>NODE_GATEWAY // PROXY_ISOLATED</span>
          </div>
          <AdminThemeToggle />
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="border border-border/80 bg-surface/90 backdrop-blur-md shadow-2xl p-6 sm:p-8 relative">
          {/* Signature Redline Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

          {/* Header & Badges */}
          <div className="space-y-2 border-b border-border/60 pb-5 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest text-accent font-bold uppercase">
                [SECURE_ACCESS_NODE]
              </span>
              <span className="font-mono text-[10px] text-ink/60 border border-border/70 px-2 py-0.5 bg-canvas/40">
                v4.1.0-SEC
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              mhdrhn<span className="text-accent">.</span> Console
            </h1>

            <p className="text-xs text-ink/70 font-sans leading-relaxed pt-1">
              Pusat manajemen konten portofolio Muhammad Rehan. Masukkan kredensial administrator terotorisasi untuk masuk ke ruang kendali.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-accent/10 border-l-3 border-accent text-accent text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold uppercase tracking-wider block mb-0.5">[AUTH_FAILURE]</span>
                <span className="font-sans text-xs">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label
                htmlFor="admin-username"
                className="block font-mono text-[11px] font-semibold tracking-wider text-ink/85 uppercase mb-2"
              >
                Identitas Operator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                  <User size={15} />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  placeholder="rehan"
                  className="w-full bg-canvas/90 border border-border text-ink pl-10 pr-4 py-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors placeholder:text-ink/30"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block font-mono text-[11px] font-semibold tracking-wider text-ink/85 uppercase"
                >
                  Kata Kunci Otorisasi
                </label>
                {capsLockActive && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-500 font-semibold uppercase animate-pulse">
                    <ShieldAlert size={12} />
                    Caps Lock Aktif
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                  <Lock size={15} />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyUp}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full bg-canvas/90 border border-border text-ink pl-10 pr-11 py-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors placeholder:text-ink/30 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink/50 hover:text-ink transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-accent hover:bg-accent-hover active:scale-[0.99] text-white font-mono text-xs uppercase tracking-widest font-bold py-3.5 px-6 transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  MEMVERIFIKASI OTORISASI...
                </>
              ) : (
                <>
                  <span>OTORISASI MASUK</span>
                  <span className="text-sm">→</span>
                </>
              )}
            </button>
          </form>

          {/* System Security Notice */}
          <div className="mt-6 pt-4 border-t border-border/40 text-center font-mono text-[10px] text-ink/50 space-y-1">
            <div>AES-GCM // HMAC-SHA256 Encrypted Session Token</div>
            <div>Hanya untuk satu akun administrator pemilik portofolio</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center font-mono text-xs text-ink/40 py-2">
        mhdrhn. Field Console · Muhammad Rehan · Pekanbaru, ID
      </footer>
    </div>
  );
}
