import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#050b14] text-slate-300 font-sans selection:bg-rose-500/30">
      {/* Sidebar Admin */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/60 bg-[#0a1122]/95 backdrop-blur-xl">
        <div className="flex h-20 shrink-0 items-center px-8 border-b border-slate-800/60">
          <Link href="/admin" className="flex items-center gap-3 transition-transform hover:scale-105">
            <img src="/logo-sipkm.png" alt="Logo SIPKM Asli" className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
            <span className="text-xl font-bold tracking-tight text-white">
              SIPKM <span className="text-rose-500">Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-rose-500/10 px-4 py-3.5 font-semibold text-rose-500 transition-all hover:bg-rose-500/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Kelola Laporan
          </Link>

          <Link href="/admin/kategori" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Kelola Kategori
          </Link>

          <Link href="/admin/statistik" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistik & Laporan
          </Link>

          <Link href="/admin/profil" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil Admin
          </Link>
        </div>

        {/* Admin Profile Section */}
        <div className="p-4 border-t border-slate-800/60 bg-[#070d1a]/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-bold shadow-lg shadow-rose-500/20">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-200 truncate">{session?.user?.name || "Administrator"}</span>
              <span className="text-xs font-medium text-rose-400">Admin Utama</span>
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/20 hover:border-rose-500/40">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Sistem
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="mx-auto max-w-7xl p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
