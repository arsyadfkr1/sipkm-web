import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 py-6 pl-6 pr-2 gap-2 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col gap-6 min-w-0 min-h-0 relative">
        <div className="px-4">
          <Header />
        </div>
        <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 xl:pb-6 gap-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
