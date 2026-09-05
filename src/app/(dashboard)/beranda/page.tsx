import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ReportCard from "@/components/shared/report-card";
import AnimatedNumber from "@/components/shared/animated-number";
import { redirect } from "next/navigation";
import SyncBanner from "@/components/sync-banner";

export default async function BerandaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const userId = parseInt((session.user as any).id);

  const totalLaporan = await prisma.laporan.count({ where: { userId } });
  const sedangDiproses = await prisma.laporan.count({ where: { userId, status: "diproses" } });
  const laporanSelesai = await prisma.laporan.count({ where: { userId, status: "selesai" } });

  const latestReportsDb = await prisma.laporan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { foto: true },
  });

  const latestReports = latestReportsDb.map((report) => ({
    id: report.id.toString(),
    title: report.judul,
    summary: report.deskripsi,
    location: report.alamatLokasi || "Lokasi belum ditentukan",
    status: report.status.charAt(0).toUpperCase() + report.status.slice(1),
    date: report.createdAt.toISOString(),
    imageUrl: report.foto.length > 0
      ? (report.foto[0].namaFile.startsWith("http")
          ? report.foto[0].namaFile          // ✅ URL Cloudinary (data baru)
          : "/images/placeholder.jpg")        // ⚠️ File lokal lama → tampilkan placeholder
      : "/images/placeholder.jpg",
    description: report.deskripsi,
  }));

  const stats = [
    {
      label: "Total Laporan Anda",
      value: totalLaporan,
      colorClasses: "bg-sky-500/10 text-sky-400",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 6h8M8 10h8M8 14h4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
      ),
    },
    {
      label: "Sedang Diproses",
      value: sedangDiproses,
      colorClasses: "bg-amber-400/10 text-amber-400",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Laporan Selesai",
      value: laporanSelesai,
      colorClasses: "bg-emerald-400/10 text-emerald-400",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ✅ KOTAK KUNING OFFLINE SYNC */}
      <SyncBanner />

      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-8 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/80">SIPKM • Beranda Utama</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Halo, {session.user.name}</h1>
            <p className="max-w-2xl text-slate-300">Sistem Informasi Pelaporan Keluhan Masyarakat yang membantu Anda memantau status laporan, melihat progres, dan berbagi informasi secara cepat.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="/buat-laporan" className="inline-flex items-center justify-center rounded-3xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500">
              Buat Laporan Baru
            </a>
            <a
              href="/riwayat"
              className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-sky-500/40 hover:bg-slate-950/80"
            >
              Lihat Riwayat Laporan
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-sky-500/50"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.colorClasses}`}>{item.icon}</div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-400">{item.label}</p>
              <AnimatedNumber value={item.value} className="text-2xl font-bold text-white -mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/80">Laporan Terbaru</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Perkembangan laporan Anda saat ini</h2>
          </div>
          <p className="text-sm text-slate-400">Diperbarui hari ini</p>
        </div>
        {latestReports.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {latestReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-700 rounded-xl">
            <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-300">Belum Ada Laporan</h3>
            <p className="text-slate-500 max-w-sm mt-1">Anda belum membuat laporan keluhan apapun. Klik tombol di atas untuk mulai membuat laporan pertama Anda.</p>
          </div>
        )}
      </section>
    </>
  );
}
