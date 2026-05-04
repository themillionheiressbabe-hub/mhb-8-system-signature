import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
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
  const { error, count } = await sb
    .from("daily_reads_cache")
    .delete({ count: "exact" })
    .eq("cache_date", today);

  if (error) {
    console.error("DELETE failed:", error.message);
    process.exit(1);
  }

  console.log(`Deleted ${count ?? 0} row(s) for cache_date=${today}`);
})();
