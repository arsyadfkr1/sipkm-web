import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diupload" }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }

    // Validasi ukuran file (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 2MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat folder avatars jika belum ada
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    // Nama file unik per user
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `avatar-${userId}-${Date.now()}.${ext}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Simpan URL foto ke kolom `foto` di database
    const fotoUrl = `/uploads/avatars/${fileName}`;
    await prisma.user.update({
      where: { id: userId },
      data: { foto: fotoUrl },
    });

    return NextResponse.json({ success: true, fotoUrl });
  } catch (error) {
    console.error("Error upload avatar:", error);
    return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
  }
}
