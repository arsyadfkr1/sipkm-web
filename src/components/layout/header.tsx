"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const districts = [
  "Bandar Lampung",
  "Bumi Waras",
  "Enggal",
  "Kedamaian",
  "Kedaton",
  "Kemiling",
  "Labuhan Ratu",
  "Langkapura",
  "Panjang",
  "Rajabasa",
  "Sukabumi",
  "Sukarame",
  "Tanjung Karang Barat",
  "Tanjung Karang Pusat",
  "Tanjung Karang Timur",
  "Tanjung Senang",
  "Teluk Betung Barat",
  "Teluk Betung Selatan",
  "Teluk Betung Timur",
  "Teluk Betung Utara",
  "Way Halim",
];

export default function DashboardHeader() {
  const { profileData } = useProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Bandar Lampung");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Ambil data notifikasi untuk cek pesan belum dibaca
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notifikasi");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter((n: any) => !n.isDibaca).length);
        }
      } catch (e) {
        console.error("Gagal load notifikasi:", e);
      }
    };
    
    fetchNotifs(); // Panggil saat pertama render

    // Event listener untuk dipanggil saat user membaca notif
    const handleRefresh = () => fetchNotifs();
    window.addEventListener("refreshNotif", handleRefresh);

    return () => window.removeEventListener("refreshNotif", handleRefresh);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/riwayat?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Calculate initials from name (e.g. "Andi John" -> "AJ")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_auto] xl:grid-cols-[2fr_auto]">
      <div className="grid gap-6 sm:grid-cols-[1fr_300px]">
        {/* Bilah Pencarian */}
        <form onSubmit={handleSearch} className="relative flex h-full items-center gap-3 rounded-3xl border border-slate-800/40 bg-[#0b1329]/80 px-5 py-3 lg:py-0 text-slate-100 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-all duration-300 hover:border-sky-500/40 hover:bg-[#0b1329] hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400 focus-within:shadow-[0_0_30px_rgba(14,165,233,0.5)]">
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0 text-slate-400 transition-colors duration-300 group-focus-within:text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input 
            type="search" 
            aria-label="Cari laporan atau info" 
            placeholder="Cari laporan atau info..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none" 
          />
        </form>

        {/* Tombol Lokasi */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-full w-full items-center justify-center gap-3 rounded-3xl border border-slate-800/40 bg-[#0b1329]/80 px-5 text-[15px] text-slate-100 transition-all duration-300 hover:border-sky-400 hover:bg-[#0b1329] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 0-7 7c0 4.89 7 13 7 13s7-8.11 7-13a7 7 0 0 0-7-7Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="truncate font-medium text-cyan-300">{selectedLocation}</span>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-cyan-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay for clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[240px] overflow-hidden rounded-2xl border border-slate-700/50 bg-[#131b2f] py-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="max-h-64 overflow-y-auto">
                  {districts.map((district) => (
                    <button
                      key={district}
                      onClick={() => {
                        setSelectedLocation(district);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full px-5 py-3 text-left text-[15px] transition-colors ${selectedLocation === district ? "bg-sky-500/20 text-sky-300 font-medium" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {/* Notifikasi */}
        <Link href="/notifikasi" className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-800/40 bg-[#0b1329]/80 text-slate-400 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-sky-400 hover:bg-[#0b1329] hover:text-sky-300 hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-95">
          <svg viewBox="0 0 24 24" className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute right-4 top-4 block h-3 w-3 rounded-full bg-rose-500 ring-2 ring-[#0b1329] animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
          )}
        </Link>
        {/* Profil Singkat */}
        <Link href="/profil" className="group flex h-16 shrink-0 items-center gap-4 rounded-full border border-slate-800/40 bg-[#0b1329]/80 py-2.5 pl-7 pr-3 text-slate-100 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-sky-400 hover:bg-[#0b1329] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98]">
          <span className="text-base font-semibold text-white transition-colors duration-300 group-hover:text-cyan-300">{profileData.name}</span>
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-red-500/60 transition-all duration-300 group-hover:ring-sky-300 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.8)]">
            <Image src="/images/aku arsyad.jpg" alt="Foto profil" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        </Link>
      </div>
    </div>
  );
}
