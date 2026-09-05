import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const topik = await prisma.forumTopik.findMany({
      include: {
        user: {
          select: { namaLengkap: true },
        },
        _count: {
          select: { balasan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedData = topik.map((t) => ({
      id: t.id.toString(),
      title: t.judul,
      author: t.user.namaLengkap,
      avatar: t.user.namaLengkap.substring(0, 2).toUpperCase(),
      category: t.kategoriId ? "Umum" : "Umum", // Bisa disambungkan ke tabel Kategori nanti
      replies: t._count.balasan,
      views: t.views,
      upvotes: t.upvotes,
      lastUpdated: t.updatedAt.toISOString(),
      excerpt: t.isi.substring(0, 100) + (t.isi.length > 100 ? "..." : ""),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat topik" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();
    const userId = parseInt((session.user as any).id);

    const newTopik = await prisma.forumTopik.create({
      data: {
        userId,
        judul: title,
        isi: content,
        upvotes: 1, // Penulis otomatis upvote
      },
    });

    return NextResponse.json(newTopik);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat topik" }, { status: 500 });
  }
}
