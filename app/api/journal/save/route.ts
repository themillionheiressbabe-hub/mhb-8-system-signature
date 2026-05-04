import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getUkDateIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    destinyCardCode?: string | null;
    tarotCardName?: string | null;
    tarotCardReversed?: boolean;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entryDate = getUkDateIso();

  const { error } = await supabaseAdmin.from("journal_entries").insert({
    user_id: user.id,
    entry_date: entryDate,
    destiny_card_code: body.destinyCardCode ?? null,
    tarot_card_name: body.tarotCardName ?? null,
    tarot_card_reversed: Boolean(body.tarotCardReversed),
    notes: body.notes ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
