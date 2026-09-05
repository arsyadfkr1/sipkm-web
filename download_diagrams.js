const fs = require('fs');
const https = require('https');

const activity_code = `flowchart TD
    Start((Mulai)) --> BukaAplikasi[Membuka Aplikasi SIPKM]
    BukaAplikasi --> CekLogin{Sudah Login?}
    CekLogin -- Belum --> HalamanLogin[Melakukan Login] --> Dashboard
    CekLogin -- Sudah --> Dashboard[Menampilkan Halaman Dashboard]
    Dashboard --> KlikMenu[Klik Menu Buat Laporan]
    KlikMenu --> IsiForm[Mengisi Judul Kategori dan Deskripsi]
    IsiForm --> PilihPeta[Menentukan Titik Lokasi di Peta WebGIS]
    PilihPeta --> Upload[Mengunggah Foto Kejadian]
    Upload --> Submit[Menekan Tombol Kirim Laporan]
    Submit --> CekKoneksi{Koneksi Internet Aktif?}
    
    CekKoneksi -- Tidak --> Offline[Menyimpan ke Draft Lokal] --> Selesai((Selesai))
    
    CekKoneksi -- Ya --> Validasi{Data Valid?}
    Validasi -- Tidak --> TampilError[Menampilkan Pesan Error] --> IsiForm
    Validasi -- Ya --> SimpanDB[Menyimpan Data Laporan ke Database]
    SimpanDB --> TampilSukses[Menampilkan Pesan Berhasil]
    TampilSukses --> Selesai((Selesai))`;

function downloadWithRetry(retries) {
  const state = { code: activity_code, mermaid: { theme: 'default' } };
  const jsonStr = JSON.stringify(state);
  const b64 = Buffer.from(jsonStr).toString('base64');
  const url = 'https://mermaid.ink/img/' + b64;
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream('activity_diagram.png');
      res.pipe(file);
      file.on('finish', () => console.log("Berhasil mengunduh: activity_diagram.png"));
    } else {
      console.log("Gagal, status: " + res.statusCode);
      if (retries > 0) setTimeout(() => downloadWithRetry(retries - 1), 2000);
    }
  }).on('error', (e) => {
    console.log("Error: " + e.message);
  });
}

downloadWithRetry(3);
