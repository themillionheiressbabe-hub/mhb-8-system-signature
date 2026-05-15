import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing env");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

(async () => {
  const { data, error } = await sb
    .from("daily_reads_cache")
    .select("cache_date, card_code, daily_read")
    .eq("cache_date", today)
    .maybeSingle();

  if (error) {
    console.error("error:", error.message);
    return;
  }
  if (!data) {
    console.log("no row for", today);
    return;
  }
  console.log("cache_date:", data.cache_date);
  console.log("card_code:", data.card_code);
  console.log("daily_read length:", (data.daily_read ?? "").length);
  console.log("first 200 chars:", (data.daily_read ?? "").slice(0, 200));
})();
