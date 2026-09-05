const { PrismaClient } = require('@prisma/client');

const local = new PrismaClient({
  datasources: {
    db: { url: 'mysql://root:arsyad050106%23@localhost:3306/db_sipkm' }
  }
});

const remote = new PrismaClient({
  datasources: {
    db: { url: 'mysql://root:xzbsgZuSpeUfzqHiJzOvtzJjZKBtoYoj@zephyr.proxy.rlwy.net:44731/railway' }
  }
});

async function main() {
  console.log("Membaca data dari database lokal...");
  
  const users = await local.user.findMany();
  const categories = await local.kategori.findMany();
  const laporan = await local.laporan.findMany();
  const topik = await local.forumTopik.findMany();
  const balasan = await local.forumBalasan.findMany();
  const notifikasi = await local.notifikasi.findMany();

  console.log(`Ditemukan: ${users.length} Users, ${categories.length} Kategori, ${laporan.length} Laporan, ${topik.length} Topik, ${notifikasi.length} Notifikasi`);
  
  console.log("Menyalin ke database remote (Railway)...");
  
  // Karena struktur Prisma, insert berurutan
  if (users.length > 0) {
    await remote.user.createMany({ data: users, skipDuplicates: true });
    console.log("✅ Users tersalin");
  }
  
  if (categories.length > 0) {
    await remote.kategori.createMany({ data: categories, skipDuplicates: true });
    console.log("✅ Kategori tersalin");
  }
  
  if (laporan.length > 0) {
    await remote.laporan.createMany({ data: laporan, skipDuplicates: true });
    console.log("✅ Laporan tersalin");
  }
  
  if (topik.length > 0) {
    await remote.forumTopik.createMany({ data: topik, skipDuplicates: true });
    console.log("✅ Topik tersalin");
  }
  
  if (balasan.length > 0) {
    await remote.forumBalasan.createMany({ data: balasan, skipDuplicates: true });
    console.log("✅ Balasan tersalin");
  }
  
  if (notifikasi.length > 0) {
    await remote.notifikasi.createMany({ data: notifikasi, skipDuplicates: true });
    console.log("✅ Notifikasi tersalin");
  }

  console.log("🎉 SEMUA DATA BERHASIL DIMIGRASIKAN KE CLOUD!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await local.$disconnect();
    await remote.$disconnect();
  });
