"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Helper: cek kekuatan password
function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "", width: "0%" };
  if (password.length < 6) return { label: "Terlalu pendek", color: "#ef4444", width: "25%" };
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (password.length >= 8 && score === 3) return { label: "Sangat Kuat", color: "#10b981", width: "100%" };
  if (password.length >= 8 && score >= 2) return { label: "Kuat", color: "#3b82f6", width: "75%" };
  if (password.length >= 6 && score >= 1) return { label: "Sedang", color: "#f59e0b", width: "50%" };
  return { label: "Lemah", color: "#ef4444", width: "25%" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    password: "",
    confirmPassword: "",
    noTelpon: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Nomor HP: hanya izinkan angka
    if (name === "noTelpon" && !/^[0-9]*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaLengkap.trim() || formData.namaLengkap.trim().length < 3)
      newErrors.namaLengkap = "Nama lengkap minimal 3 karakter.";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format email tidak valid.";
    if (formData.noTelpon && (formData.noTelpon.length < 9 || formData.noTelpon.length > 14))
      newErrors.noTelpon = "Nomor HP harus 9-14 digit angka.";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Kata sandi minimal 8 karakter.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Konfirmasi sandi tidak cocok.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          password: formData.password,
          noTelpon: formData.noTelpon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mendaftar");

      setSuccess(true);
      setTimeout(() => { router.push("/login"); }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 bg-white/10 rounded-full flex items-center justify-center p-3 shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Image src="/logo-sipkm.png" alt="Logo SIPKM" width={60} height={60} className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Daftar SIPKM</h1>
          <p className="text-gray-400 mt-2">Buat akun SIPKM untuk mulai melaporkan keluhan.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm text-center">Pendaftaran berhasil! Mengalihkan ke halaman login...</div>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
            <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange}
              className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${errors.namaLengkap ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-blue-500/50 focus:border-blue-500"}`}
              placeholder="Andi Supriadi" />
            {errors.namaLengkap && <p className="text-red-400 text-xs mt-1">⚠ {errors.namaLengkap}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-blue-500/50 focus:border-blue-500"}`}
              placeholder="nama@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">⚠ {errors.email}</p>}
          </div>

          {/* No HP */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">No. WhatsApp <span className="text-slate-500 font-normal">(Opsional)</span></label>
            <input type="tel" name="noTelpon" value={formData.noTelpon} onChange={handleChange} maxLength={14}
              className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${errors.noTelpon ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-blue-500/50 focus:border-blue-500"}`}
              placeholder="08123456789" />
            {errors.noTelpon && <p className="text-red-400 text-xs mt-1">⚠ {errors.noTelpon}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kata Sandi</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-blue-500/50 focus:border-blue-500"}`}
              placeholder="Min. 8 karakter" />
            {formData.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }} />
                </div>
                <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-red-400 text-xs mt-1">⚠ {errors.password}</p>}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Konfirmasi Kata Sandi</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-blue-500/50 focus:border-blue-500"}`}
              placeholder="Ulangi kata sandi" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">⚠ {errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading || success}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
