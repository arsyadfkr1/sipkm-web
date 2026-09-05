import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50";

  const variants: Record<string, string> = {
    primary: "bg-[#2563eb] text-white shadow-[0_18px_45px_-20px_rgba(37,99,235,0.55)] hover:bg-blue-500",
    secondary: "bg-white/5 text-slate-100 hover:bg-white/10 border border-slate-800/40",
    ghost: "bg-transparent text-slate-100 hover:bg-white/5",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
