"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";

interface DiscussionTopic {
  id: string;
  title: string;
  author: string;
  avatar: string;
  category: string;
  replies: number;
  views: number;
  upvotes: number;
  lastUpdated: string;
  excerpt: string;
}

export default function KomunitasPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

  const [newTopic, setNewTopic] = useState({ title: "", category: "Umum", content: "" });
  const categories = ["Semua", "Umum", "Infrastruktur", "Lingkungan", "Keamanan", "Kebersihan"];

  // Fetch Topik dari Database
  useEffect(() => {
    const fetchTopik = async () => {
      try {
        const res = await fetch("/api/forum/topik");
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (error) {
        console.error("Gagal load forum:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopik();
  }, []);

  const handleUpvote = async (id: string) => {
    const isUpvoted = upvotedIds.includes(id);
    const action = isUpvoted ? "downvote" : "upvote";

    // Update UI instan (Optimistic UI)
    setUpvotedIds(isUpvoted ? upvotedIds.filter((x) => x !== id) : [...upvotedIds, id]);
    setTopics(topics.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + (isUpvoted ? -1 : 1) } : t)));

    // Request ke API
    await fetch(`/api/forum/topik/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title || !newTopic.content) return;

    try {
      const res = await fetch("/api/forum/topik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTopic),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTopic({ title: "", category: "Umum", content: "" });
        // Refresh topik
        const refreshed = await fetch("/api/forum/topik");
        setTopics(await refreshed.json());
      }
    } catch (error) {
      alert("Gagal membuat topik");
    }
  };

  const filteredTopics = topics
    .filter((t) => selectedCategory === "Semua" || t.category === selectedCategory)
    .filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatWaktu = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: localeID });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <section className="rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329]/80 p-8 sm:p-10 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Forum Komunitas</h1>
            <p className="mt-3 max-w-2xl text-slate-400 text-base leading-relaxed">Diskusi, berbagi ide, dan kolaborasi untuk perbaikan kota yang lebih baik.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 hover:scale-105 active:scale-95 shrink-0">
            + Buat Topik Baru
          </button>
        </div>
      </section>

      {/* Modal Buat Topik */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl rounded-[2.5rem] border border-slate-700/60 bg-[#0b1329] p-8 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Buat Topik Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Judul Topik</label>
                <input
                  type="text"
                  required
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Contoh: Usulan Perbaikan Penerangan Jalan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kategori</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition appearance-none"
                >
                  {categories
                    .filter((c) => c !== "Semua")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Isi Diskusi</label>
                <textarea
                  required
                  rows={5}
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                  placeholder="Tuliskan detail ide atau masalah yang ingin Anda diskusikan..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-5 py-2.5 font-medium text-slate-300 hover:bg-slate-800 transition">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 transition">
                  Kirim Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white" 
                  : "border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-full border border-slate-800 bg-[#0b1329]/80 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 shadow-inner focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            placeholder="Cari topik diskusi..."
          />
        </div>
      </div>

      {/* Discussion Topics */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isUpvoted = upvotedIds.includes(topic.id);
          return (
            <div
              key={topic.id}
              className="group relative block rounded-[2.25rem] border border-slate-800/40 bg-[#0b1329]/60 p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/70 hover:bg-sky-950/50 hover:shadow-[inset_0_0_40px_rgba(56,189,248,0.15),0_0_30px_rgba(56,189,248,0.3)]"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-500 font-bold text-white shadow-lg shadow-blue-500/20">{topic.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{topic.author}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{formatWaktu(topic.lastUpdated)}</p>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-cyan-300">{topic.title}</h3>
                  <p className="mt-2 text-slate-400 leading-relaxed">{topic.excerpt}</p>
                  
                  {/* Category & Upvote Button */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-block rounded-full border border-slate-800/80 bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-400">{topic.category}</span>
                      
                      <button 
                        onClick={() => handleUpvote(topic.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          isUpvoted 
                            ? "border-sky-500/50 bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                            : "border-slate-700/50 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {topic.upvotes}
                      </button>
                    </div>
                    
                    <Link href={`/komunitas/${topic.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3b82f6] transition-colors hover:text-sky-400">
                      Ikut Diskusi &rarr;
                    </Link>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-3 text-right shrink-0">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 leading-none">{topic.replies}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Balasan
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-300 leading-none">{topic.views}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Dilihat
                    </p>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
