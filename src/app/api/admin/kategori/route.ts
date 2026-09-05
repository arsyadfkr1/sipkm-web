import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { namaKategori: "asc" },
      include: { _count: { select: { laporan: true } } },
    });
    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

// POST: Tambah kategori baru
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { namaKategori } = await req.json();
    if (!namaKategori?.trim()) {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    // Cek duplikat
    const existing = await prisma.kategori.findFirst({
      where: { namaKategori: { equals: namaKategori.trim(), mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 409 });
    }

    const newKategori = await prisma.kategori.create({
      data: { namaKategori: namaKategori.trim() },
    });
    return NextResponse.json(newKategori, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambah kategori" }, { status: 500 });
  }
}

// DELETE: Hapus kategori
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const jumlahLaporan = await prisma.laporan.count({ where: { kategoriId: id } });
    if (jumlahLaporan > 0) {
      return NextResponse.json({ error: `Kategori tidak bisa dihapus karena masih dipakai oleh ${jumlahLaporan} laporan.` }, { status: 409 });
    }

    await prisma.kategori.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
