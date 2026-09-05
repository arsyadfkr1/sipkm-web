import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { sendStatusUpdateEmail } from "@/lib/mailer";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, catatanAdmin } = body;

    if (!id) {
      return NextResponse.json({ error: "Bad Request: id diperlukan" }, { status: 400 });
    }

    const laporanLama = await prisma.laporan.findUnique({ where: { id } });
    if (!laporanLama) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    const adminId = parseInt((session.user as any).id);

    if (catatanAdmin !== undefined && !status) {
      await prisma.laporan.update({ where: { id }, data: { catatanAdmin } });
      return NextResponse.json({ success: true });
    }

    if (status) {
      const validStatuses = ["menunggu", "diproses", "selesai"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }

      // Ambil data laporan + user untuk keperluan email
      const laporanLengkap = await prisma.laporan.findUnique({
        where: { id },
        include: { user: { select: { email: true, namaLengkap: true } } },
      });

      await prisma.laporan.update({ where: { id }, data: { status } });
      await prisma.riwayatStatus.create({
        data: {
          laporanId: id,
          statusLama: laporanLama.status,
          statusBaru: status,
          keterangan: `Status laporan diubah menjadi ${status} oleh Administrator`,
          diubahOleh: adminId,
        },
      });

      // 🔔 Buat notifikasi in-app untuk pelapor
      const pesanNotif: Record<string, string> = {
        menunggu:  `Laporan "${laporanLama.judul}" (${laporanLama.kodeLaporan}) telah diterima dan menunggu validasi dari petugas.`,
        diproses:  `Laporan "${laporanLama.judul}" (${laporanLama.kodeLaporan}) sedang diproses oleh petugas. Tim kami segera menuju lokasi kejadian.`,
        selesai:   `Laporan "${laporanLama.judul}" (${laporanLama.kodeLaporan}) telah selesai ditangani. Terima kasih atas kontribusi Anda!`,
      };
      const judulNotif: Record<string, string> = {
        menunggu:  "⏳ Laporan Diterima",
        diproses:  "🔧 Laporan Sedang Diproses",
        selesai:   "✅ Laporan Selesai Ditangani",
      };

      await prisma.notifikasi.create({
        data: {
          userId: laporanLama.userId,
          judul: judulNotif[status] ?? "📋 Status Laporan Diperbarui",
          pesan: pesanNotif[status] ?? `Status laporan Anda diperbarui menjadi: ${status}.`,
          tipe: "laporan",
          referensiId: id,
        },
      });

      // 📧 Kirim email notifikasi jika laporan tidak anonim dan ada email
      if (laporanLengkap && !laporanLama.isAnonim && laporanLengkap.user?.email) {
        try {
          await sendStatusUpdateEmail({
            toEmail: laporanLengkap.user.email,
            toName: laporanLengkap.user.namaLengkap,
            kodeLaporan: laporanLama.kodeLaporan,
            judulLaporan: laporanLama.judul,
            statusBaru: status,
            catatanAdmin: catatanAdmin || laporanLama.catatanAdmin,
          });
        } catch (emailError) {
          console.error("⚠ Gagal kirim email notifikasi:", emailError);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Tidak ada data yang diperbarui" }, { status: 400 });
  } catch (error) {
    console.error("Error admin update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE: Hapus laporan beserta semua data terkait
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const laporan = await prisma.laporan.findUnique({ where: { id } });
    if (!laporan) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    // Hapus semua data terkait dulu, baru hapus laporan
    await prisma.$transaction([
      prisma.laporanFoto.deleteMany({ where: { laporanId: id } }),
      prisma.riwayatStatus.deleteMany({ where: { laporanId: id } }),
      prisma.komentarLaporan.deleteMany({ where: { laporanId: id } }),
      prisma.laporan.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error hapus laporan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
