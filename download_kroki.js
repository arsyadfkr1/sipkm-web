const fs = require('fs');
const https = require('https');
const zlib = require('zlib');

const activity_code = `flowchart TD
    Start((Mulai)) --> BukaAplikasi[Membuka Aplikasi SIPKM]
    BukaAplikasi --> CekLogin{Sudah Login?}
    CekLogin -- Belum --> HalamanLogin[Melakukan Login] --> Dashboard
    CekLogin -- Sudah --> Dashboard[Menampilkan Halaman Dashboard]
    Dashboard --> KlikMenu[Klik Menu Buat Laporan]
    KlikMenu --> IsiForm[Mengisi Form dan Lokasi]
    IsiForm --> Upload[Mengunggah Foto]
    Upload --> Submit[Klik Kirim Laporan]
    Submit --> CekKoneksi{Internet Aktif?}
    
    CekKoneksi -- Tidak --> Offline[Simpan Draft Lokal] --> Selesai((Selesai))
    
    CekKoneksi -- Ya --> Validasi{Data Valid?}
    Validasi -- Tidak --> TampilError[Tampil Error] --> IsiForm
    Validasi -- Ya --> SimpanDB[Simpan ke Database]
    SimpanDB --> TampilSukses[Tampil Sukses]
    TampilSukses --> Selesai((Selesai))`;

const data = Buffer.from(activity_code, 'utf8');
const compressed = zlib.deflateSync(data);
const base64Str = compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
const url = 'https://kroki.io/mermaid/png/' + base64Str;

https.get(url, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('activity_diagram.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log("Berhasil mengunduh activity_diagram.png dengan Kroki!");
    });
  } else {
    console.log("Gagal, status: " + res.statusCode);
  }
}).on('error', (e) => {
  console.log("Error: " + e.message);
});
