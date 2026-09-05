import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua notifikasi milik user yang login
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as any).id);

  const notifikasi = await prisma.notifikasi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(notifikasi);
}

// PATCH: Tandai satu atau semua notifikasi sebagai dibaca
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as any).id);
  const body = await req.json();

  if (body.all) {
    // Tandai semua sebagai dibaca
    await prisma.notifikasi.updateMany({
      where: { userId, isDibaca: false },
      data: { isDibaca: true },
    });
  } else if (body.id) {
    // Tandai satu notifikasi
    await prisma.notifikasi.updateMany({
      where: { id: body.id, userId },
      data: { isDibaca: true },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE: Hapus satu notifikasi
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as any).id);
  const { id } = await req.json();

  await prisma.notifikasi.deleteMany({ where: { id, userId } });

  return NextResponse.json({ success: true });
}
