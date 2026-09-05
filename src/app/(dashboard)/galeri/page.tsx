"use client";

import { useState } from "react";
import Image from "next/image";

// Tipe data untuk item galeri
interface GalleryItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  description: string;
  category?: string;
}

// Data dummy untuk galeri disesuaikan dengan screenshot
const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Perbaikan Jalan Flamboyan",
    date: "12 Oktober 2023",
    imageUrl: "/images/Perbaikan Jalan.jpg",
    description: "Tindak lanjut laporan warga mengenai jalan berlubang di...",
    category: "Perbaikan Jalan",
  },
  {
    id: "2",
    title: "Kerja Bakti Bantaran Sungai",
    date: "05 Oktober 2023",
    imageUrl: "/images/Bantaran Sungai.jpeg",
    description: "Kegiatan gotong royong membersihkan sampah di...",
    category: "Kerja Bakti",
  },
  {
    id: "3",
    title: "Distribusi Bantuan Sosial",
    date: "01 Oktober 2023",
    imageUrl: "/images/Bansos.jpg",
    description: "Penyaluran bantuan sembako kepada warga terdampak...",
    category: "Bantuan Sosial",
  },
  {
    id: "4",
    title: "Penanaman 1000 Pohon Perkotaan",
    date: "28 September 2023",
    imageUrl: "/images/penanaman pohon.png",
    description: "Inisiatif penghijauan kota untuk menciptakan lingkungan yang lebih asri dan mengurangi polusi udara.",
    category: "Lainnya",
  },
  {
    id: "5",
    title: "Gotong Royong Lingkungan Warga",
    date: "15 September 2023",
    imageUrl: "/images/KerjaBakti.png",
    description: "Aksi warga bersama-sama membersihkan area pemukiman untuk mencegah banjir dan sarang nyamuk.",
    category: "Kerja Bakti",
  },
  {
    id: "6",
    title: "Penyuluhan Kesehatan Masyarakat",
    date: "10 September 2023",
    imageUrl: "/images/Penyuluhan Kesehatan.png",
    description: "Sosialisasi pola hidup bersih dan sehat serta pemeriksaan kesehatan gratis bagi warga setempat.",
    category: "Lainnya",
  },
];

const filters = ["Semua", "Perbaikan Jalan", "Kerja Bakti", "Bantuan Sosial", "Lainnya"];

export default function GaleriPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeFilter === "Semua" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-8 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Galeri Kegiatan</h1>
          <p className="mt-2 text-slate-400">Dokumentasi hasil tindak lanjut pelaporan masyarakat.</p>
        </div>
        <button className="mt-4 sm:mt-0 shrink-0 rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600">
          Semua
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#2563eb] text-white"
                : "border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-[2rem] border border-slate-800/60 bg-[#0b1329]/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700"
          >
            <div className="relative h-56 w-full overflow-hidden bg-slate-900">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <p className="mb-2 text-xs font-medium text-slate-500">{item.date}</p>
              <h3 className="mb-2 text-lg font-bold text-white leading-snug transition-colors group-hover:text-blue-400">{item.title}</h3>
              <p className="mb-6 text-sm text-slate-400 line-clamp-2">{item.description}</p>
              <button 
                onClick={() => setSelectedItem(item)}
                className="inline-flex items-center text-sm font-medium text-[#3b82f6] transition-colors hover:text-blue-400"
              >
                Baca selengkapnya &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Kegiatan */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop with stronger blur */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedItem(null)}></div>
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329]/95 shadow-[0_0_50px_rgba(56,189,248,0.15)] backdrop-blur-xl flex flex-col sm:flex-row transform transition-all scale-100">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 backdrop-blur-md transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:scale-110"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Image Section */}
            <div className="relative h-64 sm:h-auto sm:w-[45%] shrink-0 overflow-hidden bg-slate-900">
              <Image src={selectedItem.imageUrl} alt={selectedItem.title} fill className="object-cover" />
              {/* Gradient overlays to blend image smoothly into the background color */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0b1329]/95 hidden sm:block pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329]/95 via-transparent to-transparent sm:hidden pointer-events-none"></div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-10 sm:w-[55%] flex flex-col justify-center relative z-10 sm:-ml-8">
              
              {/* Badge */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  {selectedItem.category}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl leading-tight tracking-tight">{selectedItem.title}</h2>
              
              {/* Meta Data */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {selectedItem.date}
                </div>
                <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  124 Dukungan
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-6 border-t border-slate-800/60 pt-6">
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {selectedItem.description}
                  {" "}Kegiatan ini merupakan salah satu bentuk nyata dari tindak lanjut pelaporan masyarakat. Acara berlangsung dengan lancar berkat partisipasi aktif dari seluruh elemen warga. Kami berharap inisiatif ini dapat terus berlanjut dan membawa dampak positif jangka panjang bagi lingkungan kota.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 hover:border-slate-600"
                >
                  Tutup
                </button>
                <button 
                  className="flex-1 rounded-2xl bg-[#2563eb] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Bagikan Kegiatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
