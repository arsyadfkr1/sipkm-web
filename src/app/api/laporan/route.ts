import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const formData = await req.formData();

    const judul = formData.get("title") as string;
    const deskripsi = formData.get("description") as string;
    const kategoriNama = formData.get("category") as string;
    const alamatLokasi = formData.get("address") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;
    const isAnonim = formData.get("isAnonim") === "true";

    if (!judul || !deskripsi || !kategoriNama || !alamatLokasi || !latStr || !lngStr) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // Cari atau buat kategori
    let kategori = await prisma.kategori.findFirst({
      where: { namaKategori: kategoriNama }
    });

    if (!kategori) {
      kategori = await prisma.kategori.create({
        data: {
          namaKategori: kategoriNama,
          warna: "#3b82f6"
        }
      });
    }

    // Generate kode laporan unik
    const kodeLaporan = `LP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // Buat laporan di database
    const laporan = await prisma.laporan.create({
      data: {
        kodeLaporan,
        userId,
        kategoriId: kategori.id,
        judul,
        deskripsi,
        alamatLokasi,
        latitude: parseFloat(latStr),
        longitude: parseFloat(lngStr),
        isAnonim,
        status: "menunggu",
        tingkatUrgensi: "sedang"
      }
    });

    // ✅ Handle upload foto ke Cloudinary
    const files = formData.getAll("files") as File[];
    const fotoData = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload ke Cloudinary menggunakan upload_stream
        const cloudinaryUrl: string = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "sipkm-laporan", // Folder di Cloudinary
              public_id: `laporan-${laporan.id}-${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          );
          uploadStream.end(buffer);
        });

        fotoData.push({
          laporanId: laporan.id,
          namaFile: cloudinaryUrl, // Simpan URL Cloudinary ke kolom namaFile
          tipe: "sebelum" as const
        });
      }
    }

    // Simpan data foto ke database jika ada
    if (fotoData.length > 0) {
      await prisma.laporanFoto.createMany({
        data: fotoData as any
      });
    }

    // Buat riwayat status awal
    await prisma.riwayatStatus.create({
      data: {
        laporanId: laporan.id,
        statusLama: null,
        statusBaru: "menunggu",
        keterangan: "Laporan baru diterima oleh sistem",
        diubahOleh: userId
      }
    });

    return NextResponse.json({ success: true, laporanId: laporan.id });
  } catch (error: any) {
    console.error("Error submit laporan:", error);
    return NextResponse.json({ error: "Gagal menyimpan laporan" }, { status: 500 });
  }
}
