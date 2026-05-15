import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  EditClientForm,
  type EditClientPayload,
} from "@/components/admin/clients/EditClientForm";

export const metadata: Metadata = {
  title: "Edit Client · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

type ClientRow = {
  id: string;
  full_name: string;
  chosen_name?: string | null;
  email?: string | null;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
  notes: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;

  async function updateClientAction(
    payload: EditClientPayload,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    "use server";
    if (
      !payload.full_name.trim() ||
      !payload.email.trim() ||
      !payload.date_of_birth ||
      !payload.place_of_birth.trim()
    ) {
      return { ok: false, error: "Missing required fields." };
    }
    const isJoker = payload.date_of_birth.endsWith("-12-31");
    const { error } = await supabaseAdmin
      .from("clients")
      .update({
        full_name: payload.full_name.trim(),
        email: payload.email.trim(),
        chosen_name: payload.chosen_name.trim() || null,
        date_of_birth: payload.date_of_birth,
        time_of_birth: payload.time_unknown
          ? null
          : payload.time_of_birth || null,
        place_of_birth: payload.place_of_birth.trim(),
        notes: payload.notes.trim() || null,
        is_joker: isJoker,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/clients/${id}`);
    revalidatePath("/admin/clients");
    redirect(`/admin/clients/${id}`);
  }

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select(
      "id, full_name, date_of_birth, time_of_birth, place_of_birth, notes",
    )
    .eq("id", id)
    .maybeSingle<ClientRow>();

  if (client) {
    const { data: extras } = await supabaseAdmin
      .from("clients")
      .select("chosen_name, email")
      .eq("id", id)
      .maybeSingle<{
        chosen_name: string | null;
        email: string | null;
      }>();
    if (extras) {
      client.chosen_name = extras.chosen_name;
      client.email = extras.email;
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <main
          className="mx-auto w-full"
          style={{ maxWidth: "1200px", padding: "28px 36px" }}
        >
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <p className={EYEBROW}>Not found</p>
            <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
              This client does not exist.
            </h1>
            <Link
              href="/admin/clients"
              className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] mt-6"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Back to Clients
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const initial: EditClientPayload = {
    full_name: client.full_name,
    email: client.email ?? "",
    chosen_name: client.chosen_name ?? "",
    date_of_birth: client.date_of_birth,
    time_of_birth: client.time_of_birth ? client.time_of_birth.slice(0, 5) : "",
    time_unknown: !client.time_of_birth,
    place_of_birth: client.place_of_birth ?? "",
    notes: client.notes ?? "",
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <Link
            href={`/admin/clients/${id}`}
            className="text-gold hover:text-gold-bright transition-colors inline-flex items-center gap-2 mb-6"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span aria-hidden="true">&larr;</span>
            Back to client
          </Link>
          <div className="mb-6">
            <p className={EYEBROW}>Edit Client</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              {client.full_name}
            </h1>
          </div>
          <EditClientForm
            clientId={id}
            initial={initial}
            updateClient={updateClientAction}
          />
        </div>
      </main>
    </div>
  );
}
