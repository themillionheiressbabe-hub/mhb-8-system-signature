"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ALL_CARDS,
  CardSelect,
  cardOptionForCode,
  suitColourForCard,
  suitSymbolForCard,
  type CardOption,
} from "@/components/admin/birthprints/CardSelect";
import {
  parseAstroPaste,
  ZODIAC_SIGNS,
} from "@/components/admin/birthprints/parseAstroChart";

export type CalcInput = {
  full_name: string;
  chosen_name: string;
  date_of_birth: string;
  time_of_birth: string;
  time_unknown: boolean;
  place_of_birth: string;
};

export type FieldSource =
  | "Calculated"
  | "From paste"
  | "Edited"
  | "From database";

export type SiderealSnapshot = {
  sun: { sign: string | null; source: FieldSource };
  moon: { sign: string | null; source: FieldSource };
  rising: { sign: string | null; source: FieldSource };
  mercury: { sign: string | null; source: FieldSource };
  venus: { sign: string | null; source: FieldSource };
  mars: { sign: string | null; source: FieldSource };
  jupiter: { sign: string | null; source: FieldSource };
  saturn: { sign: string | null; source: FieldSource };
};

export type TropicalSnapshot = {
  sun: { sign: string; source: FieldSource };
  moon: { sign: string | null; source: FieldSource };
  rising: { sign: string | null; source: FieldSource };
  mc: { sign: string | null; source: FieldSource };
  mercury: { sign: string | null; source: FieldSource };
  venus: { sign: string | null; source: FieldSource };
  mars: { sign: string | null; source: FieldSource };
  jupiter: { sign: string | null; source: FieldSource };
  saturn: { sign: string | null; source: FieldSource };
  chiron: {
    sign: string | null;
    house: number | null;
    retrograde: boolean;
    source: FieldSource;
  };
};

export const LIFE_SPREAD_POSITIONS = [
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Result",
  "Cosmic Lesson",
  "Long Range",
  "Displacement",
] as const;

export type LifeSpreadPosition = (typeof LIFE_SPREAD_POSITIONS)[number];

export const KARMA_POSITIONS = [
  "Karma Card 1",
  "Karma Card 2",
  "Karma Cousin 1",
  "Karma Cousin 2",
  "Past Life 1",
  "Past Life 2",
] as const;

export type KarmaPosition = (typeof KARMA_POSITIONS)[number];

export type DestinyEntry = {
  code: string | null;
  source: FieldSource;
};

export type DestinySnapshot = {
  birthCard: DestinyEntry;
  prc: DestinyEntry;
  lifeSpread: Partial<Record<LifeSpreadPosition, DestinyEntry>>;
  karma: Partial<Record<KarmaPosition, DestinyEntry>>;
};

export type SavePayload = {
  result: CalcResult;
  tropical: TropicalSnapshot;
  sidereal: SiderealSnapshot;
  destiny: DestinySnapshot;
};

export type ChakraState = "Locked In" | "Checked Out";

export type ChakraReading = {
  key: string;
  name: string;
  state: ChakraState;
  driver: string;
};

export type WheelDirection = "North" | "East" | "South" | "West";

export type WheelEntry = {
  role: "Primary" | "Secondary" | "Supporting" | "Lesson";
  direction: WheelDirection;
  meaning: string;
  estimated: boolean;
};

export type CalcResult = {
  tropical: {
    sunSign: string;
    moonSign: string | null;
    risingSign: string | null;
    mcSign: string | null;
    mercurySign: string | null;
    venusSign: string | null;
    marsSign: string | null;
    jupiterSign: string | null;
    saturnSign: string | null;
    chironSign: string | null;
    chironHouse: number | null;
    chironRetrograde: boolean;
  };
  sidereal: {
    sun: string | null;
    moon: string | null;
    rising: string | null;
    mercury: string | null;
    venus: string | null;
    mars: string | null;
    jupiter: string | null;
    saturn: string | null;
    hasTime: boolean;
    hasGeo: boolean;
    failed: boolean;
  };
  destiny: {
    birthCardName: string | null;
    birthCardCode: string | null;
    prcName: string | null;
    prcCode: string | null;
    cardRelationships: {
      karmaCard1: string | null;
      karmaCard2: string | null;
      karmaCousin1: string | null;
      karmaCousin2: string | null;
      pastLife1: string | null;
      pastLife2: string | null;
    };
    lifeSpread: {
      moon: string | null;
      mercury: string | null;
      venus: string | null;
      mars: string | null;
      jupiter: string | null;
      saturn: string | null;
      uranus: string | null;
      neptune: string | null;
      pluto: string | null;
      result: string | null;
      cosmicLesson: string | null;
      longRange: string | null;
      displacement: string | null;
    };
  };
  nameFrequency: {
    lifePath: number;
    expression: number | null;
    soulUrge: number | null;
  };
  numerology: {
    lifePath: number;
    personalYear: number;
  };
  chineseZodiac: {
    animal: string;
    element: string;
  };
  chakras: ChakraReading[];
  medicineWheel: WheelEntry[];
};

export type ClientPick = {
  id: string;
  mhbNumber: string;
  fullName: string;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const INPUT_CLS =
  "w-full bg-[#151B33] rounded-lg outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]";

const INPUT_STYLE: React.CSSProperties = {
  border: "1px solid rgba(201,169,110,0.3)",
  padding: "14px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  color: "#F4F1ED",
};

const LABEL_CLS =
  "block font-sans uppercase tracking-[0.2em] text-gold mb-2";

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
};

export function CalculatorForm({
  clients,
  initial,
  prefillClientName,
  calculate,
  saveToClient,
}: {
  clients: ClientPick[];
  initial?: CalcInput | null;
  prefillClientName?: string | null;
  calculate: (
    input: CalcInput,
  ) => Promise<{ ok: true; result: CalcResult } | { ok: false; error: string }>;
  saveToClient: (
    clientId: string,
    payload: SavePayload,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [chosenName, setChosenName] = useState(initial?.chosen_name ?? "");
  const [dob, setDob] = useState(initial?.date_of_birth ?? "");
  const [time, setTime] = useState(initial?.time_of_birth ?? "");
  const [timeUnknown, setTimeUnknown] = useState(
    initial?.time_unknown ?? false,
  );
  const [place, setPlace] = useState(initial?.place_of_birth ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [tropical, setTropical] = useState<TropicalSnapshot | null>(null);
  const [sidereal, setSidereal] = useState<SiderealSnapshot | null>(null);
  const [destiny, setDestiny] = useState<DestinySnapshot | null>(null);

  // Re-seed editable tropical / sidereal / destiny state when a new
  // calculation result arrives. Edits made before recalculating are
  // deliberately discarded because the underlying chart has changed.
  useEffect(() => {
    if (!result) {
      setTropical(null);
      setSidereal(null);
      setDestiny(null);
      return;
    }
    setTropical({
      sun: { sign: result.tropical.sunSign, source: "Calculated" },
      moon: { sign: result.tropical.moonSign, source: "Calculated" },
      rising: { sign: result.tropical.risingSign, source: "Calculated" },
      mc: { sign: result.tropical.mcSign, source: "Calculated" },
      mercury: { sign: result.tropical.mercurySign, source: "Calculated" },
      venus: { sign: result.tropical.venusSign, source: "Calculated" },
      mars: { sign: result.tropical.marsSign, source: "Calculated" },
      jupiter: { sign: result.tropical.jupiterSign, source: "Calculated" },
      saturn: { sign: result.tropical.saturnSign, source: "Calculated" },
      chiron: {
        sign: result.tropical.chironSign,
        house: result.tropical.chironHouse,
        retrograde: result.tropical.chironRetrograde,
        source: "Calculated",
      },
    });
    setSidereal({
      sun: { sign: result.sidereal.sun, source: "Calculated" },
      moon: { sign: result.sidereal.moon, source: "Calculated" },
      rising: { sign: result.sidereal.rising, source: "Calculated" },
      mercury: { sign: result.sidereal.mercury, source: "Calculated" },
      venus: { sign: result.sidereal.venus, source: "Calculated" },
      mars: { sign: result.sidereal.mars, source: "Calculated" },
      jupiter: { sign: result.sidereal.jupiter, source: "Calculated" },
      saturn: { sign: result.sidereal.saturn, source: "Calculated" },
    });

    // Seed destiny from the calculated birth card + planetary ruling card,
    // plus any rows the action pulled from card_relationships /
    // life_spreads. Each pre-filled slot is tagged "From database" so the
    // admin can see the source.
    function seed(code: string | null, src: FieldSource): DestinyEntry {
      return { code, source: src };
    }
    const birthCardSeed = result.destiny.birthCardCode
      ? seed(result.destiny.birthCardCode, "Calculated")
      : seed(null, "Calculated");
    const prcSeed = result.destiny.prcCode
      ? seed(result.destiny.prcCode, "Calculated")
      : seed(null, "Calculated");

    const lifeSpread: Partial<Record<LifeSpreadPosition, DestinyEntry>> = {};
    const ls = result.destiny.lifeSpread;
    const lifePairs: Array<[LifeSpreadPosition, string | null]> = [
      ["Moon", ls.moon],
      ["Mercury", ls.mercury],
      ["Venus", ls.venus],
      ["Mars", ls.mars],
      ["Jupiter", ls.jupiter],
      ["Saturn", ls.saturn],
      ["Uranus", ls.uranus],
      ["Neptune", ls.neptune],
      ["Pluto", ls.pluto],
      ["Result", ls.result],
      ["Cosmic Lesson", ls.cosmicLesson],
      ["Long Range", ls.longRange],
      ["Displacement", ls.displacement],
    ];
    for (const [pos, code] of lifePairs) {
      lifeSpread[pos] = seed(code, code ? "From database" : "Calculated");
    }

    const karma: Partial<Record<KarmaPosition, DestinyEntry>> = {};
    const rel = result.destiny.cardRelationships;
    const karmaPairs: Array<[KarmaPosition, string | null]> = [
      ["Karma Card 1", rel.karmaCard1],
      ["Karma Card 2", rel.karmaCard2],
      ["Karma Cousin 1", rel.karmaCousin1],
      ["Karma Cousin 2", rel.karmaCousin2],
      ["Past Life 1", rel.pastLife1],
      ["Past Life 2", rel.pastLife2],
    ];
    for (const [pos, code] of karmaPairs) {
      karma[pos] = seed(code, code ? "From database" : "Calculated");
    }

    setDestiny({
      birthCard: birthCardSeed,
      prc: prcSeed,
      lifeSpread,
      karma,
    });
  }, [result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !dob || !place.trim()) {
      setError("Full name, date of birth, and place of birth are required.");
      return;
    }
    startTransition(async () => {
      const res = await calculate({
        full_name: fullName.trim(),
        chosen_name: chosenName.trim(),
        date_of_birth: dob,
        time_of_birth: timeUnknown ? "" : time,
        time_unknown: timeUnknown,
        place_of_birth: place.trim(),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.result);
    });
  }

  function recalculate() {
    setResult(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {prefillClientName ? (
        <div
          className="rounded-xl"
          style={{
            backgroundColor: "rgba(201,169,110,0.10)",
            border: "1px solid rgba(201,169,110,0.35)",
            padding: "14px 18px",
            fontFamily: "var(--font-sans)",
          }}
        >
          <p className={EYEBROW}>Recalculating For</p>
          <p
            className="text-white mt-1"
            style={{ fontSize: "16px", fontWeight: 500 }}
          >
            {prefillClientName}
          </p>
        </div>
      ) : null}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-[#151B33] rounded-3xl"
        style={{
          padding: "32px",
          border: "1px solid rgba(201,169,110,0.15)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </Field>
            <Field label="Chosen Name">
              <input
                type="text"
                value={chosenName}
                onChange={(e) => setChosenName(e.target.value)}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of Birth" required>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </Field>
            <Field label="Time of Birth">
              <input
                type="time"
                value={timeUnknown ? "" : time}
                onChange={(e) => setTime(e.target.value)}
                disabled={timeUnknown}
                className={INPUT_CLS}
                style={{
                  ...INPUT_STYLE,
                  opacity: timeUnknown ? 0.5 : 1,
                }}
              />
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => {
                    setTimeUnknown(e.target.checked);
                    if (e.target.checked) setTime("");
                  }}
                  className="accent-magenta"
                />
                <span
                  className="text-cream/70"
                  style={{ fontSize: "13px" }}
                >
                  I don&rsquo;t know my birth time
                </span>
              </label>
            </Field>
          </div>

          <Field label="Place of Birth" required>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
              placeholder="City, Country"
              className={INPUT_CLS}
              style={INPUT_STYLE}
            />
          </Field>

          {error ? (
            <p
              className="text-magenta"
              style={{ fontSize: "14px" }}
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className={`bg-magenta text-cream rounded-full px-6 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] ${
                pending ? "opacity-60 cursor-wait" : ""
              }`}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {pending ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>
      </form>

      {result ? (
        <section>
          <p className={EYEBROW}>Calculated Birthprint</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tropical ? (
              <TropicalCard
                tropical={tropical}
                onChange={setTropical}
              />
            ) : null}

            {sidereal ? (
              <SiderealCard
                sidereal={sidereal}
                hasTime={result.sidereal.hasTime}
                hasGeo={result.sidereal.hasGeo}
                failed={result.sidereal.failed}
                onChange={setSidereal}
              />
            ) : null}

            {destiny ? (
              <DestinyCard
                destiny={destiny}
                onChange={setDestiny}
              />
            ) : null}

            <ResultCard title="Name Frequency">
              <Row
                label="Life Path"
                value={`${result.nameFrequency.lifePath}`}
              />
              <Row
                label="Expression"
                value={
                  result.nameFrequency.expression !== null
                    ? `${result.nameFrequency.expression}`
                    : "Requires full name"
                }
              />
              <Row
                label="Soul Urge"
                value={
                  result.nameFrequency.soulUrge !== null
                    ? `${result.nameFrequency.soulUrge}`
                    : "Requires full name"
                }
              />
            </ResultCard>

            <ResultCard title="Numerology">
              <Row label="Life Path" value={`${result.numerology.lifePath}`} />
              <Row
                label="Personal Year"
                value={`${result.numerology.personalYear}`}
              />
            </ResultCard>

            <ResultCard title="Chinese Zodiac">
              <Row label="Animal" value={result.chineseZodiac.animal} />
              <Row label="Element" value={result.chineseZodiac.element} />
            </ResultCard>

            <ResultCard title="Chakras">
              <ChakrasList chakras={result.chakras} />
            </ResultCard>

            <ResultCard title="Medicine Wheel">
              <MedicineWheelGrid entries={result.medicineWheel} />
            </ResultCard>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={recalculate}
              className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Recalculate
            </button>
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Save to Client
            </button>
          </div>
        </section>
      ) : null}

      {saveOpen && result ? (
        <SaveToClientModal
          clients={clients}
          onCancel={() => setSaveOpen(false)}
          onSave={async (clientId) => {
            if (!tropical || !sidereal || !destiny) {
              return "No calculation to save.";
            }
            const res = await saveToClient(clientId, {
              result,
              tropical,
              sidereal,
              destiny,
            });
            if (res.ok) {
              setSaveToast("Birthprint saved.");
              window.setTimeout(() => setSaveToast(null), 2400);
              setSaveOpen(false);
            } else {
              return res.error;
            }
          }}
        />
      ) : null}

      {saveToast ? (
        <div
          className="fixed bottom-7 right-7 z-[110] bg-emerald text-white rounded-full px-4 py-2"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 0 24px rgba(45,155,110,0.4)",
          }}
          role="status"
          aria-live="polite"
        >
          {saveToast}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL_CLS} style={LABEL_STYLE}>
        {label}
        {required ? <span className="text-magenta ml-1">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-[#151B33] rounded-2xl"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>{title}</p>
      <div className="mt-3 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gold/10 pb-1.5">
      <span
        className="text-cream/55 uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10.5px",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        className="text-cream text-right"
        style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
      >
        {value}
      </span>
    </div>
  );
}

function SaveToClientModal({
  clients,
  onCancel,
  onSave,
}: {
  clients: ClientPick[];
  onCancel: () => void;
  onSave: (clientId: string) => Promise<string | undefined>;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = search.trim()
    ? clients
        .filter(
          (c) =>
            c.fullName.toLowerCase().includes(search.toLowerCase()) ||
            c.mhbNumber.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 10)
    : clients.slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#151B33] rounded-2xl w-full max-w-md flex flex-col gap-4"
        style={{
          padding: "28px",
          border: "1px solid rgba(201,169,110,0.25)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className={EYEBROW}>Save to Client</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or MHB number..."
          className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
          style={{ fontSize: "14px" }}
        />

        <ul className="max-h-60 overflow-y-auto flex flex-col gap-1">
          {matches.length === 0 ? (
            <li
              className="text-cream/40 italic px-2 py-2"
              style={{ fontSize: "13px" }}
            >
              No clients match.
            </li>
          ) : null}
          {matches.map((c) => {
            const active = selectedId === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 transition-colors"
                  style={{
                    backgroundColor: active
                      ? "rgba(181,30,90,0.10)"
                      : "transparent",
                    borderLeft: active
                      ? "3px solid #B51E5A"
                      : "3px solid transparent",
                  }}
                >
                  <span
                    className="text-gold"
                    style={{
                      fontFamily:
                        "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                      fontSize: "12px",
                    }}
                  >
                    {c.mhbNumber}
                  </span>
                  <span
                    className="text-cream"
                    style={{ fontSize: "14px" }}
                  >
                    {c.fullName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          href="/admin/clients/new"
          className="text-gold hover:text-gold-bright transition-colors text-center"
          style={{ fontSize: "12px", textDecoration: "underline" }}
        >
          Or create a new client first
        </Link>

        {error ? (
          <p
            className="text-magenta"
            style={{ fontSize: "13px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId || pending}
            onClick={() => {
              if (!selectedId) return;
              setError(null);
              startTransition(async () => {
                const errMsg = await onSave(selectedId);
                if (errMsg) setError(errMsg);
              });
            }}
            className={`bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] ${
              !selectedId || pending ? "opacity-60 cursor-not-allowed" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending ? "Saving..." : "Save Birthprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

const DIRECTION_COLOUR: Record<WheelDirection, string> = {
  North: "#C9A96E",
  East: "#B51E5A",
  South: "#2D9B6E",
  West: "#A78BFA",
};

function ChakrasList({ chakras }: { chakras: ChakraReading[] }) {
  if (chakras.length === 0) {
    return (
      <p
        className="text-cream/45 italic"
        style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
      >
        No data yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {chakras.map((c) => {
        const locked = c.state === "Locked In";
        return (
          <div
            key={c.key}
            className="flex items-center justify-between gap-3 border-b border-gold/10 pb-2 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-cream truncate"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                }}
              >
                {c.name}
              </span>
              <span
                className="text-gold truncate"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                }}
              >
                {c.driver}
              </span>
            </div>
            <span
              className="inline-flex shrink-0 rounded-full px-2.5 py-1 uppercase tracking-[0.18em]"
              style={{
                backgroundColor: locked
                  ? "rgba(45,155,110,0.15)"
                  : "rgba(181,30,90,0.15)",
                color: locked ? "#2D9B6E" : "#D63F7E",
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              {c.state}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MedicineWheelGrid({ entries }: { entries: WheelEntry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {entries.map((e) => (
        <div
          key={e.role}
          className="rounded-lg"
          style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            borderLeft: `3px solid ${DIRECTION_COLOUR[e.direction]}`,
            border: "1px solid rgba(201,169,110,0.15)",
            borderLeftWidth: "3px",
            borderLeftColor: DIRECTION_COLOUR[e.direction],
            padding: "10px 12px",
          }}
        >
          <p
            className="font-sans uppercase tracking-[0.25em] text-gold"
            style={{ fontSize: "10px", fontWeight: 600 }}
          >
            {e.role}
          </p>
          <p
            className="serif-it text-white mt-1"
            style={{ fontSize: "18px", lineHeight: 1.2 }}
          >
            {e.direction}
          </p>
          <p
            className="text-cream/80 mt-0.5"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {e.meaning}
          </p>
          {e.estimated ? (
            <p
              className="text-white/45 mt-1"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              Estimated (birth time needed for full calculation)
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TropicalCard({
  tropical,
  onChange,
}: {
  tropical: TropicalSnapshot;
  onChange: (next: TropicalSnapshot) => void;
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  function update<K extends keyof TropicalSnapshot>(
    key: K,
    sign: string | null,
    source: FieldSource,
  ) {
    const current = tropical[key];
    if (key === "chiron") {
      onChange({
        ...tropical,
        chiron: { ...tropical.chiron, sign, source },
      });
      return;
    }
    onChange({
      ...tropical,
      [key]: {
        ...current,
        sign,
        source,
      },
    } as TropicalSnapshot);
  }

  function handleParse() {
    const parsed = parseAstroPaste(pasteText);
    const next: TropicalSnapshot = { ...tropical };
    const mapping: Array<{
      key: keyof TropicalSnapshot;
      value: string | null;
    }> = [
      { key: "sun", value: parsed.sun },
      { key: "moon", value: parsed.moon },
      { key: "rising", value: parsed.rising },
      { key: "mc", value: parsed.mc },
      { key: "mercury", value: parsed.mercury },
      { key: "venus", value: parsed.venus },
      { key: "mars", value: parsed.mars },
      { key: "jupiter", value: parsed.jupiter },
      { key: "saturn", value: parsed.saturn },
    ];
    for (const m of mapping) {
      if (m.value) {
        if (m.key === "sun") {
          next.sun = { sign: m.value, source: "From paste" };
        } else {
          next[m.key] = {
            ...(next[m.key] as { sign: string | null; source: FieldSource }),
            sign: m.value,
            source: "From paste",
          } as never;
        }
      }
    }
    if (parsed.chiron) {
      next.chiron = {
        ...next.chiron,
        sign: parsed.chiron,
        source: "From paste",
      };
    }
    onChange(next);
  }

  return (
    <div
      className="bg-[#151B33] rounded-2xl"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>Tropical Astrology</p>
      <div className="mt-3 flex flex-col gap-1.5">
        <SignField
          label="Sun"
          sign={tropical.sun.sign}
          source={tropical.sun.source}
          onChange={(s) => update("sun", s, "Edited")}
        />
        <SignField
          label="Moon"
          sign={tropical.moon.sign}
          source={tropical.moon.source}
          missingLabel="Requires time of birth"
          onChange={(s) => update("moon", s, "Edited")}
        />
        <SignField
          label="Rising"
          sign={tropical.rising.sign}
          source={tropical.rising.source}
          missingLabel="Requires time and place"
          onChange={(s) => update("rising", s, "Edited")}
        />
        <SignField
          label="MC"
          sign={tropical.mc.sign}
          source={tropical.mc.source}
          missingLabel="Requires time and place"
          onChange={(s) => update("mc", s, "Edited")}
        />
        <SignField
          label="Mercury"
          sign={tropical.mercury.sign}
          source={tropical.mercury.source}
          onChange={(s) => update("mercury", s, "Edited")}
        />
        <SignField
          label="Venus"
          sign={tropical.venus.sign}
          source={tropical.venus.source}
          onChange={(s) => update("venus", s, "Edited")}
        />
        <SignField
          label="Mars"
          sign={tropical.mars.sign}
          source={tropical.mars.source}
          onChange={(s) => update("mars", s, "Edited")}
        />
        <SignField
          label="Jupiter"
          sign={tropical.jupiter.sign}
          source={tropical.jupiter.source}
          onChange={(s) => update("jupiter", s, "Edited")}
        />
        <SignField
          label="Saturn"
          sign={tropical.saturn.sign}
          source={tropical.saturn.source}
          onChange={(s) => update("saturn", s, "Edited")}
        />
        <ChironField
          chiron={tropical.chiron}
          onChange={(sign) =>
            onChange({
              ...tropical,
              chiron: { ...tropical.chiron, sign, source: "Edited" },
            })
          }
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gold/10">
        <button
          type="button"
          onClick={() => setPasteOpen((p) => !p)}
          className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.25em]"
          style={{ fontSize: "10.5px", fontWeight: 600 }}
        >
          Paste From Astro.com
          <span
            aria-hidden="true"
            style={{
              transform: pasteOpen ? "rotate(180deg)" : undefined,
              transition: "transform 200ms",
              fontSize: "10px",
            }}
          >
            ▾
          </span>
        </button>
        {pasteOpen ? (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={6}
              placeholder="Paste your Astro.com chart data here. The system will try to read it automatically. You can correct any field manually after."
              className="w-full bg-[#0D1220] rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
              style={{
                border: "1px solid rgba(201,169,110,0.3)",
                padding: "12px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "#F4F1ED",
                lineHeight: 1.5,
                minHeight: "160px",
                resize: "vertical",
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParse}
                className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Parse and Fill
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const SOURCE_COLOUR: Record<FieldSource, string> = {
  Calculated: "rgba(255,255,255,0.4)",
  "From paste": "#C9A96E",
  Edited: "#D63F7E",
  "From database": "#2D9B6E",
};

function SourceLabel({ source }: { source: FieldSource }) {
  return (
    <span
      className="uppercase tracking-[0.18em]"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "9.5px",
        fontWeight: 500,
        color: SOURCE_COLOUR[source],
      }}
    >
      {source}
    </span>
  );
}

function SignField({
  label,
  sign,
  source,
  missingLabel,
  onChange,
}: {
  label: string;
  sign: string | null;
  source: FieldSource;
  missingLabel?: string;
  onChange: (next: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex justify-between gap-3 border-b border-gold/10 pb-1.5">
      <span
        className="text-cream/55 uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10.5px",
          fontWeight: 500,
          minWidth: "70px",
        }}
      >
        {label}
      </span>
      <span className="flex items-center gap-2 text-right">
        <SourceLabel source={source} />
        {editing ? (
          <select
            value={sign ?? ""}
            autoFocus
            onChange={(e) => {
              const v = e.target.value || null;
              onChange(v);
              setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-md px-2 py-1 text-cream outline-none focus:border-gold/60"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
            }}
          >
            <option value="">Clear</option>
            {ZODIAC_SIGNS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-cream hover:text-gold transition-colors"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              textAlign: "right",
            }}
          >
            {sign ?? missingLabel ?? "—"}
          </button>
        )}
      </span>
    </div>
  );
}

function ChironField({
  chiron,
  onChange,
}: {
  chiron: TropicalSnapshot["chiron"];
  onChange: (sign: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const houseLabel =
    chiron.house !== null ? ordinal(chiron.house) + " house" : null;
  const retroLabel = chiron.retrograde ? "Rx" : null;
  const parts = [
    chiron.sign,
    retroLabel,
    houseLabel,
  ].filter(Boolean);
  const display = parts.length > 0 ? parts.join(" ") : "Calculation failed";

  return (
    <div className="flex justify-between gap-3 border-b border-gold/10 pb-1.5">
      <span
        className="text-cream/55 uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10.5px",
          fontWeight: 500,
          minWidth: "70px",
        }}
      >
        Chiron
      </span>
      <span className="flex items-center gap-2 text-right">
        <SourceLabel source={chiron.source} />
        {editing ? (
          <select
            value={chiron.sign ?? ""}
            autoFocus
            onChange={(e) => {
              onChange(e.target.value || null);
              setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-md px-2 py-1 text-cream outline-none focus:border-gold/60"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
            }}
          >
            <option value="">Clear</option>
            {ZODIAC_SIGNS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-cream hover:text-gold transition-colors"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              textAlign: "right",
            }}
          >
            {display}
          </button>
        )}
      </span>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function SiderealCard({
  sidereal,
  hasTime,
  hasGeo,
  failed,
  onChange,
}: {
  sidereal: SiderealSnapshot;
  hasTime: boolean;
  hasGeo: boolean;
  failed: boolean;
  onChange: (next: SiderealSnapshot) => void;
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  function update<K extends keyof SiderealSnapshot>(
    key: K,
    sign: string | null,
    source: FieldSource,
  ) {
    onChange({
      ...sidereal,
      [key]: { sign, source },
    });
  }

  function handleParse() {
    const parsed = parseAstroPaste(pasteText);
    const next: SiderealSnapshot = { ...sidereal };
    const mapping: Array<{
      key: keyof SiderealSnapshot;
      value: string | null;
    }> = [
      { key: "sun", value: parsed.sun },
      { key: "moon", value: parsed.moon },
      { key: "rising", value: parsed.rising },
      { key: "mercury", value: parsed.mercury },
      { key: "venus", value: parsed.venus },
      { key: "mars", value: parsed.mars },
      { key: "jupiter", value: parsed.jupiter },
      { key: "saturn", value: parsed.saturn },
    ];
    for (const m of mapping) {
      if (m.value) {
        next[m.key] = { sign: m.value, source: "From paste" };
      }
    }
    onChange(next);
  }

  function missingLabelFor(
    key: keyof SiderealSnapshot,
  ): string | undefined {
    if (key === "moon" && !hasTime) return "Requires birth time";
    if (key === "rising" && (!hasTime || !hasGeo))
      return "Requires time and place";
    if (failed) return "Calculation failed";
    return undefined;
  }

  return (
    <div
      className="bg-[#151B33] rounded-2xl"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>Sidereal Astrology</p>
      <div className="mt-3 flex flex-col gap-1.5">
        <SignField
          label="Sun"
          sign={sidereal.sun.sign}
          source={sidereal.sun.source}
          missingLabel={missingLabelFor("sun")}
          onChange={(s) => update("sun", s, "Edited")}
        />
        <SignField
          label="Moon"
          sign={sidereal.moon.sign}
          source={sidereal.moon.source}
          missingLabel={missingLabelFor("moon")}
          onChange={(s) => update("moon", s, "Edited")}
        />
        <SignField
          label="Rising"
          sign={sidereal.rising.sign}
          source={sidereal.rising.source}
          missingLabel={missingLabelFor("rising")}
          onChange={(s) => update("rising", s, "Edited")}
        />
        <SignField
          label="Mercury"
          sign={sidereal.mercury.sign}
          source={sidereal.mercury.source}
          missingLabel={missingLabelFor("mercury")}
          onChange={(s) => update("mercury", s, "Edited")}
        />
        <SignField
          label="Venus"
          sign={sidereal.venus.sign}
          source={sidereal.venus.source}
          missingLabel={missingLabelFor("venus")}
          onChange={(s) => update("venus", s, "Edited")}
        />
        <SignField
          label="Mars"
          sign={sidereal.mars.sign}
          source={sidereal.mars.source}
          missingLabel={missingLabelFor("mars")}
          onChange={(s) => update("mars", s, "Edited")}
        />
        <SignField
          label="Jupiter"
          sign={sidereal.jupiter.sign}
          source={sidereal.jupiter.source}
          missingLabel={missingLabelFor("jupiter")}
          onChange={(s) => update("jupiter", s, "Edited")}
        />
        <SignField
          label="Saturn"
          sign={sidereal.saturn.sign}
          source={sidereal.saturn.source}
          missingLabel={missingLabelFor("saturn")}
          onChange={(s) => update("saturn", s, "Edited")}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gold/10">
        <button
          type="button"
          onClick={() => setPasteOpen((p) => !p)}
          className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.25em]"
          style={{ fontSize: "10.5px", fontWeight: 600 }}
        >
          Paste From Astro.com
          <span
            aria-hidden="true"
            style={{
              transform: pasteOpen ? "rotate(180deg)" : undefined,
              transition: "transform 200ms",
              fontSize: "10px",
            }}
          >
            ▾
          </span>
        </button>
        {pasteOpen ? (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={6}
              placeholder="Paste your Astro.com chart data here. The system will try to read it automatically. You can correct any field manually after."
              className="w-full bg-[#0D1220] rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
              style={{
                border: "1px solid rgba(201,169,110,0.3)",
                padding: "12px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "#F4F1ED",
                lineHeight: 1.5,
                minHeight: "160px",
                resize: "vertical",
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParse}
                className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Parse and Fill
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DestinyCard({
  destiny,
  onChange,
}: {
  destiny: DestinySnapshot;
  onChange: (next: DestinySnapshot) => void;
}) {
  const [lifeOpen, setLifeOpen] = useState(false);
  const [karmaOpen, setKarmaOpen] = useState(false);

  function setBirthCard(code: string | null) {
    onChange({
      ...destiny,
      birthCard: { code, source: "Edited" },
    });
  }
  function setPrc(code: string | null) {
    onChange({
      ...destiny,
      prc: { code, source: "Edited" },
    });
  }
  function setLife(pos: LifeSpreadPosition, code: string | null) {
    onChange({
      ...destiny,
      lifeSpread: {
        ...destiny.lifeSpread,
        [pos]: { code, source: "Edited" },
      },
    });
  }
  function setKarma(pos: KarmaPosition, code: string | null) {
    onChange({
      ...destiny,
      karma: {
        ...destiny.karma,
        [pos]: { code, source: "Edited" },
      },
    });
  }

  return (
    <div
      className="bg-[#151B33] rounded-2xl"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>Destiny Cards</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DestinyField
          label="Birth Card"
          entry={destiny.birthCard}
          onChange={setBirthCard}
        />
        <DestinyField
          label="PRC"
          entry={destiny.prc}
          placeholder="Unknown"
          onChange={setPrc}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gold/10">
        <button
          type="button"
          onClick={() => setLifeOpen((p) => !p)}
          className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.25em]"
          style={{ fontSize: "10.5px", fontWeight: 600 }}
        >
          Life Spread
          <span
            aria-hidden="true"
            style={{
              transform: lifeOpen ? "rotate(180deg)" : undefined,
              transition: "transform 200ms",
              fontSize: "10px",
            }}
          >
            ▾
          </span>
        </button>
        {lifeOpen ? (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LIFE_SPREAD_POSITIONS.map((pos) => (
              <DestinyField
                key={pos}
                label={pos}
                entry={
                  destiny.lifeSpread[pos] ?? {
                    code: null,
                    source: "Calculated",
                  }
                }
                onChange={(code) => setLife(pos, code)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-gold/10">
        <button
          type="button"
          onClick={() => setKarmaOpen((p) => !p)}
          className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.25em]"
          style={{ fontSize: "10.5px", fontWeight: 600 }}
        >
          Karma And Past Life
          <span
            aria-hidden="true"
            style={{
              transform: karmaOpen ? "rotate(180deg)" : undefined,
              transition: "transform 200ms",
              fontSize: "10px",
            }}
          >
            ▾
          </span>
        </button>
        {karmaOpen ? (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {KARMA_POSITIONS.map((pos) => (
              <DestinyField
                key={pos}
                label={pos}
                entry={
                  destiny.karma[pos] ?? {
                    code: null,
                    source: "Calculated",
                  }
                }
                onChange={(code) => setKarma(pos, code)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DestinyField({
  label,
  entry,
  placeholder,
  onChange,
}: {
  label: string;
  entry: DestinyEntry;
  placeholder?: string;
  onChange: (code: string | null) => void;
}) {
  // Only show a source label when the field carries a value or has been
  // edited; an empty "Calculated" slot stays clean so it doesn't shout.
  const showSource = entry.code !== null || entry.source !== "Calculated";
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p
          className="text-gold uppercase tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        {showSource ? <SourceLabel source={entry.source} /> : null}
      </div>
      <CardSelect
        value={entry.code}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-gold uppercase tracking-[0.2em] mb-1.5"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10px",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function matchCardByName(name: string): CardOption | null {
  const lower = name.toLowerCase().trim();
  // Strip parenthetical descriptors that the seed names carry.
  const cleaned = lower.replace(/\s*\(.*$/, "").trim();
  for (const c of ALL_CARDS) {
    if (c.name.toLowerCase() === cleaned) return c;
  }
  return null;
}

// Helpers below are referenced by props to keep the unused-import linter
// happy while we plumb richer destiny features in.
void cardOptionForCode;
void suitColourForCard;
void suitSymbolForCard;
