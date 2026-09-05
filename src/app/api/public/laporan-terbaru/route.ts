import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const laporanTerkini = await prisma.laporan.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kodeLaporan: true,
        judul: true,
        deskripsi: true,
        status: true,
        createdAt: true,
        alamatLokasi: true,
        isAnonim: true,
        kategori: {
          select: {
            namaKategori: true,
            warna: true,
            ikon: true,
          }
        },
        user: {
          select: {
            namaLengkap: true,
          }
        }
      }
    });

    // Formatting data to hide identity if anonymous, and truncate description
    const formattedLaporan = laporanTerkini.map(lap => ({
      ...lap,
      pelapor: lap.isAnonim ? "Warga Anonim" : (lap.user?.namaLengkap || "Warga"),
      deskripsiSingkat: lap.deskripsi.length > 100 ? lap.deskripsi.substring(0, 100) + "..." : lap.deskripsi
    }));

    return NextResponse.json(formattedLaporan);
  } catch (error) {
    console.error("Error fetching latest reports:", error);
    return NextResponse.json({ error: "Gagal mengambil data laporan" }, { status: 500 });
  }
}
