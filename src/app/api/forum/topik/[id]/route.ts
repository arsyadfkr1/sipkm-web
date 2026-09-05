import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const topik = await prisma.forumTopik.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { namaLengkap: true, role: true } },
        balasan: {
          include: { user: { select: { namaLengkap: true, role: true } } },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!topik) return NextResponse.json({ error: "Topik tidak ditemukan" }, { status: 404 });

    // Tambah views karena dibuka
    await prisma.forumTopik.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json(topik);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat topik" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { isi } = await req.json();
    const userId = parseInt((session.user as any).id);
    const role = (session.user as any).role;
    
    // Admin dianggap isResmi = true
    const isResmi = role === "admin" || role === "superadmin";

    const balasan = await prisma.forumBalasan.create({
      data: {
        topikId: parseInt(id),
        userId,
        isi,
        isResmi,
      },
      include: { user: { select: { namaLengkap: true, role: true } } }
    });

    return NextResponse.json(balasan);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membalas topik" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action;

    if (action === 'upvote') {
      await prisma.forumTopik.update({
        where: { id: parseInt(id) },
        data: { upvotes: { increment: 1 } }
      });
    } else {
      await prisma.forumTopik.update({
        where: { id: parseInt(id) },
        data: { upvotes: { decrement: 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses upvote" }, { status: 500 });
  }
}
