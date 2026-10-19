# mhdrhn.

Portfolio Muhammad Rehan: elektronika, pengembangan web, dan riset. Frontend Next.js App Router, React, TypeScript, Tailwind CSS, dan next-themes.

## Menjalankan lokal

Dependency existing menggunakan npm dan `package-lock.json`.

```powershell
npm run dev
```

Build produksi lokal (Google Fonts membutuhkan jaringan saat build):

```powershell
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

## Pemeriksaan

```powershell
npm run lint
node node_modules/typescript/bin/tsc --noEmit --incremental false
node scripts/verify-public-content.mjs
# Jalankan setelah production server lokal aktif pada port 3000:
node scripts/smoke-frontend.mjs
```

Route: Home `/`, `/projects`, `/projects/[slug]`, `/about`, `/experience`, `/lab`, `/achievements`, `/contact`. Projects memakai query `category` dan `q`, dengan fallback form GET. Slug tidak dikenal menghasilkan 404.

## Konteks dan batas implementasi

- Aturan proyek: `agent/docs/AGENTS.md`. Direktori `context/` belum tersedia.
- Data sumber: `agent/docs/DATA.md`; subset publik ada di `src/lib/content.ts`. Field yang belum terkonfirmasi tidak diterbitkan.
- Desain aktif: `docs/redesign/VISUAL_DESIGN_DIRECTION.md`, Redline Field Notes, Syne + Manrope, Light/Dark/System.
- Azura berupa demo deterministik lokal, maksimum 500 karakter per pertanyaan dan 20 pertanyaan per percakapan. Reset/refresh menghapus percakapan; tidak ada API AI atau persistensi server.
- Ilustrasi proyek berlabel konsep; bukan screenshot produk. Avatar resmi Azura dan media karya masih menunggu aset.
- Scroll native dan transisi Web Animations API berdurasi 360 ms, dengan pembatalan serta reduced-motion. Komponen efek lama belum dihapus, tetapi tidak dipasang pada route baru.
- Lisensi font disertakan di `public/licenses/`.
- Metadata masih `noindex`, sitemap kosong sampai hostname produksi disetujui. Tidak ada deployment pada sesi implementasi ini.

Bukti implementasi dan batas QA: [laporan frontend](docs/execution/FRONTEND-REDESIGN-2026-10-18.md).
