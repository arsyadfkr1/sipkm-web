import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export default async function ProfilAdminPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profil Administrator</h1>
        <p className="text-slate-400">Pusat informasi kredensial dan tingkat hak akses sistem Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Kartu Identitas Besar */}
        <div className="col-span-1">
          <div className="rounded-3xl border border-slate-800/60 bg-[#0a1122]/90 backdrop-blur-xl p-8 text-center flex flex-col items-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-bold text-5xl shadow-xl shadow-rose-500/20 mb-6 border-4 border-[#050b14] z-10">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{session?.user?.name || "Administrator"}</h2>
            
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20 mb-6 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Admin Utama
            </span>
            
            <div className="w-full h-[1px] bg-slate-800/60 mb-6"></div>
            
            <p className="text-slate-400 text-sm mb-2">Terakhir Aktif:</p>
            <p className="text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sedang Online
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Detail Informasi */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800/60 bg-[#0a1122]/90 backdrop-blur-xl p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-slate-800/60 pb-5">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Informasi Konfigurasi Sistem
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Data 1 */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-slate-200">{session?.user?.name || "Admin SIPKM"}</div>
                </div>
              </div>

              {/* Data 2 */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Kredensial</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-slate-200">{session?.user?.email || "admin@sipkm.local"}</div>
                </div>
              </div>

              {/* Data 3 */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Otorisasi</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-emerald-400">Akses Penuh (Granted)</div>
                </div>
              </div>

              {/* Data 4 */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bergabung Sejak</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-slate-200">Oktober 2023</div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
