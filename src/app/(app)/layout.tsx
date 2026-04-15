import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0d12]">
      <Sidebar />
      <main className="lg:ml-[220px] p-5 md:p-8">{children}</main>
    </div>
  );
}
