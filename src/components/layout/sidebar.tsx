"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import InstallPwaButton from "@/components/install-pwa-button";

const navItems = [
  { label: "Dashboard", href: "/beranda", icon: "M4 6h16M4 12h16M4 18h16" },
  { label: "Buat Laporan", href: "/buat-laporan", icon: "M12 4v16M4 12h16" },
  { label: "Peta Sebaran", href: "/peta", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { label: "Riwayat Laporan", href: "/riwayat", icon: "M5 12h14M9 8h6M9 16h6" },
  { label: "Komunitas", href: "/komunitas", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
  { label: "Profil Saya", href: "/profil", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl xl:flex">
      <div className="mb-12 space-y-3">
        <div className="inline-flex items-center gap-3 rounded-[2rem] bg-slate-950/10 px-4 py-3 text-white shadow-inner shadow-sky-500/5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <Image src="/logo-sipkm.png" alt="SIPKM Logo" width={44} height={44} className="object-contain" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">SIPKM</p>
            <p className="text-sm text-slate-400">Bandar Lampung</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full shrink-0 items-center gap-4 rounded-[2rem] border px-4 py-3 text-left transition-all duration-300 ${
                isActive ? "border-transparent bg-[#2563eb] text-white shadow-[0_20px_50px_-30px_rgba(37,99,235,0.75)]" : "border-slate-800/50 bg-white/5 text-slate-200 hover:border-sky-500/30 hover:bg-slate-950/80"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950/40 text-sky-300">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Install PWA Button & Logout */}
      <div className="mt-auto shrink-0 flex flex-col gap-4 pt-4 border-t border-slate-800/50">
        <InstallPwaButton />
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full shrink-0 items-center gap-4 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-left transition-all duration-300 hover:border-rose-500/50 hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] text-rose-400 group"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/20 text-rose-400 transition-colors group-hover:bg-rose-500 group-hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </span>
          <span className="font-bold">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
