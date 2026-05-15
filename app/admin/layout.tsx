import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { QuickCapture } from "@/components/admin/QuickCapture";
import { NotificationBell } from "@/components/admin/NotificationBell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <>
      {children}
      <div
        className="fixed top-3 right-5 z-50 flex items-center gap-3 bg-[#0A0E1A]/80 backdrop-blur-sm border border-[rgba(201,169,110,0.15)] rounded-full pl-2 pr-4 py-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <NotificationBell />
        <span
          className="text-cream/70 hidden sm:inline"
          style={{ fontSize: "12px" }}
        >
          {user.email}
        </span>
      </div>
      <QuickCapture />
    </>
  );
}
