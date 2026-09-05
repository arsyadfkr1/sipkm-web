"use client";

import { useEffect, useState } from "react";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(true); // Default true agar tidak berkedip di awal
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Deteksi apakah perangkat adalah iOS (iPhone/iPad)
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Cek apakah aplikasi sudah diinstal (berjalan di mode standalone PWA)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Jika tidak, tampilkan tombol
    setIsInstalled(false);

    // Tangkap event PWA prompt standar (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Mencegah prompt otomatis muncul
      setDeferredPrompt(e); // Simpan event untuk dipanggil saat tombol diklik
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Tampilkan popup instalasi (Android/Desktop)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Panduan manual untuk pengguna iPhone/Safari
      alert(
        "Untuk menginstall di iPhone/iPad:\n1. Tekan tombol 'Share' (Bagikan) di bawah layar browser.\n2. Pilih 'Add to Home Screen' (Tambahkan ke Layar Utama)."
      );
    } else {
      alert("Browser Anda belum mendukung instalasi PWA langsung, atau Anda sudah menginstallnya.");
    }
  };

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="mb-4 flex w-full items-center gap-4 rounded-[2rem] border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-4 py-3 text-left transition-all duration-300 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] text-amber-400 group"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </span>
      <div>
        <span className="block font-bold text-[14px]">Install SIPKM</span>
        <span className="block text-[11px] text-amber-500/70">Pasang di layar HP Anda</span>
      </div>
    </button>
  );
}
