import type { Metadata } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";
import { NotesBoard } from "@/components/admin/notes/NotesBoard";

export const metadata: Metadata = {
  title: "Notes · BABE HQ",
};

export default function AdminNotesPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/notes" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <NotesBoard />
      </main>
    </div>
  );
}
