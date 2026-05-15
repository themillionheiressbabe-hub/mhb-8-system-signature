import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string | null }>();
  if (profile?.role !== "admin") return { ok: false as const, status: 403 };
  return { ok: true as const, userId: user.id };
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: gate.status });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Notification[]>();

  if (error) {
    return NextResponse.json(
      { notifications: [], unreadCount: 0, error: error.message },
      { status: 200 },
    );
  }

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: gate.status });
  }

  let payload: { id?: string; all?: boolean } = {};
  try {
    payload = (await req.json()) as { id?: string; all?: boolean };
  } catch {
    payload = {};
  }

  if (payload.all) {
    const { error } = await supabaseAdmin
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (payload.id) {
    const { error } = await supabaseAdmin
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", payload.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "missing id or all" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
