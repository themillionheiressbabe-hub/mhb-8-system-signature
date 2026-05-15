import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { geocodeCity } from "@/lib/geocode";
import {
  NewClientForm,
  type ProductOption,
} from "@/components/admin/clients/NewClientForm";

export const metadata: Metadata = {
  title: "New Client · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

type FormPayload = {
  full_name: string;
  email: string;
  chosen_name: string;
  date_of_birth: string;
  time_of_birth: string;
  time_unknown: boolean;
  place_of_birth: string;
  product_slug: string;
  notes: string;
};

type CreateResult =
  | { ok: true; clientId: string; geocoded: boolean }
  | { ok: false; error: string };

async function createClient(payload: FormPayload): Promise<CreateResult> {
  "use server";

  if (
    !payload.full_name.trim() ||
    !payload.email.trim() ||
    !payload.date_of_birth ||
    !payload.place_of_birth.trim()
  ) {
    return { ok: false, error: "Missing required fields." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  // Try to link an existing profile by email; otherwise fall back to the
  // admin's profile_id so the FK constraint holds.
  let profileId = user.id;
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", payload.email.trim())
    .maybeSingle<{ id: string }>();
  if (existingProfile?.id) {
    profileId = existingProfile.id;
  }

  const isJoker = payload.date_of_birth.endsWith("-12-31");

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("clients")
    .insert({
      profile_id: profileId,
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
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !inserted?.id) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not create client.",
    };
  }

  const clientId = inserted.id;

  // Best-effort geocode. Failures do not break the save.
  let geocoded = false;
  try {
    const result = await geocodeCity(payload.place_of_birth.trim());
    if (result) {
      await supabaseAdmin
        .from("clients")
        .update({
          latitude: result.lat,
          longitude: result.lng,
        })
        .eq("id", clientId);
      geocoded = true;
    }
  } catch {
    // ignore geocode errors
  }

  redirect(`/admin/clients/${clientId}?geocoded=${geocoded ? "1" : "0"}`);
}

export default async function NewClientPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("slug, name, engine, is_active")
    .order("engine", { ascending: true })
    .order("name", { ascending: true })
    .returns<
      Array<{
        slug: string;
        name: string;
        engine: number | null;
        is_active: boolean | null;
      }>
    >();

  const options: ProductOption[] = (products ?? [])
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      engine: p.engine,
    }));

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/clients/new" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <div className="mb-6">
            <p className={EYEBROW}>New Client</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              Add a client.
            </h1>
          </div>
          <NewClientForm products={options} createClient={createClient} />
        </div>
      </main>
    </div>
  );
}
