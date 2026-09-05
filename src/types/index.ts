import type { ReactNode } from "react";

export type ReportStatus = "Diproses" | "Selesai" | "Menunggu";

export interface Report {
  id: string;
  title: string;
  location: string;
  summary: string;
  status: ReportStatus;
  date: string;
  imageUrl: string;
  description: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accentColor: string;
  sparklineData?: number[];
}
