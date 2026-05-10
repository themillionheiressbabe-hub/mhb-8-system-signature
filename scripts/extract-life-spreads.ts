import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

const CARD_DIR = path.join(process.cwd(), "docs", "cardology");
const OUTPUT_FILE = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260504001_life_spreads.sql",
);

function nameToCode(name: string): string {
  const cleaned = name.replace(/[♠♥♦♣]/g, "").trim();

  const valueMap: Record<string, string> = {
    Ace: "A",
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    Ten: "10",
    Jack: "J",
    Queen: "Q",
    King: "K",
  };
  const suitMap: Record<string, string> = {
    Spades: "S",
    Hearts: "H",
    Diamonds: "D",
    Clubs: "C",
  };

  const parts = cleaned.split(" of ");
  if (parts.length !== 2) return cleaned;

  const value = valueMap[parts[0].trim()] || parts[0].trim();
  const suit = suitMap[parts[1].trim()] || parts[1].trim();
  return value + suit;
}

function parseCardValue(raw: string): string | null {
  if (!raw || raw === "—" || raw === "-" || raw.trim() === "") return null;

  if (raw.includes(" of ")) return nameToCode(raw.trim());

  const suitSymbols: Record<string, string> = {
    "♠": "S",
    "♥": "H",
    "♦": "D",
    "♣": "C",
  };
  let result = raw.trim();
  for (const [symbol, code] of Object.entries(suitSymbols)) {
    if (result.includes(symbol)) {
      result = result.replace(symbol, "") + code;
      return result.trim();
    }
  }

  return raw.trim();
}

const sqlLines: string[] = [
  "-- Life Spread data for all 52 cards",
  "-- Generated from docs/cardology/ HTML files",
  "",
  "CREATE TABLE IF NOT EXISTS life_spreads (",
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
  "  card_code TEXT NOT NULL UNIQUE,",
  "  moon TEXT,",
  "  mercury TEXT,",
  "  venus TEXT,",
  "  mars TEXT,",
  "  jupiter TEXT,",
  "  saturn TEXT,",
  "  uranus TEXT,",
  "  neptune TEXT,",
  "  pluto TEXT,",
  "  result TEXT,",
  "  cosmic_lesson TEXT,",
  "  cosmic_reward TEXT,",
  "  personality_card TEXT,",
  "  created_at TIMESTAMPTZ DEFAULT NOW()",
  ");",
  "",
  "CREATE INDEX IF NOT EXISTS idx_life_spreads_card_code ON life_spreads(card_code);",
  "",
  "ALTER TABLE life_spreads ENABLE ROW LEVEL SECURITY;",
  'CREATE POLICY "Anon read" ON life_spreads FOR SELECT USING (true);',
  'CREATE POLICY "Service role full" ON life_spreads FOR ALL USING (true);',
  "",
  "-- Seed data",
];

const files = fs
  .readdirSync(CARD_DIR)
  .filter((f) => f.endsWith(".html") && f !== "THE-JOKER.html");

for (const file of files) {
  const html = fs.readFileSync(path.join(CARD_DIR, file), "utf-8");
  const $ = cheerio.load(html);

  const cardTitle = $("h1.card-title").text().replace(/\s+/g, " ").trim();
  const cardCode = nameToCode(cardTitle);

  const cells: Record<string, string | null> = {};
  $(".spread-cell").each((_, el) => {
    const key = $(el).find(".spread-key").text().trim().toLowerCase();
    const val = $(el).find(".spread-val").text().trim();
    cells[key] = parseCardValue(val);
  });

  const moon = cells["moon"] ? `'${cells["moon"]}'` : "NULL";
  const mercury = cells["mercury"] ? `'${cells["mercury"]}'` : "NULL";
  const venus = cells["venus"] ? `'${cells["venus"]}'` : "NULL";
  const mars = cells["mars"] ? `'${cells["mars"]}'` : "NULL";
  const jupiter = cells["jupiter"] ? `'${cells["jupiter"]}'` : "NULL";
  const saturn = cells["saturn"] ? `'${cells["saturn"]}'` : "NULL";
  const uranus = cells["uranus"] ? `'${cells["uranus"]}'` : "NULL";
  const neptune = cells["neptune"] ? `'${cells["neptune"]}'` : "NULL";
  const pluto = cells["pluto"] ? `'${cells["pluto"]}'` : "NULL";
  const result = cells["result"] ? `'${cells["result"]}'` : "NULL";
  const cosmicLesson = cells["cosmic lesson"]
    ? `'${cells["cosmic lesson"]}'`
    : "NULL";
  const cosmicReward = cells["cosmic reward"]
    ? `'${cells["cosmic reward"]}'`
    : "NULL";
  const personality = cells["personality card"]
    ? `'${cells["personality card"]}'`
    : "NULL";

  sqlLines.push(
    `INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)`,
    `VALUES ('${cardCode}', ${moon}, ${mercury}, ${venus}, ${mars}, ${jupiter}, ${saturn}, ${uranus}, ${neptune}, ${pluto}, ${result}, ${cosmicLesson}, ${cosmicReward}, ${personality})`,
    `ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;`,
    "",
  );
}

fs.writeFileSync(OUTPUT_FILE, sqlLines.join("\n"));
console.log(`Written ${files.length} cards to ${OUTPUT_FILE}`);
