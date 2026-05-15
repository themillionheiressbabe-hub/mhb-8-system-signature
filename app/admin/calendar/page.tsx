import type { Metadata } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";
import { CalendarBoard } from "@/components/admin/calendar/CalendarBoard";

export const metadata: Metadata = {
  title: "Calendar · BABE HQ",
};

export default function AdminCalendarPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/calendar" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <CalendarBoard />
      </main>
    </div>
  );
}
