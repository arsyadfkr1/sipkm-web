"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";

export default function ForumTopicDetailPage() {
  const params = useParams();
  const topicId = params.id as string;
  
  const [topic, setTopic] = useState<any>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [repliesList, setRepliesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopik = async () => {
      try {
        const res = await fetch(`/api/forum/topik/${topicId}`);
        if (res.ok) {
          const data = await res.json();
          setTopic(data);
          setUpvotes(data.upvotes);
          setRepliesList(data.balasan || []);
        }
      } catch (error) {
        console.error("Gagal load detail topik:", error);
      } finally {
        setLoading(false);
      }
    };
    if (topicId) fetchTopik();
  }, [topicId]);

  const handleUpvote = async () => {
    const action = hasUpvoted ? "downvote" : "upvote";
    
    // Optimistic UI
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setHasUpvoted(true);
    }

    // API request
    await fetch(`/api/forum/topik/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  };

  const handleSubmitReply = async () => {
    if (replyText.trim() === "") return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/forum/topik/${topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: replyText }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setRepliesList([...repliesList, newReply]);
        setReplyText("");
      }
    } catch (error) {
      alert("Gagal mengirim balasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWaktu = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: localeID });
    } catch {
      return isoString;
    }
  };

  if (loading) return <div className="text-center text-white py-10 animate-pulse">Memuat diskusi...</div>;
  if (!topic) return <div className="text-center text-rose-400 py-10">Topik tidak ditemukan.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 animate-fade-in">
      {/* Back Button */}
      <div>
        <Link href="/komunitas" className="inline-flex items-center gap-2 rounded-xl bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white border border-slate-700/50 hover:border-slate-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Forum
        </Link>
      </div>

      {/* Main Topic Content */}
      <div className="rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329]/80 p-6 sm:p-10 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {topic.kategoriId ? "Laporan Warga" : "Umum"}
            </span>
            <span className="text-sm text-slate-500">{formatWaktu(topic.createdAt)}</span>
          </div>

          <h1 className="mt-5 text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">{topic.judul}</h1>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-lg font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] ring-2 ring-white/10">
              {topic.user?.namaLengkap?.substring(0, 2).toUpperCase() || "NN"}
            </div>
            <div>
              <p className="font-bold text-white text-base">{topic.user?.namaLengkap || "Anonim"}</p>
              <p className="text-xs font-medium text-slate-400">Pembuat Topik</p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800/60 pt-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed sm:text-lg whitespace-pre-wrap">{topic.isi}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900/40 p-3 border border-slate-800/50">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUpvote}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  hasUpvoted 
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-transparent"
                }`}
              >
                <svg viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {upvotes} Dukungan
              </button>
              
              <button className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white border border-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Bagikan
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-3 text-sm text-slate-500 font-medium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {topic.views} Dilihat
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Balasan ({repliesList.length})
          <div className="h-px flex-1 bg-gradient-to-r from-slate-700/50 to-transparent ml-4"></div>
        </h3>

        <div className="space-y-4">
          {repliesList.map((reply: any) => (
            <div 
              key={reply.id} 
              className={`relative rounded-[2rem] p-6 sm:p-8 transition-all ${
                reply.isResmi 
                  ? "border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.05)]" 
                  : "border border-slate-800/40 bg-[#0b1329]/50 hover:bg-[#0b1329]/80"
              }`}
            >
              {reply.isResmi && (
                <div className="absolute top-0 right-0 rounded-bl-[2rem] rounded-tr-[2rem] bg-amber-500/10 px-4 py-2 border-b border-l border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold text-amber-400">Tanggapan Resmi</span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner ${
                  reply.isResmi ? "bg-gradient-to-br from-amber-500 to-orange-400 ring-2 ring-amber-500/30" : "bg-slate-700"
                }`}>
                  {reply.user?.namaLengkap?.substring(0, 2).toUpperCase() || "NN"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold ${reply.isResmi ? "text-amber-400" : "text-white"}`}>{reply.user?.namaLengkap || "Anonim"}</h4>
                    <span className="text-xs text-slate-500">• {formatWaktu(reply.createdAt)}</span>
                  </div>
                  <p className={`mt-2 text-sm sm:text-base leading-relaxed ${reply.isResmi ? "text-amber-100/80" : "text-slate-300"}`}>
                    {reply.isi}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {reply.upvotes}
                    </button>
                    <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Balas</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Reply Form */}
      <div className="rounded-[2.5rem] border border-slate-700/50 bg-[#0b1329] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <h4 className="text-lg font-bold text-white mb-4">Tambahkan Balasan Anda</h4>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Tulis pendapat atau solusi Anda di sini..."
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/50 p-4 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-y min-h-[120px] transition-all"
        />
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSubmitReply}
            className="rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={replyText.trim().length === 0}
          >
            Kirim Balasan
          </button>
        </div>
      </div>
    </div>
  );
}
