'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError(data.message || 'Otentikasi gagal. Periksa kembali username dan password.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Koneksi server gagal. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-center items-center px-4 py-12 selection:bg-accent/20">
      {/* Background technical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Terminal Header */}
        <div className="border border-border/80 bg-surface/90 backdrop-blur-md shadow-2xl p-6 sm:p-8 relative">
          {/* Top Redline Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-accent font-semibold uppercase block">
                [SECURE_ACCESS_NODE]
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink mt-0.5">
                mhdrhn<span className="text-accent">.</span> Console
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[11px] text-ink/70">AUTH_GATE</span>
            </div>
          </div>

          <p className="text-xs text-ink/70 leading-relaxed mb-6 font-sans">
            Sistem manajemen konten terpadu portofolio Muhammad Rehan. Masukkan kredensial administrator pemilik untuk mengelola data dinamis dan susunan Home.
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-accent/10 border-l-2 border-accent text-accent text-xs font-mono leading-relaxed">
              <span className="font-bold">[ERR_AUTH]</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] tracking-wide text-ink/80 uppercase mb-2">
                User Identifier
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="rehan"
                className="w-full bg-canvas/80 border border-border text-ink px-4 py-3 text-sm font-sans focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] tracking-wide text-ink/80 uppercase mb-2">
                Secret Keyphrase
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-canvas/80 border border-border text-ink px-4 py-3 text-sm font-sans focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-accent hover:bg-accent-hover active:bg-accent text-white font-mono text-xs uppercase tracking-wider font-semibold py-3.5 px-6 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  MEMVERIFIKASI...
                </>
              ) : (
                'OTORISASI MASUK →'
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-ink/60">
            <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
              ← Kembali ke Beranda
            </Link>
            <span>v4.1.0-sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
