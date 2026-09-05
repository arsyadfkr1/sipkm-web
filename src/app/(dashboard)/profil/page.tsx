import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfilClient from "@/components/profil-client";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = parseInt((session.user as any).id);

  // Ambil data user dari database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  // Hitung total laporan
  const totalLaporan = await prisma.laporan.count({
    where: { userId },
  });

  // Hitung aktivitas komunitas (misal: gabungan topik dan balasan forum)
  const totalTopik = await prisma.forumTopik.count({
    where: { userId },
  });

  const totalBalasan = await prisma.forumBalasan.count({
    where: { userId },
  });

  const aktivitasForum = totalTopik + totalBalasan;

  // Hitung kontribusi (misal: laporan selesai + komentar dll)
  const laporanSelesai = await prisma.laporan.count({
    where: { userId, status: "selesai" },
  });
  const kontribusi = laporanSelesai * 10 + aktivitasForum * 5; // Skor dummy untuk gamifikasi

  const stats = {
    totalLaporan,
    kontribusi,
    aktivitasForum
  };

  // Hilangkan password sebelum dikirim ke Client Component
  const { password, ...safeUser } = user;

  return (
    <ProfilClient user={safeUser} stats={stats} />
  );
}
