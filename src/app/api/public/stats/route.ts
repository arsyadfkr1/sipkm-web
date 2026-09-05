import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalSelesai = await prisma.laporan.count({
      where: { status: "selesai" }
    });

    const totalKategori = await prisma.kategori.count();

    const latestSelesai = await prisma.laporan.findMany({
      where: { status: "selesai" },
      orderBy: { createdAt: "desc" },
      take: 2, // Ambil 2 laporan selesai terbaru
      select: { judul: true }
    });

    const latestDiproses = await prisma.laporan.findMany({
      where: { status: "diproses" },
      orderBy: { createdAt: "desc" },
      take: 2, // Ambil 2 laporan diproses terbaru
      select: { judul: true }
    });

    return NextResponse.json({
      totalSelesai,
      totalKategori,
      latestSelesai,
      latestDiproses
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
