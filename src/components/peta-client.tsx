"use client";

import { useEffect, useRef, useState } from "react";

interface Marker {
  id: number;
  judul: string;
  deskripsi: string;
  alamat: string;
  status: string;
  lat: number;
  lng: number;
  foto: string | null;
  tanggal: string;
}

const FILTER_OPTIONS = [
  { key: "semua", label: "Semua", color: "bg-slate-500" },
  { key: "menunggu", label: "Menunggu", color: "bg-slate-400" },
  { key: "diproses", label: "Diproses", color: "bg-amber-400" },
  { key: "selesai", label: "Selesai", color: "bg-emerald-400" },
];

export default function PetaClient({ markers }: { markers: Marker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRefsRef = useRef<{ instance: any; status: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState("semua");

  const getColor = (status: string) => {
    if (status === "diproses") return "#f59e0b";
    if (status === "selesai") return "#10b981";
    return "#94a3b8";
  };

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const loadLeaflet = () =>
      new Promise<void>((resolve) => {
        if ((window as any).L) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = (window as any).L;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-5.3971, 105.2668], 13);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      
      // 1. Definisi Pilihan Jenis Peta
      const darkMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
        maxZoom: 19, 
        className: "dark-map" 
      });
      
      const lightMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
        maxZoom: 19 
      });
      
      const sateliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { 
        maxZoom: 19 
      });

      // 2. Tampilkan Peta Gelap sebagai tampilan awal (default)
      darkMap.addTo(map);

      // 3. Tambahkan Tombol Pengubah Peta di Kanan Atas
      L.control.layers({
        "🌙 Peta Gelap": darkMap,
        "🗺️ Peta Terang": lightMap,
        "🌍 Peta Satelit": sateliteMap
      }, null, { position: "topright" }).addTo(map);

      markerRefsRef.current = markers.map((m) => {
        const color = getColor(m.status);
        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px ${color};"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const popup = `
          <div style="font-family:sans-serif;min-width:200px;max-width:260px;">
            ${m.foto ? `<img src="${m.foto}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ""}
            <div style="font-weight:bold;font-size:13px;margin-bottom:4px;">${m.judul}</div>
            <div style="font-size:11px;color:#888;margin-bottom:6px;">📍 ${m.alamat}</div>
            <div style="font-size:11px;margin-bottom:4px;">${m.deskripsi}</div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;">
              <span style="font-size:10px;font-weight:bold;padding:2px 8px;border-radius:999px;background:${color}22;color:${color};text-transform:uppercase;">${m.status}</span>
              <span style="font-size:10px;color:#aaa;">${m.tanggal}</span>
            </div>
          </div>`;

        const markerInstance = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(popup, { maxWidth: 280 });

        return { instance: markerInstance, status: m.status };
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRefsRef.current = [];
      }
    };
  }, [markers]);

  // ✅ Filter marker saat tombol diklik
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    markerRefsRef.current.forEach(({ instance, status }) => {
      if (activeFilter === "semua" || status === activeFilter) {
        if (!mapInstanceRef.current.hasLayer(instance)) {
          instance.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(instance)) {
          mapInstanceRef.current.removeLayer(instance);
        }
      }
    });
  }, [activeFilter]);

  const countByStatus = (status: string) => (status === "semua" ? markers.length : markers.filter((m) => m.status === status).length);

  return (
    <div className="relative h-full w-full">
      <style>{`
        /* Peta Midnight Slate: Elegan, Abu-abu Kebiruan, High Contrast */
        .dark-map {
          filter: brightness(0.9) invert(1) contrast(1.1) hue-rotate(210deg) saturate(0.3) grayscale(20%);
        }
        
        /* Merapikan kotak Layer Switcher bawaan Leaflet */
        .leaflet-control-layers {
          border-radius: 14px !important;
          border: none !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3) !important;
          padding: 4px;
          font-family: inherit;
        }
        .leaflet-control-layers-expanded {
          padding: 10px 14px !important;
          border-radius: 16px !important;
        }
        .leaflet-control-layers label {
          font-weight: 600;
          font-size: 13px;
          color: #334155;
          margin-bottom: 6px;
        }
      `}</style>
      
      {/* ✅ TOMBOL FILTER DI ATAS PETA */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 rounded-2xl border border-slate-700 bg-[#0b1329]/90 p-2 backdrop-blur-md shadow-xl">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActiveFilter(opt.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${activeFilter === opt.key ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`}></span>
            {opt.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeFilter === opt.key ? "bg-slate-200 text-slate-700" : "bg-slate-700 text-slate-300"}`}>{countByStatus(opt.key)}</span>
          </button>
        ))}
      </div>

      {/* Peta Leaflet */}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
