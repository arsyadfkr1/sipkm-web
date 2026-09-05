import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaLengkap, email, password, noTelpon } = body;

    if (!namaLengkap || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 400 });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        namaLengkap,
        email,
        password: hashedPassword,
        noTelpon: noTelpon || null,
        role: "masyarakat", // Default role
      },
    });

    // Hilangkan password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ 
      message: "Akun berhasil dibuat", 
      user: userWithoutPassword 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
