"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { set, get, del } from "idb-keyval";

// ── Leaflet Map Component (loaded via CDN) ──
function LocationMap({ onLocationSelect, externalCoords }: { onLocationSelect: (lat: number, lng: number, address: string) => void; externalCoords?: { lat: number; lng: number } | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (window as any).L;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-5.3971, 105.2668], 13);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "",
        maxZoom: 19,
      }).addTo(map);

      const updateMarkerAndAddress = async (lat: number, lng: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const customIcon = L.divIcon({
            html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="#38bdf8" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
            className: "",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { headers: { "Accept-Language": "id" } });
          const data = await res.json();
          onLocationSelect(lat, lng, data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          onLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      };

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        updateMarkerAndAddress(lat, lng);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [onLocationSelect]);

  // Pantau jika ada perubahan koordinat dari pencarian alamat eksternal
  useEffect(() => {
    if (externalCoords && mapInstanceRef.current) {
      const { lat, lng } = externalCoords;
      const map = mapInstanceRef.current;
      const L = (window as any).L;

      map.setView([lat, lng], 16); // Geser dan zoom peta ke hasil pencarian

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const customIcon = L.divIcon({
          html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="#38bdf8" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      }
    }
  }, [externalCoords]);

  return <div ref={mapRef} className="h-full w-full" style={{ minHeight: "250px" }} />;
}

// ── File Upload Component ──
interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

function FileUpload({ files, onFilesChange }: { files: UploadedFile[]; onFilesChange: (files: UploadedFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const additions: UploadedFile[] = [];
    Array.from(newFiles).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`Tipe file "${file.name}" tidak didukung. Gunakan JPG, PNG, WEBP, atau MP4.`);
        return;
      }
      if (file.size > maxSize) {
        alert(`File "${file.name}" melebihi batas 10MB.`);
        return;
      }
      additions.push({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      });
    });

    onFilesChange([...files, ...additions]);
  };

  const removeFile = (id: string) => {
    const removed = files.find((f) => f.id === id);
    if (removed) URL.revokeObjectURL(removed.preview);
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="flex h-full flex-col space-y-3">
      <div
        className={`flex flex-1 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging ? "border-sky-400 bg-sky-900/20" : "border-slate-700 bg-slate-900/30 hover:border-sky-500/50 hover:bg-slate-900/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input ref={inputRef} type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp,video/mp4" onChange={(e) => handleFiles(e.target.files)} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-sky-400">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-white">{isDragging ? "Lepaskan file di sini..." : "Klik atau seret file ke sini"}</p>
        <p className="mt-1 text-xs text-slate-500">Maks. 10MB per file (JPG, PNG, WEBP, MP4)</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
              {f.file.type.startsWith("video/") ? <video src={f.preview} className="h-28 w-full object-cover" muted /> : <Image src={f.preview} alt={f.file.name} width={200} height={112} className="h-28 w-full object-cover" unoptimized />}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  className="rounded-full bg-rose-500/80 p-2 text-white transition-colors hover:bg-rose-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-2 py-1.5">
                <p className="truncate text-xs text-slate-400">{f.file.name}</p>
                <p className="text-[10px] text-slate-600">{(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function BuatLaporanPage() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSearchAddress = async () => {
    if (!address.trim()) return;
    setIsSearchingMap(true);
    try {
      // 1. Coba pencarian dengan konteks Bandar Lampung
      let query = encodeURIComponent(address + ", Bandar Lampung");
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      let data = await res.json();
      
      // 2. Jika tidak ketemu, coba cari persis seperti apa yang diketik tanpa embel-embel
      if (!data || data.length === 0) {
        query = encodeURIComponent(address);
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        data = await res.json();
      }

      // 3. Jika tetap tidak ketemu, coba cari kata pertamanya saja (misal: "Tugu Adipura" dari "Tugu Adipura Enggal")
      if (!data || data.length === 0) {
        const firstWords = address.split(" ").slice(0, 2).join(" ");
        query = encodeURIComponent(firstWords + ", Bandar Lampung");
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCoords({ lat, lng });
      } else {
        alert("Lokasi tidak ditemukan secara presisi di database peta. Silakan geser dan klik titiknya secara manual di peta.");
      }
    } catch (err) {
      alert("Gagal mencari alamat. Pastikan Anda terhubung ke internet.");
    } finally {
      setIsSearchingMap(false);
    }
  };

  useEffect(() => {
    get("laporan-draft").then((draft: any) => {
      if (draft) {
        setTitle(draft.title || "");
        setCategory(draft.category || "");
        setDescription(draft.description || "");
      }
    });
  }, []);

  useEffect(() => {
    const draft = { title, category, description };
    set("laporan-draft", draft).catch(console.warn);
  }, [title, category, description]);

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setCoords({ lat, lng });
    setAddress(addr);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!coords) {
      setErrorMsg("Mohon tentukan lokasi kejadian di peta terlebih dahulu.");
      return;
    }
    if (uploadedFiles.length === 0) {
      setErrorMsg("Mohon lampirkan minimal 1 foto kejadian.");
      return;
    }

    const formElement = e.currentTarget;
    const isAnonim = (formElement.elements.namedItem("isAnonim") as HTMLInputElement).checked;

    // --- KODE OFFLINE DRAFTING MULAI DARI SINI ---
    if (!navigator.onLine) {
      try {
        const fullDraftData = {
          title,
          category,
          description,
          address,
          lat: coords.lat.toString(),
          lng: coords.lng.toString(),
          isAnonim: isAnonim.toString(),
          files: uploadedFiles.map((uf) => uf.file),
        };

        await set("laporan-offline-sync", fullDraftData);
        await del("laporan-draft");

        alert("⚠ MODE OFFLINE AKTIF! Laporan telah disimpan ke HP Anda secara Offline. Silakan cek Halaman Utama (Dashboard) nanti saat sinyal WiFi Anda menyala kembali untuk melakukan Sinkronisasi.");

        // Kita hanya mengosongkan form agar aman dan tidak menendang Anda ke halaman Login
        setTitle("");
        setCategory("");
        setDescription("");
        setAddress("");
        setCoords(null);
        setUploadedFiles([]);

        return;
      } catch (err: any) {
        setErrorMsg("Gagal menyimpan draf offline. Memori perangkat mungkin penuh.");
        return;
      }
    }
    // --- KODE OFFLINE DRAFTING SELESAI ---

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", title);
      submitData.append("category", category);
      submitData.append("description", description);
      submitData.append("address", address);
      submitData.append("lat", coords.lat.toString());
      submitData.append("lng", coords.lng.toString());
      submitData.append("isAnonim", isAnonim.toString());

      uploadedFiles.forEach((f) => {
        submitData.append("files", f.file);
      });

      const res = await fetch("/api/laporan", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat menyimpan laporan");
      }

      setSuccess(true);
      window.scrollTo(0, 0);

      await del("laporan-draft");

      setTimeout(() => {
        window.location.href = "/riwayat";
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan laporan");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Formulir Laporan Baru</h1>
          <p className="mt-2 text-sm text-slate-400">Silakan isi formulir di bawah ini dengan informasi yang akurat dan jelas untuk mempercepat proses tindak lanjut.</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-white">Detail Kejadian</h2>

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Laporan Berhasil Dikirim!</p>
              <p className="text-sm opacity-80">Mengarahkan ke halaman riwayat...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-300">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Singkat, deskriptif (contoh: Jalan Rusak di Jl. Sudirman)"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-300">
                Kategori Kejadian <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white transition-colors focus:border-sky-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              >
                <option value="" disabled>
                  Pilih Kategori Kejadian
                </option>
                <option value="infrastruktur">Infrastruktur &amp; Fasilitas Umum</option>
                <option value="kebersihan">Kebersihan &amp; Lingkungan</option>
                <option value="keamanan">Ketertiban &amp; Keamanan</option>
                <option value="kesehatan">Kesehatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
              Deskripsi Detail <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Jelaskan secara detail apa yang terjadi, kapan, dan informasi relevan lainnya..."
              required
            ></textarea>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Lokasi Kejadian <span className="text-red-500">*</span>
              </label>
              <div className="relative h-[250px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                <LocationMap onLocationSelect={handleLocationSelect} externalCoords={coords} />
                {!coords && (
                  <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xl backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Klik pada peta untuk memilih lokasi
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 space-y-2">
                <label className="text-sm font-medium text-slate-300">Detail Alamat</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchAddress();
                      }
                    }}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Contoh: Tugu Adipura"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={isSearchingMap}
                    className="shrink-0 rounded-xl bg-[#2563eb]/20 px-4 text-sm font-medium text-[#2563eb] hover:bg-[#2563eb]/30 transition-colors disabled:opacity-50"
                  >
                    {isSearchingMap ? "Mencari..." : "Cari di Peta"}
                  </button>
                </div>
                {coords && (
                  <p className="text-xs text-slate-500">
                    📍 Koordinat: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Lampiran Bukti (Foto/Video) <span className="text-red-500">*</span>
              </label>
              <div className="flex h-full flex-col">
                <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-t border-slate-800/60 pt-6 sm:flex-row">
            <div className="mb-6 flex items-center gap-3 sm:mb-0">
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" name="isAnonim" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2563eb] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563eb]/50"></div>
              </label>
              <div>
                <p className="text-sm font-medium text-white">Kirim sebagai anonim</p>
                <p className="text-xs text-slate-400">Identitas Anda akan disembunyikan dari publik.</p>
              </div>
            </div>

            <div className="flex w-full gap-3 sm:w-auto">
              <button type="button" className="flex-1 rounded-2xl border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 sm:flex-none">
                Batal
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex-1 rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
