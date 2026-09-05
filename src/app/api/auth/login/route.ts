// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // ── Cari user di database ──
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        password: true,
        role: true,
        isAktif: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (!user.isAktif) {
      return NextResponse.json(
        { error: "Akun Anda telah dinonaktifkan. Hubungi administrator." },
        { status: 403 }
      );
    }

    // ── Verifikasi password ──
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // ── Buat JWT Token ──
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nama: user.namaLengkap,
    });

    // ── Set response dengan cookie ──
    const response = NextResponse.json({
      message: "Login berhasil!",
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        email: user.email,
        role: user.role,
      },
    });

    // Simpan token ke cookie (httpOnly = aman dari XSS)
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
