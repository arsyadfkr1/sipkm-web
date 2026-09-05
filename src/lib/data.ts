import type { Report } from "@/types";

export const reports: Report[] = [
  {
    id: "1",
    title: "Jalan Berlubang Parah di Jl. Jend. Sudirman",
    summary: "Kondisi lubang menganga membahayakan pengguna jalan.",
    location: "Jl. Jend. Sudirman, Bandar Lampung",
    status: "Diproses",
    date: "2026-06-28",
    imageUrl: "/images/jalan berlubang parah.jpeg",
    description: "Lubang besar di tengah badan jalan membutuhkan perbaikan segera. Lalu lintas terganggu dan banyak kendaraan harus mengurangi kecepatan.",
  },
  {
    id: "2",
    title: "Penumpukan Sampah di Pasar Kedaton",
    summary: "Tumpukan sampah menutupi trotoar dan menyebabkan bau tidak sedap.",
    location: "Pasar Kedaton, Bandar Lampung",
    status: "Diproses",
    date: "2026-06-28",
    imageUrl: "/images/penumpukan sampah liar.jpg",
    description: "Area pasar mengalami penumpukan sampah yang mengganggu aktivitas pedagang serta membahayakan kesehatan warga sekitar.",
  },
  {
    id: "3",
    title: "Tiang Listrik Roboh di Jl. Teuku Umar",
    summary: "Tiang listrik ambruk setelah hujan lebat, rawan kecelakaan.",
    location: "Jl. Teuku Umar, Bandar Lampung",
    status: "Selesai",
    date: "2026-06-28",
    imageUrl: "/images/tiang listrik roboh.jpg",
    description: "Tiang listrik yang roboh telah ditangani dan area saat ini sedang dalam pemantauan untuk memastikan keamanan jalan.",
  },
  {
    id: "4",
    title: "Saluran Drainase Tersumbat di Jl. R.A. Kartini",
    summary: "Air meluap ke jalan setelah hujan lebat akibat sumbatan sampah.",
    location: "Jl. R.A. Kartini, Bandar Lampung",
    status: "Menunggu",
    date: "2026-07-02",
    imageUrl: "/images/Drainase.jpg",
    description: "Saluran air tersumbat oleh tumpukan sampah plastik dan lumpur tebal, menyebabkan air meluap setinggi mata kaki ke badan jalan setiap terjadi hujan deras.",
  },
  {
    id: "5",
    title: "Pohon Tumbang Menghalangi Jalan Soekarno-Hatta",
    summary: "Pohon peneduh jalan roboh menghalangi jalur lambat.",
    location: "Jl. Soekarno-Hatta, Bandar Lampung",
    status: "Selesai",
    date: "2026-07-05",
    imageUrl: "/images/pohon tumbang dijalan.jpg",
    description: "Hujan disertai angin kencang menyebabkan sebuah pohon besar roboh menutupi separuh jalan. Petugas damkar dan warga telah mengevakuasi batang pohon tersebut.",
  },
  {
    id: "6",
    title: "Kebocoran Pipa Transmisi PDAM",
    summary: "Kebocoran pipa air bersih mengakibatkan jalan tergenang.",
    location: "Jl. Zaenal Abidin Pagar Alam, Bandar Lampung",
    status: "Diproses",
    date: "2026-07-10",
    imageUrl: "/images/perbaikan pipa pdam.png",
    description: "Terjadi kebocoran pipa distribusi utama PDAM Way Rilau yang menyebabkan aliran air ke rumah warga sekitar mati dan aspal di sekitar lokasi mulai retak.",
  },
  {
    id: "7",
    title: "Lampu Penerangan Jalan Umum Mati Total",
    summary: "Lampu jalan sepanjang 200 meter mati, kondisi jalan menjadi gelap.",
    location: "Jl. Sultan Agung, Bandar Lampung",
    status: "Menunggu",
    date: "2026-07-12",
    imageUrl: "/images/Lampu Jalan Mati Total.jpg",
    description: "Sejumlah lampu jalan mati total selama lebih dari seminggu. Warga mengeluhkan area sekitar yang menjadi gelap gulita saat malam hari dan rawan terjadi kecelakaan maupun tindak kejahatan.",
  },
];

export function getReportById(id: string) {
  return reports.find((report) => report.id === id);
}
