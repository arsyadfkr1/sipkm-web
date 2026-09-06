"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";

// Komponen untuk membuat angka beranimasi saat terlihat di layar
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTimestamp: number | null = null;
          const duration = 1500; // Durasi animasi dalam milidetik

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };

          window.requestAnimationFrame(step);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <p ref={ref} className={className}>
      {count}
    </p>
  );
}

export default function ProfilClient({ user, stats }: { user: any; stats: any }) {
  const router = useRouter();
  const { setProfileData } = useProfile();

  // State Informasi Pribadi
  const [formData, setFormData] = useState({
    name: user.namaLengkap,
    email: user.email,
    phone: user.noTelpon || "",
    address: user.alamat || "",
    region: "Kemiling, Bandar Lampung", // Default fallback
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State Ganti Password
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Tautan disalin!");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [profileImage, setProfileImage] = useState(user.fotoProfil || "/images/aku arsyad.jpg");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FUNGSI UPDATE PROFIL KE DATABASE
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", namaLengkap: formData.name }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfileData({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          address: formData.address,
        });
        alert("Profil berhasil diperbarui!");
        router.refresh();
      } else {
        alert(data.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // FUNGSI GANTI PASSWORD KE DATABASE
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordBaru !== konfirmasiPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", passwordLama, passwordBaru }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password berhasil diubah dengan aman!");
        setPasswordLama("");
        setPasswordBaru("");
        setKonfirmasiPassword("");
      } else {
        alert(data.error || "Gagal mengubah password");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat mengubah password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleShare = () => {
    const profileUrl = window.location.href;
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        setToastMsg("Tautan disalin!");
        setToastType("success");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => console.error("Gagal menyalin tautan profil:", err));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tampilkan preview instan sebelum upload selesai
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profil/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Ganti preview blob dengan URL server yang permanen
        setProfileImage(data.fotoUrl);
        URL.revokeObjectURL(previewUrl);
        setToastMsg("✅ Foto profil berhasil diperbarui!");
        setToastType("success");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        router.refresh();
      } else {
        setProfileImage(user.fotoProfil || "/images/aku arsyad.jpg");
        URL.revokeObjectURL(previewUrl);
        setToastMsg(`❌ ${data.error || "Gagal mengupload foto"}`);
        setToastType("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (error) {
      setProfileImage(user.fotoProfil || "/images/aku arsyad.jpg");
      URL.revokeObjectURL(previewUrl);
      setToastMsg("❌ Gagal terhubung ke server.");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsUploadingAvatar(false);
      // Reset input agar file yang sama bisa dipilih lagi
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Card */}
      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative h-24 w-24 shrink-0 rounded-2xl bg-slate-800 overflow-hidden">
            <Image src={profileImage} alt="Foto profil" width={96} height={96} className="object-cover h-full w-full" unoptimized />
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
            <button
              onClick={handleEditImageClick}
              disabled={isUploadingAvatar}
              title="Ubah foto profil"
              className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-70 disabled:cursor-wait"
            >
              {isUploadingAvatar ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
            </button>
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">Uploading...</span>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-xl font-bold text-white">{user.namaLengkap}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Terverifikasi
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-300">{user.role === "ADMIN" ? "Administrator Sistem" : "Warga Aktif Wilayah Kemiling"}</p>
            <div className="mt-3 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Bergabung: Jan 2023
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {user.email}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Bagikan Profil
          </button>
          {showToast && (
            <div className={`absolute top-full right-0 mt-2 z-10 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm ${toastType === "error" ? "bg-rose-500/90" : "bg-emerald-500/90"}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{toastMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-sky-500/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Laporan</p>
            <AnimatedNumber value={stats?.totalLaporan || 0} className="text-xl font-bold text-white" />
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-sky-500/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Kontribusi</p>
            <AnimatedNumber value={stats?.kontribusi || 0} className="text-xl font-bold text-white" />
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-sky-500/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-300">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Aktivitas Forum</p>
            <AnimatedNumber value={stats?.aktivitasForum || 0} className="text-xl font-bold text-white" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informasi Pribadi */}
        <div className="lg:col-span-2 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Informasi Pribadi</h3>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Alamat Email (Tidak bisa diubah)</label>
                <input type="email" disabled value={formData.email} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-400 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Wilayah Domisili</label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none"
                  >
                    <option>Kemiling, Bandar Lampung</option>
                    <option>Kedaton, Bandar Lampung</option>
                    <option>Rajabasa, Bandar Lampung</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Alamat Lengkap</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || formData.name === user.namaLengkap}
                className="rounded-xl bg-[#2563eb] disabled:bg-blue-800 disabled:text-slate-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.7)]"
              >
                {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* Pencapaian */}
        <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-300" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Pencapaian</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group flex flex-col items-center justify-center rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500/15 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_0_20px_rgba(99,102,241,0.15)] cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mb-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-xs font-bold text-white transition-colors group-hover:text-indigo-300">Warga Teladan</p>
              <p className="text-[10px] text-slate-400 mt-1">Laporan diselesaikan dalam 24 jam</p>
            </div>

            <div className="group flex flex-col items-center justify-center rounded-2xl bg-cyan-500/5 border border-cyan-500/10 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-500/15 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.15)] cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-white transition-colors group-hover:text-cyan-300">Pengeras Suara</p>
              <p className="text-[10px] text-slate-400 mt-1">Laporan terbanyak bulan ini</p>
            </div>

            <div className="group flex flex-col items-center justify-center rounded-2xl bg-slate-500/5 border border-slate-500/10 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-slate-500/15 hover:border-slate-400/50 hover:shadow-[0_0_20px_rgba(148,163,184,0.3),inset_0_0_20px_rgba(148,163,184,0.15)] cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-500/20 text-slate-300 mb-2 shadow-[0_0_15px_rgba(148,163,184,0.2)] transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-white transition-colors group-hover:text-slate-200">Ahli Komunitas</p>
              <p className="text-[10px] text-slate-400 mt-1">100+ respon di forum</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-800/40 border border-slate-700/50 p-4 text-center opacity-50 grayscale cursor-not-allowed">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700/50 text-slate-400 mb-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-xs font-bold text-white">Penjaga Kota</p>
              <p className="text-[10px] text-slate-400 mt-1">Lencana ini terkunci</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keamanan & Ganti Password (DITAMBAHKAN BARU) */}
      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-bold text-white">Keamanan Akun</h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-2xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Password Lama</label>
            <input
              type="password"
              required
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Ulangi password baru"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword || !passwordLama || !passwordBaru}
              className="rounded-xl bg-slate-700 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-600 shadow-lg"
            >
              {isUpdatingPassword ? "Memverifikasi..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-6">Aktivitas Terbaru</h3>

        <div className="space-y-6 relative before:absolute before:top-4 before:bottom-0 before:left-4 before:-ml-px before:w-0.5 before:bg-slate-700/50">
          {/* Item 1 */}
          <div className="relative flex items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 z-10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h4 className="font-semibold text-white">Laporan Diperbaiki</h4>
                <span className="text-xs text-slate-500 mt-1 sm:mt-0">2 Jam Lalu</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Laporan perbaikan lampu jalan di Jl. Beringin telah selesai dikerjakan.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="relative flex items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 z-10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h4 className="font-semibold text-white">Menanggapi Forum</h4>
                <span className="text-xs text-slate-500 mt-1 sm:mt-0">Kemarin</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Anda memberikan saran pada diskusi "Peningkatan Fasilitas Taman Kemiling".</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="relative flex items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/50 z-10">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h4 className="font-semibold text-white">Login Baru</h4>
                <span className="text-xs text-slate-500 mt-1 sm:mt-0">3 Hari Lalu</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Login berhasil dari perangkat Chrome Windows (Bandar Lampung).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
