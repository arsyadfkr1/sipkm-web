import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin-dashboard-client";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Ambil semua laporan beserta user dan kategori
  const laporanDb = await prisma.laporan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kategori: true,
      user: {
        select: { namaLengkap: true, email: true },
      },
      foto: true,
    },
  });

  const formattedReports = laporanDb.map((l) => ({
    id: l.id,
    kodeLaporan: l.kodeLaporan,
    judul: l.judul,
    kategori: l.kategori.namaKategori,
    pelapor: l.isAnonim ? "Anonim" : l.user.namaLengkap,
    tanggal: formatDate(l.createdAt.toISOString()),
    status: l.status,
    deskripsi: l.deskripsi,
    alamat: l.alamatLokasi,
    foto: l.foto.length > 0
      ? (l.foto[0].namaFile.startsWith("http")
          ? l.foto[0].namaFile
          : null)
      : null,
    catatanAdmin: l.catatanAdmin || null,
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
        <h1 className="text-3xl font-bold text-white">Dashboard Utama Admin</h1>
        <p className="mt-2 text-slate-400">Ringkasan statistik dan manajemen laporan masyarakat secara langsung.</p>
      </div>

      <AdminDashboardClient initialReports={formattedReports} stats={stats} />
    </>
  );
}
