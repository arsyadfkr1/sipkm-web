"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function AdminDashboardClient({ initialReports, stats }: { initialReports: any[]; stats: any }) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingBalasan, setIsSendingBalasan] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [liveStats, setLiveStats] = useState(stats);
  const [statusLog, setStatusLog] = useState<{ status: string; waktu: string }[]>([]);
  const [teksBalasan, setTeksBalasan] = useState("");

  const handleExportCSV = () => {
    const headers = ["No", "Kode Laporan", "Pelapor", "Kategori", "Status", "Tanggal", "Alamat Lokasi", "Deskripsi"];
    const csvRows = reports.map((r, i) => {
      // Escape teks untuk CSV agar koma di dalam alamat/deskripsi tidak merusak kolom
      const escapeCsv = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      return [
        i + 1,
        r.kodeLaporan,
        escapeCsv(r.pelapor),
        escapeCsv(r.kategori),
        r.status,
        r.tanggal,
        escapeCsv(r.alamat),
        escapeCsv(r.deskripsi)
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Laporan_SIPKM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Rekap Data Laporan SIPKM (Bandar Lampung)", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);
    
    const tableColumn = ["No", "Kode Laporan", "Pelapor", "Kategori", "Status", "Tanggal"];
    const tableRows = reports.map((r, i) => [
      i + 1,
      r.kodeLaporan,
      r.pelapor,
      r.kategori,
      r.status,
      r.tanggal
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] } // Warna dark blue sesuai tema
    });

    doc.save(`Laporan_SIPKM_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSelectReport = (report: any) => {
    setSelectedReport(report);
    setStatusLog([]);
    setTeksBalasan(report.catatanAdmin || "");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedReport.id, status: newStatus }),
      });
      if (res.ok) {
        const updated = reports.map((r) => (r.id === selectedReport.id ? { ...r, status: newStatus } : r));
        setReports(updated);
        setSelectedReport({ ...selectedReport, status: newStatus });
        const now = new Date();
        const waktuFormatted = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) + " " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setStatusLog((prev) => [{ status: newStatus, waktu: waktuFormatted }, ...prev]);
        setLiveStats((prev: any) => ({
          ...prev,
          menunggu: updated.filter((l) => l.status === "menunggu").length,
          diproses: updated.filter((l) => l.status === "diproses").length,
          selesai: updated.filter((l) => l.status === "selesai").length,
        }));
      } else {
        alert("Gagal mengupdate status");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsUpdating(false);
  };

  const handleKirimBalasan = async () => {
    if (!selectedReport || !teksBalasan.trim()) {
      alert("Tulis balasan terlebih dahulu!");
      return;
    }
    setIsSendingBalasan(true);
    try {
      const res = await fetch("/api/admin/laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedReport.id, catatanAdmin: teksBalasan }),
      });
      if (res.ok) {
        const updated = reports.map((r) => (r.id === selectedReport.id ? { ...r, catatanAdmin: teksBalasan } : r));
        setReports(updated);
        setSelectedReport({ ...selectedReport, catatanAdmin: teksBalasan });
        alert("✅ Balasan berhasil dikirim ke warga!");
      } else {
        alert("Gagal mengirim balasan.");
      }
    } catch {
      alert("Terjadi kesalahan saat mengirim balasan.");
    }
    setIsSendingBalasan(false);
  };

  // ✅ FUNGSI HAPUS LAPORAN
  const handleHapusLaporan = async (id: number, judul: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Jangan trigger handleSelectReport
    if (!confirm(`⚠️ Yakin ingin menghapus laporan "${judul}"?\n\nTindakan ini tidak bisa dibatalkan!`)) return;
    setIsDeletingId(id);
    try {
      const res = await fetch("/api/admin/laporan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const updated = reports.filter((r) => r.id !== id);
        setReports(updated);
        if (selectedReport?.id === id) setSelectedReport(null);
        setLiveStats((prev: any) => ({
          ...prev,
          total: updated.length,
          menunggu: updated.filter((l) => l.status === "menunggu").length,
          diproses: updated.filter((l) => l.status === "diproses").length,
          selesai: updated.filter((l) => l.status === "selesai").length,
        }));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus laporan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsDeletingId(null);
  };

  // ✅ Hitung data untuk Grafik secara dinamis
  const pieData = useMemo(() => [
    { name: 'Menunggu', value: liveStats.menunggu, color: '#94a3b8' },
    { name: 'Diproses', value: liveStats.diproses, color: '#f59e0b' },
    { name: 'Selesai', value: liveStats.selesai, color: '#10b981' },
  ].filter(d => d.value > 0), [liveStats]); // Sembunyikan yang nilainya 0

  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.kategori] = (counts[r.kategori] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      jumlah: counts[key]
    })).sort((a, b) => b.jumlah - a.jumlah); // Urutkan dari terbanyak
  }, [reports]);

  return (
    <div className="flex flex-col gap-6">
      {/* Widget Statistik */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:border-sky-500/50">
          <p className="text-xs font-medium text-slate-400">Total Laporan Masuk</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{liveStats.total}</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:border-slate-400/50">
          <p className="text-xs font-medium text-slate-400">Menunggu Penanganan</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-slate-300">{liveStats.menunggu}</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:border-amber-400/50">
          <p className="text-xs font-medium text-slate-400">Sedang Diproses</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-amber-400">{liveStats.diproses}</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:border-emerald-400/50">
          <p className="text-xs font-medium text-slate-400">Laporan Selesai</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-emerald-400">{liveStats.selesai}</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>



      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabel Laporan */}
        <div className="flex-1 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl">
          {/* Header Tabel & Tombol Ekspor */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Daftar Laporan Masuk</h3>
            <div className="flex gap-3">
              <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 hover:scale-105" title="Unduh format Excel (CSV)">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/20 hover:scale-105" title="Unduh format PDF">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                PDF
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Kode</th>
                  <th className="px-4 py-3">Pelapor</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} onClick={() => handleSelectReport(report)} className={`border-b border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/30 ${selectedReport?.id === report.id ? "bg-slate-800/50" : ""}`}>
                    <td className="px-4 py-4 font-medium text-white">{report.kodeLaporan}</td>
                    <td className="px-4 py-4">{report.pelapor}</td>
                    <td className="px-4 py-4">{report.kategori}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          report.status === "menunggu" ? "bg-slate-500/10 text-slate-400" : report.status === "diproses" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">{report.tanggal}</td>
                    {/* ✅ TOMBOL AKSI */}
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Tombol Lihat Halaman Publik */}
                        <a
                          href={`/laporan/${report.kodeLaporan}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-sky-500/10 hover:text-sky-400"
                          title="Lihat Halaman Publik"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {/* Tombol Hapus */}
                        <button
                          onClick={(e) => handleHapusLaporan(report.id, report.judul, e)}
                          disabled={isDeletingId === report.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                          title="Hapus Laporan"
                        >
                          {isDeletingId === report.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Belum ada laporan masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Detail & Aksi */}
        <div className="w-full lg:w-[400px] shrink-0 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl overflow-y-auto max-h-[80vh]">
          {!selectedReport ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-500">
              <p>Pilih laporan di tabel untuk melihat detail.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Kode: {selectedReport.kodeLaporan}</span>
                <span className="text-xs text-slate-500">{selectedReport.tanggal}</span>
              </div>
              {selectedReport.foto && (
                <div className="relative mb-5 h-48 w-full overflow-hidden rounded-xl bg-slate-800/50">
                  <Image src={selectedReport.foto} alt="Bukti" fill className="object-cover" />
                </div>
              )}
              <h3 className="mb-1 text-lg font-bold text-white">{selectedReport.judul}</h3>
              <p className="mb-4 text-xs text-rose-400">Dilaporkan oleh: {selectedReport.pelapor}</p>
              <div className="mb-6 rounded-xl bg-slate-900/50 p-4 border border-slate-800">
                <p className="text-xs font-semibold text-slate-300 mb-1">Lokasi:</p>
                <p className="text-xs text-slate-400 mb-3">{selectedReport.alamat}</p>
                <p className="text-xs font-semibold text-slate-300 mb-1">Deskripsi:</p>
                <p className="text-sm text-slate-400">{selectedReport.deskripsi}</p>
              </div>

              {/* Aksi Status */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-semibold text-white mb-4">Aksi Penanganan (Admin)</h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleUpdateStatus("diproses")}
                    disabled={isUpdating || selectedReport.status === "diproses" || selectedReport.status === "selesai"}
                    className="w-full py-3 rounded-xl bg-amber-500 text-amber-950 font-bold text-sm transition-all hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tandai Sedang Diproses
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("selesai")}
                    disabled={isUpdating || selectedReport.status === "selesai"}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-sm transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selesaikan Laporan
                  </button>
                  {/* ✅ TOMBOL HAPUS DI PANEL DETAIL */}
                  <button
                    onClick={(e) => handleHapusLaporan(selectedReport.id, selectedReport.judul, e)}
                    disabled={isDeletingId === selectedReport.id}
                    className="w-full py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-sm transition-all hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Laporan Ini
                  </button>
                </div>
              </div>

              {/* Kirim Balasan */}
              <div className="border-t border-slate-800 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Kirim Balasan ke Warga
                </h4>
                <p className="text-[10px] text-slate-500 mb-3">Pesan ini akan tampil di halaman Riwayat Laporan milik warga.</p>
                {selectedReport.catatanAdmin && (
                  <div className="mb-3 rounded-xl bg-sky-500/10 border border-sky-500/30 p-3">
                    <p className="text-[10px] font-semibold text-sky-400 mb-1">💬 Balasan terkirim saat ini:</p>
                    <p className="text-xs text-slate-300">{selectedReport.catatanAdmin}</p>
                  </div>
                )}
                <textarea
                  value={teksBalasan}
                  onChange={(e) => setTeksBalasan(e.target.value)}
                  placeholder="Contoh: Laporan Anda telah diteruskan ke Dinas PU Kota Bandar Lampung..."
                  rows={4}
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 p-3 resize-none focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  onClick={handleKirimBalasan}
                  disabled={isSendingBalasan || !teksBalasan.trim()}
                  className="mt-3 w-full py-3 rounded-xl bg-sky-500 text-white font-bold text-sm transition-all hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isSendingBalasan ? "Mengirim..." : "Kirim Balasan"}
                </button>
              </div>

              {/* Riwayat Status */}
              <div className="border-t border-slate-800 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Riwayat Perubahan Status
                </h4>
                {statusLog.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Belum ada perubahan status pada sesi ini.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {statusLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full mt-0.5 shrink-0 ${log.status === "diproses" ? "bg-amber-400" : log.status === "selesai" ? "bg-emerald-400" : "bg-slate-400"}`} />
                          {index < statusLog.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-1 min-h-[16px]" />}
                        </div>
                        <div className="pb-3">
                          <p className={`text-xs font-semibold ${log.status === "diproses" ? "text-amber-400" : log.status === "selesai" ? "text-emerald-400" : "text-slate-400"}`}>
                            Status diubah ke: <span className="uppercase">{log.status}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">🕐 {log.waktu} • oleh Admin</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
