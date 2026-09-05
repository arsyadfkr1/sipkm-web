# SIPKM — Sistem Informasi Pelaporan Keluhan Masyarakat

Aplikasi berbasis web untuk pelaporan keluhan infrastruktur masyarakat Kota Bandar Lampung.

**Status:** Prototipe Akademis (Skripsi S1)

## Tech Stack
- **Frontend:** Next.js 16, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** MySQL (lokal) / Railway (produksi)
- **Auth:** NextAuth.js
- **Storage:** Cloudinary (foto laporan), Local (avatar)
- **Map:** OpenStreetMap + Leaflet

## Fitur Utama
- 📋 Pelaporan keluhan infrastruktur real-time
- 🗺️ Peta sebaran laporan (WebGIS)
- 📊 Dasbor admin dengan grafik & statistik
- 💬 Forum komunitas warga
- 🔔 Notifikasi in-app
- 📱 Progressive Web App (dapat di-install di HP)
- 📄 Export laporan ke PDF/Excel

## Cara Jalankan Lokal
```bash
npm install
cp .env.example .env   # isi variabel environment
npx prisma migrate dev
npm run dev
```
