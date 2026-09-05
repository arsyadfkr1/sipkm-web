import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminStatistikClient from "@/components/admin-statistik-client";

export const metadata = {
  title: "Statistik & Laporan | Admin SIPKM",
};

export default async function AdminStatistikPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Ambil semua laporan untuk dihitung statistiknya
  const laporanDb = await prisma.laporan.findMany({
    include: {
      kategori: true,
    },
  });

  const formattedReports = laporanDb.map((l) => ({
    id: l.id,
    kategori: l.kategori.namaKategori,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  const stats = {
    total: laporanDb.length,
    menunggu: laporanDb.filter((l) => l.status === "menunggu").length,
    diproses: laporanDb.filter((l) => l.status === "diproses").length,
    selesai: laporanDb.filter((l) => l.status === "selesai").length,
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Statistik & Analitik Laporan</h1>
        <p className="mt-2 text-slate-400">Visualisasi data laporan kerusakan infrastruktur untuk evaluasi kinerja.</p>
      </div>

      <AdminStatistikClient reports={formattedReports} stats={stats} />
    </>
  );
}
