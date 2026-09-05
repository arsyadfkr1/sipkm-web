import type { StatCardProps } from "@/types";

export function StatCard({ label, value, icon, accentColor, sparklineData }: StatCardProps) {
  // SVG size parameters
  const width = 120;
  const height = 40;
  
  // Render sparkline if data is provided
  const points = sparklineData || [10, 12, 11, 15, 13, 17, 16]; // default fallback
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const pointsCoordinates = points.map((val, index) => {
    const x = (index / (points.length - 1)) * width;
    // Invert y because SVG y=0 is top
    const y = height - ((val - min) / range) * (height - 8) - 4; 
    return `${x},${y}`;
  }).join(" ");

  const pathD = `M ${pointsCoordinates}`;

  // Get color stroke & fill based on accentColor
  let strokeColor = "stroke-sky-400";
  let fillColor = "url(#grad-sky)";
  let gradId = "grad-sky";
  let gradColor = "#38bdf8";
  let hoverStyles = "hover:border-sky-400/70 hover:bg-sky-950/40 hover:shadow-[inset_0_0_40px_rgba(56,189,248,0.2),0_0_30px_rgba(56,189,248,0.6)] group";

  if (accentColor.includes("amber")) {
    strokeColor = "stroke-amber-400";
    fillColor = "url(#grad-amber)";
    gradId = "grad-amber";
    gradColor = "#fbbf24";
    hoverStyles = "hover:border-amber-400/70 hover:bg-amber-950/30 hover:shadow-[inset_0_0_40px_rgba(251,191,36,0.2),0_0_30px_rgba(251,191,36,0.6)] group";
  } else if (accentColor.includes("emerald")) {
    strokeColor = "stroke-emerald-400";
    fillColor = "url(#grad-emerald)";
    gradId = "grad-emerald";
    gradColor = "#34d399";
    hoverStyles = "hover:border-emerald-400/70 hover:bg-emerald-950/30 hover:shadow-[inset_0_0_40px_rgba(52,211,153,0.2),0_0_30px_rgba(52,211,153,0.6)] group";
  }

  // Path for fill area underneath the stroke line
  const fillPathD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className={`rounded-[1.75rem] border border-slate-800/40 bg-[#0b1329]/80 p-6 shadow-[0_24px_45px_-26px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1 ${hoverStyles}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5 text-cyan-300 shadow-inner shadow-sky-500/10">
          {icon}
        </div>
        
        {/* Mini Sparkline Chart */}
        <div className="h-10 w-28 shrink-0">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradColor} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={gradColor} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={fillPathD} fill={fillColor} />
            <path d={pathD} fill="none" className={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-12 rounded-full ${accentColor}`} />
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
