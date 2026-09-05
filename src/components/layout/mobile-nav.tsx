"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileNavItems = [
  { label: "Beranda", href: "/beranda", icon: "M4 6h16M4 12h16M4 18h16" },
  { label: "Riwayat", href: "/riwayat", icon: "M5 12h14M9 8h6M9 16h6" },
  { label: "Lapor", href: "/buat-laporan", icon: "M12 4v16M4 12h16", special: true },
  { label: "Profil", href: "/profil", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-slate-800/60 bg-[#0b1329]/90 px-2 pb-safe pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-lg xl:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.special) {
          return (
            <Link key={item.label} href={item.href} className="group relative -top-6 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)] ring-4 ring-[#030712] transition-transform active:scale-95">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-300">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link key={item.label} href={item.href} className="flex flex-col items-center p-2">
            <span className={`mb-1 grid h-8 w-8 place-items-center rounded-full transition-all ${isActive ? "bg-blue-500/20 text-blue-400" : "text-slate-400"}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "1.8"}>
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-500"}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
