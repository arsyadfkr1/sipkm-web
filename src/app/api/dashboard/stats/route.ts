// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = payload.userId;

    // Ambil statistik laporan milik user ini
    const [total, menunggu, diproses, selesai, terbaru, notifikasi] = await Promise.all([
      prisma.laporan.count({ where: { userId } }),
      prisma.laporan.count({ where: { userId, status: "menunggu" } }),
      prisma.laporan.count({ where: { userId, status: "diproses" } }),
      prisma.laporan.count({ where: { userId, status: "selesai" } }),
      // 5 laporan terbaru
      prisma.laporan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          kodeLaporan: true,
          judul: true,
          status: true,
          tingkatUrgensi: true,
          alamatLokasi: true,
          createdAt: true,
          kategori: { select: { namaKategori: true, warna: true } },
        },
      }),
      // 4 notifikasi terbaru
      prisma.notifikasi.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          judul: true,
          pesan: true,
          tipe: true,
          isDibaca: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: { total, menunggu, diproses, selesai },
      terbaru,
      notifikasi,
    });
  } catch (error) {
    console.error("[DASHBOARD STATS ERROR]", error);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}
