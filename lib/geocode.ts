import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function geocodeCity(
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  const key = city.toLowerCase().trim();

  const { data: cached } = await supabase
    .from("geo_cache")
    .select("lat, lng")
    .eq("city", key)
    .maybeSingle<{ lat: number; lng: number }>();

  if (cached) return { lat: cached.lat, lng: cached.lng };

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "TheMillionHeiressBABE/1.0 hello@themillionheiressbabe.com",
    },
  });
  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
  }>;

  if (!results.length) return null;

  const { lat, lon } = results[0];
  const result = { lat: parseFloat(lat), lng: parseFloat(lon) };

  await supabase.from("geo_cache").insert({
    city: key,
    lat: result.lat,
    lng: result.lng,
  });

  return result;
}
