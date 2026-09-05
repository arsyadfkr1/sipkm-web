import nodemailer from "nodemailer";

// Konfigurasi transporter Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ─── Template Warna per Status ───────────────────────────────────────────────
const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; emoji: string; pesan: string }> = {
  menunggu: {
    label: "Menunggu Validasi",
    color: "#f59e0b",
    bg: "#fffbeb",
    emoji: "⏳",
    pesan: "Laporan Anda telah kami terima dan sedang menunggu verifikasi dari petugas.",
  },
  diproses: {
    label: "Sedang Diproses",
    color: "#3b82f6",
    bg: "#eff6ff",
    emoji: "🔧",
    pesan: "Laporan Anda telah diverifikasi! Tim petugas kami sedang bergerak menuju lokasi kejadian untuk menangani masalah yang Anda laporkan.",
  },
  selesai: {
    label: "Selesai Ditangani",
    color: "#10b981",
    bg: "#ecfdf5",
    emoji: "✅",
    pesan: "Kabar baik! Laporan Anda telah berhasil ditangani dan dinyatakan selesai oleh petugas. Terima kasih atas partisipasi aktif Anda dalam menjaga kota Bandar Lampung.",
  },
};

// ─── Fungsi Kirim Email Notifikasi ────────────────────────────────────────────
export async function sendStatusUpdateEmail({
  toEmail,
  toName,
  kodeLaporan,
  judulLaporan,
  statusBaru,
  catatanAdmin,
}: {
  toEmail: string;
  toName: string;
  kodeLaporan: string;
  judulLaporan: string;
  statusBaru: string;
  catatanAdmin?: string | null;
}) {
  const style = STATUS_STYLE[statusBaru] ?? STATUS_STYLE.menunggu;
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Update Status Laporan SIPKM</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">SIPKM</h1>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">Sistem Informasi Pelaporan Keluhan Masyarakat</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:${style.bg};padding:24px 40px;text-align:center;border-bottom:2px solid ${style.color}20;">
              <div style="font-size:40px;margin-bottom:8px;">${style.emoji}</div>
              <span style="display:inline-block;background:${style.color}20;color:${style.color};padding:6px 20px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.5px;border:1px solid ${style.color}40;">
                ${style.label}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#0f172a;">Halo, <strong>${toName}</strong>!</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                ${style.pesan}
              </p>

              <!-- Info Laporan -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Detail Laporan</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748b;width:120px;">Kode Laporan</td>
                    <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:600;">${kodeLaporan}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748b;">Judul</td>
                    <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:600;">${judulLaporan}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748b;">Status Terkini</td>
                    <td style="padding:5px 0;"><span style="color:${style.color};font-weight:700;font-size:13px;">${style.label}</span></td>
                  </tr>
                </table>
              </div>

              <!-- Catatan Admin jika ada -->
              ${catatanAdmin ? `
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">💬 Catatan dari Petugas</p>
                <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">${catatanAdmin}</p>
              </div>
              ` : ""}

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${appUrl}/laporan/${kodeLaporan}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
                  Pantau Status Laporan →
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
                Atau salin link ini ke browser Anda:<br/>
                <a href="${appUrl}/laporan/${kodeLaporan}" style="color:#3b82f6;font-size:12px;">${appUrl}/laporan/${kodeLaporan}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Email ini dikirim otomatis oleh sistem SIPKM Bandar Lampung.</p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">Dikembangkan untuk keperluan penelitian & skripsi.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"SIPKM Bandar Lampung" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${style.emoji} [SIPKM] Status Laporan "${judulLaporan}" — ${style.label}`,
    html: htmlBody,
  });
}
