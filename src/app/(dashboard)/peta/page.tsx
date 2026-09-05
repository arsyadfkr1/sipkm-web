import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import PetaClient from "@/components/peta-client";

export default async function PetaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Ambil SEMUA laporan yang punya koordinat dari database
  const semuaLaporan = await prisma.laporan.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    include: { foto: true },
    orderBy: { createdAt: "desc" },
  });

  // Siapkan data untuk dikirim ke komponen peta
  const markers = semuaLaporan.map((l) => ({
    id: l.id,
    judul: l.judul,
    deskripsi: l.deskripsi,
    alamat: l.alamatLokasi || "Lokasi tidak diketahui",
    status: l.status,
    lat: l.latitude ? Number(l.latitude) : 0,
    lng: l.longitude ? Number(l.longitude) : 0,
    foto: l.foto.length > 0
      ? (l.foto[0].namaFile.startsWith("http")
          ? l.foto[0].namaFile
          : null)
      : null,
    tanggal: l.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Peta Sebaran Laporan</h1>
        <p className="mt-2 text-sm text-slate-400">Menampilkan {markers.length} laporan masyarakat secara geografis di Bandar Lampung.</p>
      </div>

      {/* Legenda Warna */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#0b1329]/80 px-4 py-2 text-xs text-slate-300">
          <span className="h-3 w-3 rounded-full bg-slate-400"></span> Menunggu
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#0b1329]/80 px-4 py-2 text-xs text-slate-300">
          <span className="h-3 w-3 rounded-full bg-amber-400"></span> Sedang Diproses
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#0b1329]/80 px-4 py-2 text-xs text-slate-300">
          <span className="h-3 w-3 rounded-full bg-emerald-400"></span> Selesai
        </div>
      </div>

      {/* Komponen Peta */}
      <div className="h-[70vh] w-full overflow-hidden rounded-[2rem] border border-slate-800/40 shadow-xl">
        <PetaClient markers={markers} />
      </div>
    </div>
  );
}
