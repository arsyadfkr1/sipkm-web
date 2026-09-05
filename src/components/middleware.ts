import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Tentukan ke mana user dilempar jika belum login
  pages: {
    signIn: "/login",
  },
});

// Tentukan rute (halaman) mana saja yang WAJIB login
export const config = {
  matcher: [
    "/", // Diasumsikan sebagai halaman beranda/dashboard utama
    "/beranda",
    "/buat-laporan",
    "/riwayat",
    "/komunitas",
    "/notifikasi",
    "/draf",
    "/galeri",
    "/profil",
    // Catatan: Halaman /login dan /register JANGAN dimasukkan ke sini
  ],
};
