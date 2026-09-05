"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050b14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Background ambient glow */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 500, height: 500, background: "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Dot Grid Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: 560,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <img src="/logo-sipkm.png" alt="SIPKM" style={{ width: 56, height: 56, objectFit: "contain" }} />
        </div>

        {/* 404 Number */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 8,
            background: "linear-gradient(135deg, #1e40af 0%, #38bdf8 50%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-8px",
          }}
        >
          404
        </div>

        {/* Divider */}
        <div style={{ width: 64, height: 3, background: "linear-gradient(90deg, #38bdf8, #1e40af)", borderRadius: 99, margin: "0 auto 28px" }} />

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 16px", letterSpacing: "-0.5px" }}>
          Halaman Tidak Ditemukan
        </h1>

        {/* Description */}
        <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, margin: "0 0 40px" }}>
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
          Silakan kembali ke halaman utama atau gunakan navigasi di bawah ini.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/beranda"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
              color: "white",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(56,189,248,0.25)",
              transition: "all 0.3s ease",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Halaman Depan
          </Link>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 48, color: "#475569", fontSize: 13 }}>
          SIPKM • Sistem Informasi Pelaporan Keluhan Masyarakat
        </p>
      </div>
    </div>
  );
}
