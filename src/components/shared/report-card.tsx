import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  title: string;
  summary: string;
  location: string;
  status: string;
  date: string;
  imageUrl: string;
  description: string;
}

export default function ReportCard({ report }: { report: Report }) {
  const isProcessed = report.status === "Diproses";

  return (
    <Link
      href={`/laporan/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="relative h-52 w-full bg-slate-800/50 overflow-hidden">
        {report.imageUrl && report.imageUrl.startsWith("http") ? (
          <Image src={report.imageUrl} alt={report.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          // Placeholder cantik jika tidak ada foto
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <svg viewBox="0 0 24 24" className="h-16 w-16 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm ${
            isProcessed ? "bg-amber-400/20 text-amber-200 ring-amber-400/30" : "bg-emerald-400/20 text-emerald-200 ring-emerald-400/30"
          }`}
        >
          {report.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-white transition-colors group-hover:text-sky-300">{report.title}</h3>
        <p className="mt-2 text-sm text-slate-400 line-clamp-2">{report.summary}</p>
        <div className="mt-auto pt-4 text-xs text-slate-500">
          <span>{formatDate(report.date)}</span>
        </div>
      </div>
    </Link>
  );
}
