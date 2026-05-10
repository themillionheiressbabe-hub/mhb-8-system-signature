export type MoonPhase =
  | "Full Moon"
  | "Waxing Gibbous"
  | "First Quarter"
  | "Waxing Crescent"
  | "New Moon"
  | "Waning Crescent"
  | "Third Quarter"
  | "Waning Gibbous";

export function normalisePhaseName(raw: string): MoonPhase {
  const map: Record<string, MoonPhase> = {
    full: "Full Moon",
    "full moon": "Full Moon",
    "waxing gibbous": "Waxing Gibbous",
    "first quarter": "First Quarter",
    "waxing crescent": "Waxing Crescent",
    new: "New Moon",
    "new moon": "New Moon",
    "waning crescent": "Waning Crescent",
    "third quarter": "Third Quarter",
    "last quarter": "Third Quarter",
    "waning gibbous": "Waning Gibbous",
  };
  return map[raw.toLowerCase()] ?? "Full Moon";
}
