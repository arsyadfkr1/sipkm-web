"use client";

import { useState, useEffect } from "react";
import { get, del } from "idb-keyval";

export default function SyncBanner() {
  const [draft, setDraft] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    get("laporan-offline-sync").then((data) => {
      if (data) setDraft(data);
    });
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) {
      alert("Internet masih mati! Nyalakan WiFi dulu.");
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
      if (draft.files && draft.files.length > 0) {
        draft.files.forEach((file: any) => submitData.append("files", file));
      }
      await fetch("/api/laporan", { method: "POST", body: submitData });
      alert("Sukses! Laporan Offline Anda telah terkirim.");
      await del("laporan-offline-sync");
      setDraft(null);
      window.location.reload();
    } catch (e) {
      alert("Gagal sinkron. Coba lagi nanti.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!draft) return null;

  return (
    <div className="mb-6 rounded-[2rem] border-2 border-yellow-500 bg-yellow-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-xl font-bold text-yellow-500">⚠ Ada Laporan Tersimpan (Mode Offline)</h3>
        <p className="text-sm text-yellow-100/80 mt-1">Laporan belum terkirim karena Anda tidak ada sinyal sebelumnya. Sinkronkan sekarang!</p>
      </div>
      <button onClick={handleSync} disabled={isSyncing} className="whitespace-nowrap bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl font-bold text-black disabled:opacity-50">
        {isSyncing ? "Menyinkronkan..." : "🔄 Sinkronkan Sekarang"}
      </button>
    </div>
  );
}
