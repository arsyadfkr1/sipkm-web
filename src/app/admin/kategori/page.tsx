import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminKategoriClient from "@/components/admin-kategori-client";

export default async function AdminKategoriPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const kategoriDb = await prisma.kategori.findMany({
    orderBy: { namaKategori: "asc" },
    include: { _count: { select: { laporan: true } } },
  });

  const kategoriList = kategoriDb.map((k) => ({
    id: k.id,
    namaKategori: k.namaKategori,
    jumlahLaporan: k._count.laporan,
  }));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Kelola Kategori</h1>
        <p className="mt-2 text-slate-400">Tambah atau hapus kategori laporan masyarakat.</p>
      </div>
      <AdminKategoriClient initialKategori={kategoriList} />
    </>
  );
}
