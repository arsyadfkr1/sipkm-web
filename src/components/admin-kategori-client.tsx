"use client";

import { useState } from "react";

interface Kategori {
  id: number;
  namaKategori: string;
  jumlahLaporan: number;
}

export default function AdminKategoriClient({ initialKategori }: { initialKategori: Kategori[] }) {
  const [kategoriList, setKategoriList] = useState(initialKategori);
  const [namaKategori, setNamaKategori] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleTambah = async () => {
    if (!namaKategori.trim()) {
      alert("Nama kategori tidak boleh kosong!");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaKategori }),
      });
      const data = await res.json();
      if (res.ok) {
        setKategoriList((prev) => [...prev, { id: data.id, namaKategori: data.namaKategori, jumlahLaporan: 0 }].sort((a, b) => a.namaKategori.localeCompare(b.namaKategori)));
        setNamaKategori("");
      } else {
        alert(data.error || "Gagal menambah kategori.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsAdding(false);
  };

  const handleHapus = async (id: number, nama: string, jumlah: number) => {
    if (jumlah > 0) {
      alert(`Kategori "${nama}" tidak bisa dihapus karena masih dipakai oleh ${jumlah} laporan.`);
      return;
    }
    if (!confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setKategoriList((prev) => prev.filter((k) => k.id !== id));
      } else {
        alert(data.error || "Gagal menghapus kategori.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setDeletingId(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form Tambah Kategori */}
      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white mb-1">Tambah Kategori Baru</h2>
        <p className="text-xs text-slate-500 mb-6">Kategori baru akan langsung tersedia di form Buat Laporan.</p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={namaKategori}
            onChange={(e) => setNamaKategori(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTambah()}
            placeholder="Contoh: Fasilitas Umum, Kebersihan..."
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
          />
          <button
            onClick={handleTambah}
            disabled={isAdding || !namaKategori.trim()}
            className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold text-sm transition-all hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
            </svg>
            {isAdding ? "Menambahkan..." : "Tambah Kategori"}
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-slate-900/50 border border-slate-800 p-4">
          <p className="text-xs text-slate-500">
            💡 <strong className="text-slate-300">Tips:</strong> Kategori yang masih dipakai laporan tidak bisa dihapus. Pastikan tidak ada laporan aktif sebelum menghapus kategori.
          </p>
        </div>
      </div>

      {/* Daftar Kategori */}
      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Daftar Kategori</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">{kategoriList.length} kategori</span>
        </div>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {kategoriList.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Belum ada kategori.</p>
          ) : (
            kategoriList.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 transition-all hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{k.namaKategori}</p>
                    <p className="text-[11px] text-slate-500">{k.jumlahLaporan} laporan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleHapus(k.id, k.namaKategori, k.jumlahLaporan)}
                  disabled={deletingId === k.id}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${k.jumlahLaporan > 0 ? "cursor-not-allowed text-slate-700" : "text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"}`}
                  title={k.jumlahLaporan > 0 ? "Tidak bisa dihapus - masih ada laporan" : "Hapus kategori"}
                >
                  {deletingId === k.id ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
