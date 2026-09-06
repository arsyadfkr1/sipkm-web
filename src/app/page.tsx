"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// Komponen Angka Animasi (CountUp)
const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;
    
    // Jika angkanya kecil (< 20), durasinya dicepatkan jadi 0.6 detik agar berputar ngebut
    const duration = value < 20 ? 600 : 1500; 

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    
    // Mulai animasi
    animationFrameId = window.requestAnimationFrame(step);

    // Cleanup untuk mencegah animasi bertabrakan
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{count}{suffix}</>;
};

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // State awal diubah ke 0 agar selaras dengan animasi penghitungan
  const [stats, setStats] = useState({
    totalSelesai: 0,
    totalKategori: 0,
    marqueeText: "🚀 UPDATE: Selamat Datang di SIPKM Bandar Lampung • 📍 Fitur WebGIS Pemetaan Lokasi Laporan Kini Tersedia"
  });

  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/public/laporan-terbaru")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentReports(data);
        }
      })
      .catch(err => console.error("Error fetching recent reports:", err));
  }, []);

  useEffect(() => {
    // Redirect if authenticated
    if (!isLoading && isAuthenticated) {
      window.location.href = "/beranda";
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Fetch live stats from database
    fetch("/api/public/stats")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
           let marquee = "📍 Fitur WebGIS Pemetaan Lokasi Laporan Kini Tersedia";
           
           if (data.latestSelesai && data.latestSelesai.length > 0) {
             marquee += ` • ✅ ${data.latestSelesai.map((l:any) => l.judul + " telah Selesai diperbaiki").join(" • ✅ ")}`;
           }
           if (data.latestDiproses && data.latestDiproses.length > 0) {
             marquee += ` • ⚡ ${data.latestDiproses.map((l:any) => l.judul + " sedang Diproses tim lapangan").join(" • ⚡ ")}`;
           }

           setStats({
             totalSelesai: data.totalSelesai || 0,
             totalKategori: data.totalKategori || 5,
             marqueeText: marquee
           });
        }
      })
      .catch(console.error);
  }, []);

  // Animasi Scroll (Intersection Observer)
  useEffect(() => {
    // Jangan jalankan observer jika halaman masih dalam state loading spinner
    if (isLoading) return;

    // Beri jeda sedikit agar React selesai menggambar DOM aslinya
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Hentikan pantauan setelah animasi berjalan 1x
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.10, rootMargin: "0px 0px -20px 0px" });

      const elements = document.querySelectorAll(".reveal");
      elements.forEach((el) => observer.observe(el));

      // Cleanup
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeout);
  }, [isLoading]); // Bergantung pada perubahan status loading

  if (isLoading) {
    return (
      <main style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#030712" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #1e293b", borderTopColor: "#0ea5e9", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 14, color: "#64748b" }}>Memuat...</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return (
      <main style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#030712" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #1e293b", borderTopColor: "#0ea5e9", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 14, color: "#64748b" }}>Mengalihkan...</p>
        </div>
      </main>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes floatDelay { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes ticker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        
        /* Animasi Scroll Reveal */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }
        
        /* --- KODE RESPONSIVITAS HP (MOBILE) --- */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .nav-container { padding: 0 16px !important; }
          
          /* Hero Section */
          .hero-container { padding: 120px 20px 40px !important; gap: 40px !important; flex-direction: column !important; align-items: center !important; }
          .hero-text-col { text-align: center !important; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
          .hero-badge { font-size: 11px !important; padding: 6px 12px !important; text-align: center; margin-bottom: 24px !important; }
          .hero-badge span { white-space: normal !important; line-height: 1.4; }
          .hero-title { font-size: 34px !important; line-height: 1.2 !important; margin-bottom: 16px !important; letter-spacing: -0.5px !important; }
          .hero-desc { font-size: 15px !important; margin-bottom: 32px !important; padding: 0 10px; max-width: 100% !important; }
          .hero-buttons { flex-direction: column !important; width: 100%; max-width: 320px; gap: 12px !important; margin-left: auto; margin-right: auto; }
          .btn-hero, .link-hero { width: 100% !important; justify-content: center !important; box-sizing: border-box; }
          
          /* Stats Box */
          .stats-box { flex-direction: row !important; justify-content: center !important; gap: 20px !important; flex-wrap: wrap; padding: 16px !important; }
          .stats-box > div > div:first-child { font-size: 22px !important; }
          
          /* Mock Dashboard */
          .mock-dash-wrapper { min-height: auto !important; margin-top: 0 !important; width: 100%; }
          .mock-dash-wrapper > div:first-child { transform: scale(0.9); transform-origin: top center; margin-bottom: -10%; }
          .floating-card-1 { right: 0 !important; top: -15px !important; transform: scale(0.85); }
          .floating-card-2 { left: 0 !important; bottom: 30px !important; transform: scale(0.85); }
          
          /* Sections */
          .section-pad { padding: 40px 20px 60px !important; }
          .section-title { font-size: 28px !important; }
          .feature-card { padding: 24px !important; }
          
          /* CTA */
          .cta-wrapper { padding: 40px 20px !important; border-radius: 24px !important; }
          .cta-title { font-size: 26px !important; }
          .btn-cta { padding: 16px 32px !important; font-size: 15px !important; width: 100%; }
        }
        
        /* Animasi kilap untuk tombol utama */
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-15deg); }
          20%, 100% { transform: translateX(250%) skewX(-15deg); }
        }
        
        /* CSS Tambahan untuk Navbar Hover */
        .nav-link {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }
        .nav-link:hover {
          color: #38bdf8;
        }
        
        .nav-btn {
          background-color: white;
          color: #0b1329;
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }
        .nav-btn:hover {
          background-color: #f1f5f9;
          transform: scale(1.05);
        }

        /* Tombol Utama (Hero) */
        .btn-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          color: white;
          padding: 15px 32px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 30px -10px rgba(14,165,233,0.6);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-hero:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(14,165,233,0.9);
        }
        .btn-hero::after {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 40%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-150%) skewX(-15deg);
          animation: shine 3s infinite;
        }

        /* Link Sekunder */
        .link-hero {
          color: #94a3b8;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 0;
          transition: all 0.2s ease;
        }
        .link-hero:hover {
          color: #38bdf8;
          transform: translateX(6px);
        }

        /* Efek Kaca (Glassmorphism) & 3D Hover */
        .mock-dashboard-glass {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 40px 80px -20px rgba(0,0,0,0.8);
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .mock-dashboard-glass:hover {
          transform: perspective(1000px) rotateX(4deg) rotateY(-6deg) scale(1.03);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 30px 50px 80px -20px rgba(14,165,233,0.25);
          border-color: rgba(14, 165, 233, 0.4);
        }

        .floating-glass {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6)) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 20px 40px rgba(0,0,0,0.5) !important;
        }

        /* Kartu Fitur Unggulan (Glass) */
        .feature-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 28px;
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: var(--card-color, #38bdf8);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s ease;
        }
        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 30px 60px -15px rgba(0,0,0,0.7);
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
        }
        .feature-card:hover::before {
          transform: scaleX(1);
        }
        .feature-card:hover .card-icon {
          transform: scale(1.15) rotate(-8deg);
        }
        .card-icon {
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Kartu Cara Kerja (Glass) */
        .step-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4)) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .step-card:hover {
          transform: translateY(-10px) scale(1.03);
          border-color: var(--step-color) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 40px -10px var(--step-color);
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.7)) !important;
        }
        .step-num {
          transition: all 0.4s ease;
        }
        .step-card:hover .step-num {
          background-color: var(--step-color) !important;
          color: white !important;
          transform: scale(1.15) rotate(10deg);
        }
        .step-emoji {
          display: inline-block;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .step-card:hover .step-emoji {
          transform: scale(1.2) translateY(-4px);
        }

        /* CTA Glass */
        .cta-glass {
          background: linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.5)) !important;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.15) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 40px 80px -20px rgba(0,0,0,0.6);
        }

        /* Tombol CTA Bawah */
        .btn-cta {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          color: white;
          padding: 18px 48px;
          border-radius: 999px;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 30px -10px rgba(14,165,233,0.6);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-cta:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 20px 40px -10px rgba(14,165,233,0.9);
        }
        .btn-cta::after {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 40%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-150%) skewX(-15deg);
          animation: shine 3s infinite;
          animation-delay: 1.5s;
        }
      `}</style>

      {/* Glow Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", backgroundColor: "rgba(37,99,235,0.15)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", backgroundColor: "rgba(14,165,233,0.08)", filter: "blur(150px)" }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "rgba(11,19,41,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="nav-container" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Logo Asli */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo-sipkm.png" alt="Logo SIPKM" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <div className="desktop-only">
              <div style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>SIPKM</div>
              <div style={{ fontSize: 9, color: "#7dd3fc", fontWeight: 500, letterSpacing: "0.5px", marginTop: 2 }}>BANDAR LAMPUNG</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 20, marginRight: 10 }}>
              <a href="#tentang" className="nav-link">Tentang</a>
              <a href="#fitur" className="nav-link">Fitur</a>
              <a href="#cara-kerja" className="nav-link">Cara Kerja</a>
              <a href="#faq" className="nav-link">Bantuan</a>
              {/* Divider Vertikal */}
              <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.2)", marginLeft: 4, marginRight: -2 }} />
            </div>
            <Link href="/login" className="nav-link">Masuk</Link>
            <Link href="/register" className="nav-btn">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Kiri Kanan dengan Background Peta */}
      <div className="hero-container" style={{ position: "relative", zIndex: 10, width: "100%", overflow: "hidden" }}>
        
        {/* Latar Belakang Pola Koordinat Pemetaan (Dot Grid) */}
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          zIndex: 0, 
          backgroundColor: "#0b1329",
          backgroundImage: "radial-gradient(rgba(56, 189, 248, 0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px"
        }} />
        {/* Gradient Overlay: Menciptakan kesan fokus cahaya di belakang Dashboard */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(circle at 75% 50%, rgba(14,165,233,0.1) 0%, rgba(11,19,41,0.9) 65%, #0b1329 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(0deg, #0b1329 0%, rgba(11,19,41,0) 15%)" }} />

        {/* Kontainer Utama 2 Kolom */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "160px 32px 80px", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap" }}>
          
          {/* KOLOM KIRI - Teks */}
          <div className="reveal hero-text-col" style={{ flex: "1 1 420px", maxWidth: 560 }}>
            <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "8px 16px", marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#38bdf8", display: "inline-block", animation: "pulse 2s ease-in-out infinite", flexShrink: 0 }}></span>
              <span style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 500 }}>Pelaporan Keluhan Masyarakat</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: 52, fontWeight: 900, color: "white", lineHeight: 1.15, margin: "0 0 24px" }}>
              Selamat Datang di<br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Platform SIPKM
              </span>
            </h1>

            <p className="hero-desc" style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.8, marginBottom: 36, margin: "0 0 36px" }}>
              Sistem Informasi Pelaporan Keluhan Masyarakat (SIPKM) Kota Bandar Lampung. Prototipe platform digital untuk melaporkan masalah infrastruktur dan fasilitas umum secara terintegrasi WebGIS.
            </p>

            <div className="hero-buttons" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
              <Link href="/login" className="btn-hero">
                🚀 Lapor Sekarang
              </Link>
              <a href="#cara-kerja" className="link-hero">
                Lihat Cara Kerja →
              </a>
            </div>

            {/* Stats Dirapikan */}
            <div className="stats-box" style={{ display: "flex", gap: 32, borderTop: "1px solid rgba(51,65,85,0.8)", paddingTop: 24, maxWidth: 450 }}>
              <div style={{ animation: "floatDelay 1s ease-out" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
                  <AnimatedNumber value={stats.totalSelesai} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Laporan Selesai</div>
              </div>
              <div style={{ width: 1, backgroundColor: "rgba(51,65,85,0.8)" }}></div>
              <div style={{ animation: "floatDelay 1.2s ease-out" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
                  <AnimatedNumber value={stats.totalKategori} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Kategori</div>
              </div>
              <div style={{ width: 1, backgroundColor: "rgba(51,65,85,0.8)" }}></div>
              <div style={{ animation: "floatDelay 1.4s ease-out" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>24/7</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Aktif & Siap</div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN - Mock Dashboard */}
          <div className="reveal delay-200 mock-dash-wrapper" style={{ flex: "1 1 420px", position: "relative", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* Wrapper Animasi Float agar tidak bentrok dengan Hover 3D */}
            <div style={{ animation: "float 5s ease-in-out infinite", width: "100%", maxWidth: 460 }}>
              {/* Kartu Dashboard Utama */}
              <div className="mock-dashboard-glass" style={{ width: "100%", borderRadius: 24, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>📊 Dashboard Laporan</span>
                  <span style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#4ade80", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>● Live</span>
                </div>

                <div style={{ width: "100%", height: 180, borderRadius: 16, background: "linear-gradient(135deg, #0f2952, #0c1f3f)", position: "relative", overflow: "hidden", marginBottom: 16 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${25 * (i+1)}%`, height: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />
                  ))}
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${25 * (i+1)}%`, width: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />
                  ))}
                  {[
                    { top: "25%", left: "30%", color: "#ef4444" },
                    { top: "55%", left: "60%", color: "#f59e0b" },
                    { top: "40%", left: "75%", color: "#22c55e" },
                    { top: "65%", left: "20%", color: "#ef4444" },
                  ].map((pin, i) => (
                    <div key={i} style={{ position: "absolute", top: pin.top, left: pin.left, transform: "translate(-50%, -100%)" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: pin.color, boxShadow: `0 0 8px ${pin.color}`, border: "2px solid white" }} />
                    </div>
                  ))}
                  <div style={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(11,19,41,0.8)", borderRadius: 8, padding: "4px 8px" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Bandar Lampung</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { title: "Jalan Berlubang Jl. Teuku Cik Ditiro", status: "Selesai", statusColor: "#22c55e", statusBg: "rgba(34,197,94,0.1)" },
                    { title: "Lampu Taman Langkapura Mati", status: "Diproses", statusColor: "#f59e0b", statusBg: "rgba(245,158,11,0.1)" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px" }}>
                      <div>
                        <p style={{ color: "white", fontSize: 12, fontWeight: 600, margin: 0 }}>{item.title}</p>
                        <p style={{ color: "#64748b", fontSize: 11, margin: "2px 0 0" }}>2 jam lalu</p>
                      </div>
                      <span style={{ backgroundColor: item.statusBg, color: item.statusColor, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="floating-card-1 floating-glass" style={{
              position: "absolute", top: -10, right: 10, zIndex: 20,
              borderRadius: 16, padding: "12px 16px",
              animation: "floatDelay 4s ease-in-out infinite",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✅</div>
              <div>
                <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: 0 }}>Laporan Selesai!</p>
                <p style={{ color: "#64748b", fontSize: 11, margin: "2px 0 0" }}>Drainase diperbaiki</p>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="floating-card-2 floating-glass" style={{
              position: "absolute", bottom: 30, left: -10, zIndex: 20,
              borderRadius: 16, padding: "12px 16px",
              animation: "float 6s ease-in-out infinite 1s",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(14,165,233,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📍</div>
              <div>
                <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: 0 }}>Lokasi Terdeteksi</p>
                <p style={{ color: "#64748b", fontSize: 11, margin: "2px 0 0" }}>WebGIS Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TENTANG KAMI SECTION */}
      <section id="tentang" className="section-pad" style={{ padding: "80px 32px", position: "relative", zIndex: 10, backgroundColor: "rgba(11, 19, 41, 0.5)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center" }}>
          
          {/* Kolom Kiri - Teks Deskripsi */}
          <div className="reveal" style={{ flex: "1 1 500px" }}>
            <div style={{ display: "inline-block", color: "#38bdf8", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, backgroundColor: "rgba(56,189,248,0.1)", padding: "4px 12px", borderRadius: 999 }}>
              Tentang Kami
            </div>
            <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, color: "white", lineHeight: 1.25, margin: "0 0 24px" }}>
              Inovasi Pelayanan Publik <br className="desktop-only" /> Berbasis Tata Ruang Digital
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              Sistem Informasi Pelaporan Keluhan Masyarakat (SIPKM) dikembangkan sebagai <strong>purwarupa (prototipe) usulan</strong> yang dirancang untuk memfasilitasi pelaporan keluhan fasilitas umum. Sistem ini dibangun dengan keyakinan bahwa kota yang maju berawal dari partisipasi aktif warganya.
            </p>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.8 }}>
              Melalui pemanfaatan teknologi <strong>WebGIS (Sistem Informasi Geografis Berbasis Web)</strong>, sistem ini menyimulasikan pemetaan laporan infrastruktur dengan akurasi spasial. Model pendekatan ini diharapkan dapat menjadi referensi inovasi untuk pelacakan dan penanganan masalah secara tepat sasaran.
            </p>
          </div>

          {/* Kolom Kanan - Poin Penting */}
          <div className="reveal delay-200" style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Transparansi Penuh", desc: "Pantau status laporan secara real-time dari awal diproses hingga selesai.", icon: "🔍" },
              { title: "Akurasi Lokasi", desc: "Pemetaan otomatis menggunakan koordinat satelit (GIS) yang presisi.", icon: "📍" },
              { title: "Respons Cepat", desc: "Laporan diverifikasi dan diteruskan langsung ke instansi terkait.", icon: "⚡" }
            ].map((item, i) => (
              <div key={i} className="step-card" style={{ padding: "20px 24px", borderRadius: 16, display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{item.title}</h4>
                  <p style={{ color: "#94a3b8", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Fitur Unggulan Section */}
      <div id="fitur" className="section-pad" style={{ position: "relative", zIndex: 10, padding: "40px 32px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-block", backgroundColor: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 999, padding: "6px 18px", marginBottom: 16 }}>
              <span style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 600 }}>✨ Mengapa SIPKM?</span>
            </div>
            <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 16px" }}>Fitur Unggulan Kami</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Dirancang khusus untuk memudahkan warga dan mempercepat respons pemerintah.
            </p>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { emoji: "🗺️", title: "Peta Interaktif (WebGIS)", desc: "Tandai lokasi keluhan secara akurat langsung di peta wilayah Bandar Lampung.", color: "#3b82f6" },
              { emoji: "⚡", title: "Respon Cepat & Transparan", desc: "Laporan langsung terhubung ke dinas terkait. Pantau status penanganan secara real-time.", color: "#f59e0b" },
              { emoji: "🔒", title: "Privasi Terjaga", desc: "Tersedia opsi laporan anonim untuk warga. Keamanan data Anda adalah prioritas kami.", color: "#22c55e" },
              { emoji: "📸", title: "Upload Foto Bukti", desc: "Sertakan foto kondisi lapangan sebagai bukti nyata untuk mempercepat proses verifikasi.", color: "#a855f7" },
              { emoji: "📊", title: "Statistik & Laporan", desc: "Admin dapat memantau grafik dan statistik laporan per wilayah untuk pengambilan keputusan.", color: "#0ea5e9" },
              { emoji: "📱", title: "Akses dari Mana Saja", desc: "Tampilan responsif yang nyaman diakses dari HP maupun komputer.", color: "#ec4899" },
            ].map((fitur, i) => (
              <div key={i} className={`feature-card reveal delay-${((i % 3) + 1) * 100}`} style={{ flex: "1 1 300px", "--card-color": fitur.color } as React.CSSProperties}>
                <div className="card-icon" style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: `${fitur.color}20`, border: `1px solid ${fitur.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                  {fitur.emoji}
                </div>
                <h3 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: "0 0 10px" }}>{fitur.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{fitur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cara Kerja Section */}
      <div id="cara-kerja" className="section-pad" style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(51,65,85,0.6)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 16px" }}>Tiga Langkah Mudah Melapor</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>Proses yang simpel agar masalah Anda segera ditangani.</p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { num: "1", title: "Tulis Laporan", desc: "Jelaskan keluhan Anda dan sertakan foto bukti kerusakan.", color: "#3b82f6", emoji: "📝" },
              { num: "2", title: "Tandai Lokasi", desc: "Sistem WebGIS otomatis mendeteksi lokasi keluhan di peta.", color: "#0ea5e9", emoji: "🗺️" },
              { num: "3", title: "Pantau Status", desc: "Laporan masuk ke dinas. Pantau status penyelesaiannya.", color: "#22c55e", emoji: "📊" },
            ].map((step, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div className={`step-card reveal delay-${(i + 1) * 100}`} style={{ flex: "1 1 250px", maxWidth: 280, backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.8)", borderRadius: 24, padding: 32, textAlign: "center", "--step-color": step.color } as React.CSSProperties}>
                  <div className="step-emoji" style={{ fontSize: 32, marginBottom: 16 }}>{step.emoji}</div>
                  <div className="step-num" style={{ width: 48, height: 48, borderRadius: 14, margin: "0 auto 20px", backgroundColor: `${step.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: step.color }}>{step.num}</div>
                  <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{step.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
                {/* Panah Pemisah */}
                {i < 2 && (
                  <div className={`reveal delay-${(i + 2) * 100} desktop-only`} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", padding: "0 10px", animation: "pulse 2s infinite" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 40, height: 40 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Laporan Terkini Section */}
      <section id="feed-laporan" className="section-pad" style={{ position: "relative", zIndex: 10, padding: "80px 32px", backgroundColor: "#050b14" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
            <div>
              <div style={{ display: "inline-block", color: "#38bdf8", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, backgroundColor: "rgba(56,189,248,0.1)", padding: "4px 12px", borderRadius: 999 }}>
                Transparansi Publik
              </div>
              <h2 className="section-title" style={{ fontSize: 32, fontWeight: 800, color: "white", margin: "0 0 8px" }}>Feed Laporan Terkini</h2>
              <p style={{ color: "#94a3b8", fontSize: 16 }}>Pantau langsung keluhan warga yang masuk secara real-time ke sistem SIPKM.</p>
            </div>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, color: "white", fontSize: 14, fontWeight: 600, transition: "all 0.3s ease" }} className="hover:bg-white/10 hover:border-white/20">
              Lihat Semua Laporan
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          <div className="reveal delay-200" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {recentReports.length > 0 ? (
              recentReports.map((laporan) => (
                <div key={laporan.id} style={{ backgroundColor: "rgba(11,19,41,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 24, backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", transition: "transform 0.3s ease", cursor: "default" }} className="hover:-translate-y-2 hover:border-rose-500/30">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyItems: "center", fontSize: 16 }}>
                        {laporan.kategori?.ikon || "📌"}
                      </div>
                      <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{laporan.kategori?.namaKategori || "Umum"}</span>
                    </div>
                    
                    {/* Status Badge */}
                    <div style={{ 
                      padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                      backgroundColor: laporan.status === "selesai" ? "rgba(16,185,129,0.1)" : laporan.status === "diproses" ? "rgba(56,189,248,0.1)" : "rgba(245,158,11,0.1)",
                      color: laporan.status === "selesai" ? "#34d399" : laporan.status === "diproses" ? "#7dd3fc" : "#fbbf24",
                      border: `1px solid ${laporan.status === "selesai" ? "rgba(16,185,129,0.2)" : laporan.status === "diproses" ? "rgba(56,189,248,0.2)" : "rgba(245,158,11,0.2)"}`
                    }}>
                      {laporan.status.toUpperCase()}
                    </div>
                  </div>

                  <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{laporan.judul}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 20, flexGrow: 1 }}>{laporan.deskripsiSingkat}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 10, fontWeight: "bold" }}>
                        {laporan.pelapor.charAt(0)}
                      </div>
                      <span style={{ color: "#cbd5e1", fontSize: 13 }}>{laporan.pelapor}</span>
                    </div>
                    <span style={{ color: "#64748b", fontSize: 12 }}>
                      {new Date(laporan.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Skeleton loading
              [1, 2, 3].map((i) => (
                <div key={i} style={{ backgroundColor: "rgba(11,19,41,0.4)", border: "1px solid rgba(255,255,255,0.02)", borderRadius: 24, padding: 24, height: 250, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
                  <div style={{ width: "30%", height: 32, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 24 }}></div>
                  <div style={{ width: "80%", height: 24, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 12 }}></div>
                  <div style={{ width: "100%", height: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8 }}></div>
                  <div style={{ width: "60%", height: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4 }}></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-pad" style={{ position: "relative", zIndex: 10, padding: "80px 32px", backgroundColor: "rgba(11, 19, 41, 0.3)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 80 }}>
        <style>{`
          .faq-details {
            background-color: rgba(11,19,41,0.6);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 20px 24px;
            backdrop-filter: blur(12px);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .faq-details:hover {
            background-color: rgba(11,19,41,0.8);
            border-color: rgba(56,189,248,0.3);
          }
          .faq-details summary {
            color: white;
            font-size: 16px;
            font-weight: 600;
            outline: none;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .faq-details summary::-webkit-details-marker {
            display: none;
          }
          .faq-details[open] summary .faq-icon {
            transform: rotate(180deg);
            color: #38bdf8;
          }
          .faq-icon {
            transition: transform 0.3s ease;
            color: #64748b;
          }
        `}</style>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", color: "#38bdf8", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, backgroundColor: "rgba(56,189,248,0.1)", padding: "4px 12px", borderRadius: 999 }}>
              Bantuan
            </div>
            <h2 className="section-title" style={{ fontSize: 32, fontWeight: 800, color: "white", margin: "0 0 16px" }}>Pertanyaan yang Sering Diajukan</h2>
            <p style={{ color: "#94a3b8", fontSize: 16 }}>Temukan jawaban cepat seputar fungsionalitas dan keamanan SIPKM.</p>
          </div>

          <div className="reveal delay-200" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Item 1 */}
            <details className="faq-details">
              <summary>
                Apa itu SIPKM Bandar Lampung?
                <span className="faq-icon">▼</span>
              </summary>
              <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginTop: 16, marginBottom: 0, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                SIPKM (Sistem Informasi Pelaporan Keluhan Masyarakat) adalah prototipe platform digital terintegrasi WebGIS yang memfasilitasi warga untuk melaporkan masalah infrastruktur dan fasilitas umum di area Bandar Lampung secara cepat dan akurat.
              </p>
            </details>

            {/* Item 2 */}
            <details className="faq-details">
              <summary>
                Jenis keluhan apa saja yang dapat dilaporkan di sini?
                <span className="faq-icon">▼</span>
              </summary>
              <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginTop: 16, marginBottom: 0, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                Sistem ini difokuskan pada infrastruktur fisik dan fasilitas umum kota, seperti jalan berlubang, lampu penerangan jalan mati, penumpukan sampah liar, kerusakan drainase, hingga pohon tumbang.
              </p>
            </details>

            {/* Item 3 */}
            <details className="faq-details">
              <summary>
                Apakah data diri saya sebagai pelapor aman?
                <span className="faq-icon">▼</span>
              </summary>
              <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginTop: 16, marginBottom: 0, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                Ya. Kami menjaga kerahasiaan data pribadi pelapor. Informasi yang ditampilkan secara publik pada peta hanyalah jenis keluhan dan lokasinya, tanpa mengungkap data sensitif pelapor kepada khalayak umum.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="reveal section-pad" style={{ position: "relative", zIndex: 10, padding: "0 32px 80px" }}>
        <div className="cta-wrapper cta-glass" style={{ position: "relative", maxWidth: 900, margin: "0 auto", borderRadius: 32, padding: "56px 40px", textAlign: "center", overflow: "hidden" }}>
          
          {/* Ambient Glows dalam kotak */}
          <div style={{ position: "absolute", top: "-40%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", bottom: "-40%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(15,23,42,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 className="cta-title" style={{ fontSize: 32, fontWeight: 800, color: "white", margin: "0 0 12px" }}>Siap Membuat Laporan Pertama Anda?</h2>
            <p style={{ color: "#94a3b8", maxWidth: 480, margin: "0 auto 24px" }}>Bergabung bersama warga Bandar Lampung yang aktif melaporkan dan membangun kota bersama.</p>
            
            {/* Social Proof (Avatar & Stars) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ display: "flex", marginLeft: 10 }}>
                {["👨‍🦱", "👩", "👨‍🦳", "👱‍♀️"].map((emoji, idx) => (
                  <div key={idx} style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#1e293b", border: "2px solid #0f172a", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -12, fontSize: 18, zIndex: 4 - idx, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)" }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <div style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>Dipercaya 500+ Warga</div>
              </div>
            </div>

            <Link href="/register" className="btn-cta">
              Daftar Gratis Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Lengkap */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(11,19,41,0.8)", paddingTop: 64, paddingBottom: 24, paddingLeft: 32, paddingRight: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, marginBottom: 48, justifyContent: "space-between" }}>
            
            {/* Kolom 1: Branding */}
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <img src="/logo-sipkm.png" alt="Logo SIPKM" style={{ width: 36, height: 36, objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(56,189,248,0.3))" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>SIPKM</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px", marginTop: 2 }}>BANDAR LAMPUNG</div>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
                Prototipe Sistem Informasi Geografis Berbasis Web (WebGIS) untuk pemetaan dan pelaporan keluhan infrastruktur kota.
              </p>
            </div>

            {/* Kolom 2: Tautan Cepat */}
            <div style={{ flex: "1 1 150px" }}>
              <h4 style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Tautan Cepat</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <a href="#tentang" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>Tentang Sistem</a>
                <a href="#fitur" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>Fitur Unggulan</a>
                <a href="#cara-kerja" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>Cara Kerja</a>
              </div>
            </div>

            {/* Kolom 3: Informasi Sistem */}
            <div style={{ flex: "1 1 200px" }}>
              <h4 style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Informasi Sistem</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Status: <span style={{ color: "#38bdf8", fontWeight: 600 }}>Prototipe Akademis</span></span>
                <span style={{ color: "#64748b", fontSize: 14 }}>Versi: <span style={{ color: "white" }}>1.0.0-beta</span></span>
                <span style={{ color: "#64748b", fontSize: 14 }}>Tahun: <span style={{ color: "white" }}>2026</span></span>
              </div>
            </div>
            
          </div>

          {/* Garis Bawah & Copyright */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
              © 2026 SIPKM Bandar Lampung. All rights reserved.
            </p>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Dikembangkan secara eksklusif untuk <span style={{ color: "#94a3b8", fontWeight: 500 }}>Keperluan Penelitian & Skripsi</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
