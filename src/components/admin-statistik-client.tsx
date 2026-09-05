"use client";

import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from "recharts";

export default function AdminStatistikClient({ reports, stats }: { reports: any[]; stats: any }) {
  const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // Hitung data untuk Grafik Pie secara dinamis
  const pieData = useMemo(() => [
    { name: 'Menunggu', value: stats.menunggu, color: '#94a3b8' },
    { name: 'Diproses', value: stats.diproses, color: '#f59e0b' },
    { name: 'Selesai', value: stats.selesai, color: '#10b981' },
  ].filter(d => d.value > 0), [stats]);

  // Hitung data untuk Grafik Bar (Berdasarkan Kategori)
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.kategori] = (counts[r.kategori] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      jumlah: counts[key]
    })).sort((a, b) => b.jumlah - a.jumlah);
  }, [reports]);

  // Hitung data tren 6 bulan terakhir
  const trendData = useMemo(() => {
    const now = new Date();
    const months: { bulan: string; total: number; selesai: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const total = reports.filter(r => {
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === year && rd.getMonth() === month;
      }).length;
      const selesai = reports.filter(r => {
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === year && rd.getMonth() === month && r.status === "selesai";
      }).length;
      months.push({ bulan: BULAN_ID[month], total, selesai });
    }
    return months;
  }, [reports]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Pie Chart: Status Laporan */}
        <div className="w-full lg:w-1/3 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-sky-500/30">
          <h3 className="text-sm font-bold text-white mb-6">Persentase Status Laporan</h3>
          <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(51,65,85,0.5)', borderRadius: '12px', color: '#f8fafc', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Belum ada data</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Laporan per Kategori */}
        <div className="w-full lg:w-2/3 rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-sky-500/30">
          <h3 className="text-sm font-bold text-white mb-6">Laporan per Kategori Kerusakan</h3>
          <div className="h-[300px] w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(30,41,59,0.5)' }}
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(51,65,85,0.5)', borderRadius: '12px', color: '#f8fafc', backdropFilter: 'blur(8px)' }}
                  />
                  <Bar dataKey="jumlah" name="Total Laporan" fill="#38bdf8" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Belum ada data</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Area Chart: Tren Laporan 6 Bulan Terakhir */}
      <div className="w-full rounded-[2rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-sky-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">Tren Pelaporan Bulanan</h3>
            <p className="text-xs text-slate-500 mt-1">Grafik pertumbuhan laporan masuk vs laporan selesai (6 bulan terakhir)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="inline-block w-3 h-3 rounded-full bg-sky-400"></span> Total Masuk
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-400"></span> Selesai
            </span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" vertical={false} />
              <XAxis dataKey="bulan" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(51,65,85,0.5)', borderRadius: '12px', color: '#f8fafc', backdropFilter: 'blur(8px)' }}
              />
              <Area type="monotone" dataKey="total" name="Total Masuk" stroke="#38bdf8" strokeWidth={2.5} fill="url(#colorTotal)" dot={{ fill: '#38bdf8', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="selesai" name="Selesai" stroke="#10b981" strokeWidth={2.5} fill="url(#colorSelesai)" dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
