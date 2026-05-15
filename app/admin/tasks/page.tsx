import type { Metadata } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";
import { TasksBoard } from "@/components/admin/tasks/TasksBoard";

export const metadata: Metadata = {
  title: "Tasks · BABE HQ",
};

export default function AdminTasksPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/tasks" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <TasksBoard />
      </main>
    </div>
  );
}
