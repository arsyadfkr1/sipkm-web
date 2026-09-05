"use client";

import { useState, useEffect } from "react";
import ReportCard from "@/components/shared/report-card";
import { StatCard } from "@/components/shared/stat-card";
import { reports } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { get, del } from "idb-keyval";

// --- KOMPONEN FITUR OFFLINE SYNC (PWA) ---
function SyncBanner() {
  const [draft, setDraft] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Mengecek ke dalam IndexedDB apakah ada laporan yang nyangkut saat Offline
    get("laporan-offline-sync").then((data) => {
      if (data) setDraft(data);
    });
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) {
      alert("Internet Anda masih mati! Tolong cari sinyal atau nyalakan WiFi dulu.");
      return;
    }

    setIsSyncing(true);
    try {
      const submitData = new FormData();
      submitData.append("title", draft.title);
      submitData.append("category", draft.category);
      submitData.append("description", draft.description);
      submitData.append("address", draft.address);
      submitData.append("lat", draft.lat);
      submitData.append("lng", draft.lng);
      submitData.append("isAnonim", draft.isAnonim);

      // Memasukkan gambar kembali dari penyimpanan lokal (IndexedDB)
      if (draft.files && draft.files.length > 0) {
        draft.files.forEach((file: any) => {
          submitData.append("files", file);
        });
      }

      const res = await fetch("/api/laporan", {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) throw new Error("Gagal sinkron");

      alert("Sukses! Laporan Offline Anda berhasil terkirim ke Server Kelurahan.");
      await del("laporan-offline-sync"); // Hapus memori lokal setelah sukses
      setDraft(null);
      window.location.reload();
    } catch (error) {
      alert("Terjadi kesalahan saat menyinkronkan data. Coba lagi nanti.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!draft) return null; // Sembunyikan kotak kuning kalau tidak ada laporan yang nyangkut

  return (
    <div className="mb-6 rounded-[2rem] border-2 border-yellow-500 bg-yellow-500/10 p-6 shadow-[0_10px_30px_-15px_rgba(234,179,8,0.5)] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all animate-in slide-in-from-top-4">
      <div>
        <h3 className="text-xl font-bold text-yellow-500">⚠ Ada Laporan Tersimpan (Mode Offline)</h3>
        <p className="text-sm text-yellow-100/80 mt-1 max-w-2xl">Sistem mendeteksi ada laporan yang belum terkirim ke server kelurahan karena sinyal Anda hilang sebelumnya. Mumpung sekarang sudah online, mari kirim laporannya!</p>
      </div>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="whitespace-nowrap rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-yellow-400 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSyncing ? "Menyinkronkan..." : "🔄 Sinkronkan Sekarang"}
      </button>
    </div>
  );
}
// --- BATAS KOMPONEN OFFLINE SYNC ---

const stats = [
  {
    label: "Total Laporan Anda",
    value: formatNumber(1248),
    accentColor: "bg-sky-500",
    sparklineData: [400, 520, 680, 800, 950, 1100, 1248],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 6h8M8 10h8M8 14h4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: "Sedang Diproses",
    value: formatNumber(342),
    accentColor: "bg-amber-400",
    sparklineData: [120, 180, 210, 310, 280, 360, 342],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v16M7 9h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Laporan Selesai",
    value: formatNumber(810),
    accentColor: "bg-emerald-400",
    sparklineData: [200, 320, 410, 520, 670, 750, 810],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const latestReports = reports.slice(0, 6);

export default function DashboardPage() {
  return (
    <>
      {/* KITA PANGGIL KOTAK PERINGATAN KUNING DI SINI (PALING ATAS) */}
      <SyncBanner />

      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-8 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/80">SIPKM • Bandar Lampung</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Halo, Andi John</h1>
            <p className="max-w-2xl text-slate-300">Sistem Informasi Pelaporan Keluhan Masyarakat yang membantu Anda memantau status laporan, melihat progres, dan berbagi informasi secara cepat.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="inline-flex items-center justify-center rounded-3xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500">Buat Laporan Baru</button>
            <button className="inline-flex items-center justify-center rounded-3xl border border-slate-800/50 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-sky-500/40 hover:bg-slate-950/80">
              Lihat Riwayat Laporan
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} accentColor={item.accentColor} icon={item.icon} sparklineData={item.sparklineData} />
        ))}
      </div>
      <section className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/80">Laporan Terbaru</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Perkembangan kondisi terbaru di sekitar Anda</h2>
          </div>
          <p className="text-sm text-slate-400">Terakhir diperbarui {formatDate("2026-06-28")}</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {latestReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </>
  );
}
