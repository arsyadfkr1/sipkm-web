import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RiwayatClient from "@/components/riwayat-client";
import { formatDate } from "@/lib/utils";

export default async function RiwayatLaporanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = parseInt((session.user as any).id);

  const laporanDb = await prisma.laporan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      kategori: true,
      foto: true,
      riwayatStatus: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const formattedReports = laporanDb.map((laporan) => {
    // Bangun timeline default
    const timeline = [
      {
        title: "Laporan Diterima",
        description: "Laporan Anda telah dicatat dalam sistem.",
        date: "Belum",
        completed: false,
        active: false,
      },
      {
        title: "Sedang Diproses",
        description: "Petugas sedang menangani laporan Anda di lapangan.",
        date: "Belum",
        completed: false,
        active: false,
      },
      {
        title: "Selesai",
        description: "Laporan telah ditangani dan diselesaikan.",
        date: "Belum",
        completed: false,
        active: false,
      },
    ];

    // Petakan status dari riwayat
    let statusMenunggu = laporan.riwayatStatus.find((r) => r.statusBaru === "menunggu");
    let statusDiproses = laporan.riwayatStatus.find((r) => r.statusBaru === "diproses");
    let statusSelesai = laporan.riwayatStatus.find((r) => r.statusBaru === "selesai");

    if (statusMenunggu) {
      timeline[0].completed = true;
      timeline[0].date = formatDate(statusMenunggu.createdAt.toISOString());
    }

    if (statusDiproses) {
      timeline[1].completed = true;
      timeline[1].date = formatDate(statusDiproses.createdAt.toISOString());
      if (!statusSelesai) {
        timeline[1].active = true;
      }
    } else if (laporan.status === "menunggu") {
      timeline[1].active = true;
      timeline[1].date = "Menunggu antrean";
    }

    if (statusSelesai) {
      timeline[2].completed = true;
      timeline[2].date = formatDate(statusSelesai.createdAt.toISOString());
      timeline[1].active = false;
    }

    return {
      id: laporan.kodeLaporan,
      title: laporan.judul,
      category: laporan.kategori.namaKategori,
      location: laporan.alamatLokasi || "Lokasi tidak diketahui",
      date: formatDate(laporan.createdAt.toISOString()),
      status: laporan.status,
      image: laporan.foto.length > 0
        ? (laporan.foto[0].namaFile.startsWith("http")
            ? laporan.foto[0].namaFile
            : "/images/placeholder.jpg")
        : "/images/placeholder.jpg",
      description: laporan.deskripsi,
      catatanAdmin: laporan.catatanAdmin || null,
      timeline,
    };
  });

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Memuat riwayat laporan...</div>}>
      <RiwayatClient initialReports={formattedReports} />
    </Suspense>
  );
}
