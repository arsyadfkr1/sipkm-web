"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock data for offline drafts
const offlineDraftsData = [
  {
    id: "draft-1",
    title: "Jalan Rusak di Depan Masjid Agung",
    category: "Infrastruktur",
    imageUrl: "/jalan_berlubangg.png", 
    timestamp: "Disimpan 2 jam lalu",
  },
  {
    id: "draft-2",
    title: "Fasilitas Taman Kota Tidak Terawat",
    category: "Fasilitas Umum",
    imageUrl: "/images/sampah liar.jpg", // Has an image
    timestamp: "Disimpan 1 hari lalu",
  },
  {
    id: "draft-3",
    title: "Lampu Jalan Mati Total",
    category: "Infrastruktur",
    imageUrl: "/images/Lampu Jalan Mati Total.jpg",
    timestamp: "Disimpan 3 hari lalu",
  },
];

export default function DrafOfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [drafts, setDrafts] = useState(offlineDraftsData);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Effect to detect network status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSyncAll = () => {
    if (!isOnline || drafts.length === 0) return;
    setIsSyncingAll(true);
    setSyncProgress(0);

    const total = drafts.length;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setSyncProgress(Math.floor((current / total) * 100));

      if (current >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setDrafts([]);
          setIsSyncingAll(false);
          setSyncProgress(0);
          triggerToast("Semua draf berhasil disinkronkan ke server!");
        }, 800);
      }
    }, 800);
  };

  const handleSyncSingle = (id: string) => {
    if (!isOnline) return;
    setSyncingId(id);

    setTimeout(() => {
      setSyncedIds((prev) => [...prev, id]);
      setTimeout(() => {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        setSyncingId(null);
        triggerToast("Draf laporan berhasil disinkronkan!");
      }, 500);
    }, 1500);
  };

  return (
    <div className="relative space-y-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 p-4 text-emerald-300 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-slide-in">
          <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329]/80 p-8 sm:p-10 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Draf Offline</h1>
              {/* Online/Offline status badge */}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isOnline 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
              }`}>
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
                {isOnline ? "Koneksi Terhubung" : "Sedang Offline"}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-slate-400 text-base leading-relaxed">
              Laporan yang Anda simpan saat tidak ada koneksi internet. Laporan akan dikirim ke sistem saat koneksi kembali pulih.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/30 px-3 py-1.5 text-xs text-slate-400">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Penyimpanan Lokal Terpakai: <strong className="text-slate-300">2.4 MB</strong>
            </div>
          </div>
          {drafts.length > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={!isOnline || isSyncingAll}
              className="relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 border border-transparent disabled:border-slate-800 hover:scale-105 active:scale-95 shrink-0"
            >
              {isSyncingAll && (
                <div className="absolute inset-y-0 left-0 bg-sky-400/30" style={{ width: `${syncProgress}%`, transition: 'width 0.5s ease' }}></div>
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                {isSyncingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyinkronkan... {syncProgress}%
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sinkronisasi Semua ({drafts.length})
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-amber-300 shadow-lg backdrop-blur-xl animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-bold text-white text-base">Anda sedang offline.</p>
            <p className="text-slate-400 mt-0.5">Semua data laporan tersimpan dengan aman secara lokal di perangkat Anda. Proses sinkronisasi akan dilanjutkan kembali saat internet terhubung.</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drafts.map((draft) => {
          const isItemSyncing = syncingId === draft.id;
          const isItemSynced = syncedIds.includes(draft.id);

          return (
            <div 
              key={draft.id} 
              className={`group flex flex-col overflow-hidden rounded-[2.25rem] border bg-[#0b1329]/80 shadow-lg transition-all duration-500 ${
                isItemSynced 
                  ? "scale-90 opacity-0 border-emerald-500/50 bg-emerald-950/10" 
                  : isItemSyncing 
                    ? "border-sky-500/50 bg-sky-950/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                    : "border-slate-800/40 hover:-translate-y-1 hover:border-sky-400/60 hover:bg-sky-950/40 hover:shadow-[inset_0_0_30px_rgba(56,189,248,0.1),0_0_30px_rgba(56,189,248,0.25)]"
              }`}
            >
              {draft.imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={draft.imageUrl} alt={draft.title} fill className={`object-cover transition-all duration-300 ${isItemSyncing ? 'scale-105 blur-[2px]' : ''}`} />
                  {isItemSyncing && (
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-sky-500/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950/30 to-indigo-950/30 border-b border-slate-800/20 relative overflow-hidden transition-colors duration-500 group-hover:from-slate-800 group-hover:via-sky-900/40 group-hover:to-indigo-900/40">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl transition-all duration-500 group-hover:bg-sky-400/30"></div>
                  <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-500 group-hover:bg-indigo-400/30"></div>
                  <svg className="relative z-10 h-12 w-12 text-sky-400/50 transition-transform duration-500 group-hover:scale-110 group-hover:text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {isItemSyncing && (
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-sky-500/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{draft.timestamp}</span>
                <h3 className="mt-2 text-lg font-bold text-white leading-snug line-clamp-2">{draft.title}</h3>
                <p className="mt-1 text-sm font-medium text-cyan-400">{draft.category}</p>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-800/40 p-4">
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2 text-xs font-medium text-slate-300 transition-all duration-300 hover:bg-sky-500/10 hover:border-sky-500/40 hover:text-sky-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    Edit
                  </button>
                  <button className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2 text-xs font-medium text-slate-300 transition-all duration-300 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    Hapus
                  </button>
                </div>
                
                <button 
                  onClick={() => handleSyncSingle(draft.id)}
                  disabled={!isOnline || isItemSyncing || isItemSynced}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-all duration-300 ${
                    isItemSynced
                      ? "bg-emerald-600 cursor-default"
                      : isItemSyncing
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 cursor-not-allowed"
                        : "bg-[#2563eb] hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent"
                  }`}
                >
                  {isItemSynced ? (
                    "Selesai"
                  ) : isItemSyncing ? (
                    "Proses..."
                  ) : (
                    "Sinkron"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {drafts.length === 0 && !isSyncingAll && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-sky-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Sinkronisasi Tuntas!</h3>
          <p className="text-slate-400 max-w-sm mb-8">Semua draf Anda telah sukses dikirim ke server. Ruang penyimpanan lokal sekarang kosong.</p>
          <Link href="/buat-laporan" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 4v16M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Buat Laporan Baru
          </Link>
        </div>
      )}
    </div>
  );
}
