// src/app/api/profil/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    // Cek apakah user sudah login
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { type, namaLengkap, passwordLama, passwordBaru } = data;

    // Cari data user di database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // KASUS 1: UPDATE NAMA
    if (type === "profile") {
      if (!namaLengkap) {
        return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
      }

      await prisma.user.update({
        where: { email: session.user.email },
        data: { namaLengkap },
      });

      return NextResponse.json({ message: "Profil berhasil diperbarui" });
    }

    // KASUS 2: UPDATE PASSWORD
    if (type === "password") {
      if (!passwordLama || !passwordBaru) {
        return NextResponse.json({ error: "Password wajib diisi lengkap" }, { status: 400 });
      }

      // Verifikasi password lama
      const isPasswordValid = await bcrypt.compare(passwordLama, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Password lama salah!" }, { status: 400 });
      }

      // Enkripsi password baru
      const hashedPassword = await bcrypt.hash(passwordBaru, 10);

      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Password berhasil diubah" });
    }

    return NextResponse.json({ error: "Tipe update tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
