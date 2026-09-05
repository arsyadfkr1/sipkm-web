"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Notifikasi {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  isDibaca: boolean;
  createdAt: string;
}

const tipeStyle: Record<string, { border: string; icon: string; iconColor: string }> = {
  laporan: {
    border: "border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/50",
    icon: "bg-sky-400/10 text-sky-400",
    iconColor: "text-sky-400",
  },
  sistem: {
    border: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50",
    icon: "bg-amber-400/10 text-amber-400",
    iconColor: "text-amber-400",
  },
  forum: {
    border: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50",
    icon: "bg-purple-400/10 text-purple-400",
    iconColor: "text-purple-400",
  },
  galeri: {
    border: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50",
    icon: "bg-emerald-400/10 text-emerald-400",
    iconColor: "text-emerald-400",
  },
};

function TipeIcon({ tipe }: { tipe: string }) {
  if (tipe === "laporan") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (tipe === "forum") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function formatWaktu(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifikasi = useCallback(async () => {
    try {
      const res = await fetch("/api/notifikasi");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifikasi();
  }, [fetchNotifikasi]);

  const unreadCount = notifs.filter((n) => !n.isDibaca).length;
  const displayed = filter === "unread" ? notifs.filter((n) => !n.isDibaca) : notifs;

  const markAsRead = async (id: number) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isDibaca: true } : n));
    await fetch("/api/notifikasi", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    window.dispatchEvent(new Event("refreshNotif"));
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    setNotifs((prev) => prev.map((n) => ({ ...n, isDibaca: true })));
    await fetch("/api/notifikasi", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    window.dispatchEvent(new Event("refreshNotif"));
    setTimeout(() => setIsMarkingAll(false), 600);
  };

  const deleteNotif = async (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notifikasi", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    window.dispatchEvent(new Event("refreshNotif"));
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329]/80 p-8 sm:p-10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">Notifikasi</h1>
              {unreadCount > 0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-500 px-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-lg">Pembaruan terkini terkait laporan Anda.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isMarkingAll}
              className="group relative flex items-center gap-2 rounded-2xl bg-slate-800/80 px-6 py-3 font-semibold text-slate-200 transition-all hover:bg-slate-700 border border-slate-700 hover:scale-105 disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="relative mt-10 flex items-center gap-2 border-b border-slate-700/50 pb-px">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative pb-4 px-2 text-sm font-semibold transition-colors ${filter === f ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              {f === "all" ? "Semua Notifikasi" : `Belum Dibaca${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              {filter === f && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      <div className="space-y-4 pb-10">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="rounded-[1.5rem] border border-slate-800/40 bg-[#0b1329]/50 p-6 animate-pulse h-28" />
          ))
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tidak ada notifikasi</h3>
            <p className="text-slate-400 max-w-sm">Anda akan diberi tahu secara otomatis saat admin memperbarui status laporan Anda.</p>
          </div>
        ) : (
          displayed.map((notif) => {
            const style = tipeStyle[notif.tipe] ?? tipeStyle.sistem;
            return (
              <div
                key={notif.id}
                className={`group relative overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-300 backdrop-blur-xl ${style.border} ${notif.isDibaca ? "opacity-60 hover:opacity-100" : ""}`}
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
                    <TipeIcon tipe={notif.tipe} />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-base font-bold ${notif.isDibaca ? "text-slate-300" : "text-white"}`}>
                        {notif.judul}
                        {!notif.isDibaca && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                      </h3>
                      <span className="shrink-0 text-xs text-slate-500">{formatWaktu(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{notif.pesan}</p>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2">
                    {!notif.isDibaca && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        title="Tandai dibaca"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(notif.id)}
                      title="Hapus"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
