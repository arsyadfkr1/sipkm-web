import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  menunggu:     { label: "Menunggu Validasi", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  diverifikasi: { label: "Terverifikasi",     color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)" },
  diproses:     { label: "Sedang Diproses",   color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)" },
  selesai:      { label: "Selesai",           color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)" },
  ditolak:      { label: "Ditolak",           color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)" },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const laporan = await prisma.laporan.findUnique({
    where: { kodeLaporan: id },
    select: { judul: true, deskripsi: true },
  });
  if (!laporan) return { title: "Laporan Tidak Ditemukan | SIPKM" };
  return {
    title: `${laporan.judul} | SIPKM Bandar Lampung`,
    description: laporan.deskripsi.substring(0, 160),
  };
}

export default async function ReportDetailPublicPage({ params }: PageProps) {
  const { id } = await params;
  const laporan = await prisma.laporan.findUnique({
    where: { kodeLaporan: id },
    include: {
      kategori: true,
      foto: true,
      riwayatStatus: { orderBy: { createdAt: "asc" } },
      user: { select: { namaLengkap: true } },
    },
  });

  if (!laporan) notFound();

  const status = STATUS_CONFIG[laporan.status] ?? STATUS_CONFIG.menunggu;
  const pelapor = laporan.isAnonim ? "Warga Anonim" : laporan.user.namaLengkap;
  const fotoUtama = laporan.foto[0]?.namaFile ?? null;

  // Timeline milestones
  const milestones = [
    { key: "menunggu",     label: "Laporan Masuk",     icon: "📥" },
    { key: "diverifikasi", label: "Diverifikasi",       icon: "✅" },
    { key: "diproses",     label: "Sedang Diproses",    icon: "🔧" },
    { key: "selesai",      label: "Selesai",            icon: "🏁" },
  ];
  const statusOrder = ["menunggu", "diverifikasi", "diproses", "selesai"];
  const currentIdx = statusOrder.indexOf(laporan.status);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#e2e8f0", fontFamily: "Inter, sans-serif", position: "relative" }}>
      {/* Dot grid bg */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Navbar Mini */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/logo-sipkm.png" alt="SIPKM" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span style={{ fontWeight: 800, color: "white", fontSize: 16 }}>SIPKM</span>
          </Link>
          <Link href="/login" style={{ padding: "8px 20px", borderRadius: 999, border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", fontSize: 13, fontWeight: 600, textDecoration: "none", backgroundColor: "rgba(56,189,248,0.05)" }}>
            Buat Laporan
          </Link>
        </div>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Beranda</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <Link href="/login" style={{ color: "#64748b", textDecoration: "none" }}>Laporan Publik</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "#94a3b8" }}>{laporan.kodeLaporan}</span>
        </div>

        {/* Header laporan */}
        <div style={{ backgroundColor: "rgba(11,19,41,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "28px 32px", marginBottom: 24, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {/* Badge Status */}
            <div style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {status.label}
            </div>
            {/* Badge Kategori */}
            <div style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              {laporan.kategori.namaKategori}
            </div>
            <span style={{ color: "#475569", fontSize: 12, marginLeft: "auto" }}>Kode: <strong style={{ color: "#94a3b8" }}>{laporan.kodeLaporan}</strong></span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1.35, margin: "0 0 12px" }}>{laporan.judul}</h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 13, color: "#64748b" }}>
            <span>👤 {pelapor}</span>
            <span>📅 {new Date(laporan.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            {laporan.alamatLokasi && <span>📍 {laporan.alamatLokasi}</span>}
          </div>
        </div>

        {/* Konten Utama: 2 kolom */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* Kolom Kiri: Foto + Deskripsi */}
          <div style={{ display: "grid", gap: 24 }}>

            {/* Foto Bukti */}
            {fotoUtama && (
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                <img src={fotoUtama} alt={laporan.judul} style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }} />
                {laporan.foto.length > 1 && (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(laporan.foto.length - 1, 4)}, 1fr)`, gap: 4, marginTop: 4 }}>
                    {laporan.foto.slice(1, 5).map((f, i) => (
                      <img key={f.id} src={f.namaFile} alt={`Bukti ${i + 2}`} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deskripsi */}
            <div style={{ backgroundColor: "rgba(11,19,41,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px", backdropFilter: "blur(12px)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>📋 Deskripsi Lengkap</h2>
              <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 15, whiteSpace: "pre-wrap" }}>{laporan.deskripsi}</p>
            </div>

            {/* Peta Lokasi Mini */}
            {laporan.latitude && laporan.longitude && (
              <div style={{ backgroundColor: "rgba(11,19,41,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(12px)" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>🗺️ Lokasi Kejadian</h2>
                </div>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(laporan.longitude) - 0.005},${Number(laporan.latitude) - 0.005},${Number(laporan.longitude) + 0.005},${Number(laporan.latitude) + 0.005}&layer=mapnik&marker=${laporan.latitude},${laporan.longitude}`}
                  style={{ width: "100%", height: 280, border: "none", display: "block" }}
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Timeline Status */}
          <div style={{ backgroundColor: "rgba(11,19,41,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px", backdropFilter: "blur(12px)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 24px", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>📊 Progress Penanganan</h2>
            <div style={{ position: "relative" }}>
              {milestones.map((m, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const riwayat = laporan.riwayatStatus.find(r => r.statusBaru === m.key);
                return (
                  <div key={m.key} style={{ display: "flex", gap: 16, marginBottom: i < milestones.length - 1 ? 8 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: "bold", backgroundColor: done ? (active ? status.bg : "rgba(16,185,129,0.15)") : "rgba(255,255,255,0.03)", border: `2px solid ${done ? (active ? status.color : "#10b981") : "rgba(255,255,255,0.08)"}`, transition: "all 0.3s" }}>
                        {m.icon}
                      </div>
                      {i < milestones.length - 1 && (
                        <div style={{ width: 2, flexGrow: 1, minHeight: 32, backgroundColor: done && i < currentIdx ? "#10b981" : "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 8, paddingBottom: 24 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: done ? "white" : "#475569", fontSize: 14 }}>{m.label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                        {riwayat ? new Date(riwayat.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : (done ? "—" : "Belum")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catatan Admin */}
            {laporan.catatanAdmin && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, backgroundColor: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)" }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>💬 Catatan Petugas:</p>
                <p style={{ margin: 0, fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{laporan.catatanAdmin}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 40, textAlign: "center", padding: "32px", backgroundColor: "rgba(11,19,41,0.6)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: 15 }}>Punya keluhan lain tentang infrastruktur kota? Laporkan sekarang!</p>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)", color: "white", borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 0 30px rgba(56,189,248,0.2)" }}>
            + Buat Laporan Baru
          </Link>
        </div>
      </div>
    </main>
  );
}
