// src/app/api/kategori/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { namaKategori: "asc" },
      include: { instansi: { select: { namaInstansi: true, singkatan: true } } },
    });
    return NextResponse.json({ kategori });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kategori." }, { status: 500 });
  }
}
