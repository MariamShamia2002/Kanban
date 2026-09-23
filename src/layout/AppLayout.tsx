import { Outlet } from "react-router";
import { Header } from "@/layout/Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <Header />
      <main className="px-6 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
