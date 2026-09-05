"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

const tabs = [
  { key: "semua", label: "Semua Laporan" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
];

function StatusIcon({ status, className = "h-5 w-5" }: { status: string; className?: string }) {
  if (status === "diproses") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function RiwayatClient({ initialReports }: { initialReports: any[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [activeFilter, setActiveFilter] = useState("semua");
  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedReport, setSelectedReport] = useState(initialReports[0] || null);

  // Jika URL berubah, update search bar lokal
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const filteredReports = initialReports.filter((report) => activeFilter === "semua" || report.status === activeFilter).filter((report) => report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Riwayat Laporan</h1>
          <p className="mt-2 text-sm text-slate-400">Pantau status laporan dan aktivitas Anda.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-full border border-slate-700 bg-[#0b1329]/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 shadow-inner shadow-slate-900/50 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:w-64"
              placeholder="Cari Laporan..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Column: List */}
        <div className="flex-1 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="mb-6 flex space-x-6 overflow-x-auto border-b border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`whitespace-nowrap border-b-2 pb-4 text-sm font-medium transition-colors ${activeFilter === tab.key ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg viewBox="0 0 24 24" className="mb-4 h-12 w-12 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h4 className="font-semibold text-slate-300">Laporan Tidak Ditemukan</h4>
                <p className="text-sm text-slate-500">Coba kata kunci lain atau ubah filter Anda.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-300 ${isSelected ? "border-sky-400/70 bg-sky-950/50 shadow-[inset_0_0_30px_rgba(56,189,248,0.15),0_0_20px_rgba(56,189,248,0.3)] hover:bg-sky-950/60" : "border-transparent hover:bg-slate-800/50 hover:border-slate-700/50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div
                          className={`shrink-0 rounded-xl p-2 ${
                            report.status === "diproses" ? (isSelected ? "bg-sky-500/10 text-sky-400" : "bg-amber-500/10 text-amber-400") : isSelected ? "bg-sky-500/10 text-sky-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          <StatusIcon status={report.status} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white">{report.title}</h3>
                          <p className="mt-1 text-xs text-slate-400">{report.location}</p>
                          <p className="mt-1 text-[11px] text-slate-600">{report.date}</p>
                          {/* Indikator ada balasan Admin */}
                          {report.catatanAdmin && (
                            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-sky-400 font-medium">
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                              </svg>
                              Ada balasan dari Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${report.status === "diproses" ? "text-amber-400" : "text-emerald-400"}`}>
                        <span className={`h-2 w-2 rounded-full ${report.status === "diproses" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                        {report.status === "diproses" ? "Diproses" : "Selesai"}
                      </span>
                    </div>
                    {/* Tombol Lihat Publik */}
                    <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`/laporan/${report.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-400 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Lihat halaman publik
                      </a>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="w-full rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:w-[420px] overflow-y-auto max-h-[85vh]">
          {!selectedReport ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <h4 className="font-semibold text-slate-300">Belum Ada Detail</h4>
              <p className="mt-1 text-sm text-slate-500">Pilih laporan di sebelah kiri untuk melihat progres dan detailnya.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">#{selectedReport.id}</span>
                <span className="text-xs text-slate-500">{selectedReport.date}</span>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedReport.status === "diproses" ? "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20" : "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedReport.status === "diproses" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                  {selectedReport.status === "diproses" ? "Sedang Diproses" : "Selesai"}
                </span>
              </div>

              <div className="relative mb-5 h-48 w-full overflow-hidden rounded-xl bg-slate-800/50">
                {(selectedReport.image || selectedReport.imageUrl || "").startsWith("http") ? (
                  <Image src={selectedReport.image || selectedReport.imageUrl} alt="Bukti Laporan" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                      <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <p className="mt-2 text-xs text-slate-500">Tidak ada foto bukti</p>
                    </div>
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">{selectedReport.category}</div>
              </div>

              <h3 className="mb-2 text-lg font-bold text-white">{selectedReport.title}</h3>
              <div className="mb-2 flex items-start gap-2 text-xs text-slate-400">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {selectedReport.location}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-400">{selectedReport.description}</p>

              {/* Timeline */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-white">Status Penanganan</h4>
                <div className="relative border-l-2 border-slate-800 pl-6">
                  {selectedReport.timeline.map((step: any, i: number) => {
                    let dotClass = "";
                    if (step.completed) dotClass = "bg-sky-500 ring-4 ring-sky-500/20";
                    else if (step.active) dotClass = "bg-amber-400 ring-4 ring-amber-400/20 animate-pulse";
                    else dotClass = "border-2 border-slate-700 bg-slate-900";

                    return (
                      <div key={i} className={`relative ${i < selectedReport.timeline.length - 1 ? "mb-6" : ""}`}>
                        <div className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full ${dotClass}`}></div>
                        <h5 className={`text-sm font-medium ${step.completed || step.active ? "text-white" : "text-slate-500"}`}>{step.title}</h5>
                        <p className={`mt-0.5 text-xs ${step.completed || step.active ? "text-slate-400" : "text-slate-600"}`}>{step.description}</p>
                        <p className={`text-[11px] ${step.completed ? "text-slate-500" : step.active ? "text-amber-400/70" : "text-slate-700"}`}>{step.date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ KOTAK BALASAN DARI ADMIN */}
              {selectedReport.catatanAdmin && (
                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-400" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-sky-400">Pesan dari Admin</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedReport.catatanAdmin}</p>
                </div>
              )}
              {/* ✅ AKHIR KOTAK BALASAN */}
            </>
          )}
        </div>
      </div>
    </>
  );
}
