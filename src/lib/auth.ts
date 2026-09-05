// src/lib/auth.ts
// Helper fungsi autentikasi: hash, verify, JWT

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sipkm-jwt-secret-2025"
);

// ── Hash password dengan bcrypt ──
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ── Verifikasi password ──
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Buat JWT Token ──
export async function createToken(payload: {
  userId: number;
  email: string;
  role: string;
  nama: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token berlaku 7 hari
    .sign(JWT_SECRET);
}

// ── Verifikasi JWT Token ──
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: number;
      email: string;
      role: string;
      nama: string;
    };
  } catch {
    return null;
  }
}

// ── Nama cookie untuk session ──
export const SESSION_COOKIE = "sipkm_session";
