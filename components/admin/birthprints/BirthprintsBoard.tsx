"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type BirthprintEntry = {
  clientId: string;
  mhbNumber: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string | null;
  createdAt: string;
  lenses: {
    tropicalSun: string | null;
    siderealSun: string | null;
    birthCardName: string | null;
    expressionNumber: number | null;
    lifePath: number | null;
    chineseZodiac: string | null;
    dominantChakra: string | null;
    medicineWheelDirection: string | null;
  };
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDob(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function chipsPopulatedCount(b: BirthprintEntry): number {
  const l = b.lenses;
  let n = 0;
  if (l.tropicalSun) n++;
  if (l.siderealSun) n++;
  if (l.birthCardName) n++;
  if (l.expressionNumber !== null) n++;
  if (l.lifePath !== null) n++;
  if (l.chineseZodiac) n++;
  if (l.dominantChakra) n++;
  if (l.medicineWheelDirection) n++;
  return n;
}

function statusFor(
  count: number,
): { label: string; bg: string; text: string } {
  if (count === 8)
    return {
      label: "Birthprint Complete",
      bg: "rgba(45,155,110,0.15)",
      text: "#2D9B6E",
    };
  if (count === 0)
    return {
      label: "Pending",
      bg: "rgba(167,139,250,0.15)",
      text: "#A78BFA",
    };
  return {
    label: "Partial",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  };
}

export function BirthprintsBoard({
  entries,
  deleteBirthprint,
}: {
  entries: BirthprintEntry[];
  deleteBirthprint: (clientId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (b) =>
        b.fullName.toLowerCase().includes(q) ||
        b.mhbNumber.toLowerCase().includes(q),
    );
  }, [entries, search]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Orbit size={120} suit="hearts" compact showCardinals={false} />
        <p className={`${EYEBROW} mt-6`}>No birthprints yet</p>
        <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
          Birthprints appear here once clients complete intake.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Birthprints</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            All birthprints.
          </h1>
        </div>
        <Link
          href="/admin/birthprints/calculator"
          className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          + Calculate Birthprint
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by client name or MHB number..."
        className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 w-full"
        style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
      />

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p
            className="text-cream/40 italic py-4 text-center"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            No matches.
          </p>
        ) : null}
        {filtered.map((b) => (
          <BirthprintCard
            key={b.clientId}
            entry={b}
            onDelete={() => setDeletingId(b.clientId)}
          />
        ))}
      </div>

      {(() => {
        const deleting = deletingId
          ? entries.find((e) => e.clientId === deletingId) ?? null
          : null;
        if (!deleting) return null;
        return (
          <ConfirmModal
            title="Delete birthprint"
            body={`This will delete the stored birthprint for ${deleting.fullName}. It can be recalculated from the calculator. Delete anyway?`}
            confirmLabel="Delete"
            onCancel={() => setDeletingId(null)}
            onConfirm={async () => {
              await deleteBirthprint(deleting.clientId);
              setDeletingId(null);
            }}
          />
        );
      })()}
    </div>
  );
}

function BirthprintCard({
  entry: b,
  onDelete,
}: {
  entry: BirthprintEntry;
  onDelete: () => void;
}) {
  const count = chipsPopulatedCount(b);
  const status = statusFor(count);
  const chips: { label: string; value: string | null }[] = [
    { label: "Tropical", value: b.lenses.tropicalSun },
    { label: "Sidereal", value: b.lenses.siderealSun },
    { label: "Destiny", value: b.lenses.birthCardName },
    {
      label: "Name Freq",
      value:
        b.lenses.expressionNumber !== null
          ? `${b.lenses.expressionNumber}`
          : null,
    },
    {
      label: "Numerology",
      value: b.lenses.lifePath !== null ? `${b.lenses.lifePath}` : null,
    },
    { label: "Chinese", value: b.lenses.chineseZodiac },
    { label: "Chakras", value: b.lenses.dominantChakra },
    {
      label: "Medicine Wheel",
      value: b.lenses.medicineWheelDirection,
    },
  ];

  return (
    <div
      className="bg-[#151B33] rounded-2xl grid grid-cols-1 md:grid-cols-[60px_1fr_200px] gap-5"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
      }}
    >
      <div className="flex md:justify-center md:items-start">
        <Orbit size={52} suit={b.suit} compact showCardinals={false} />
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <span
          className="text-gold"
          style={{
            fontFamily:
              "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
            fontSize: "12px",
            letterSpacing: "0.05em",
          }}
        >
          {b.mhbNumber}
        </span>
        <h2
          className="serif-it text-white"
          style={{ fontSize: "22px", lineHeight: 1.2 }}
        >
          {b.fullName}
        </h2>
        <p
          className="text-cream/80"
          style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
        >
          DOB {formatDob(b.dateOfBirth)}
          {b.placeOfBirth ? ` · ${b.placeOfBirth}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex flex-col rounded-lg px-2.5 py-1.5"
              style={{
                border: "1px solid rgba(201,169,110,0.3)",
                backgroundColor: c.value
                  ? "rgba(201,169,110,0.06)"
                  : "rgba(255,255,255,0.02)",
                fontFamily: "var(--font-sans)",
                opacity: c.value ? 1 : 0.55,
              }}
            >
              <span
                className="text-gold uppercase"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  fontWeight: 600,
                }}
              >
                {c.label}
              </span>
              <span
                className="text-white"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {c.value ?? "—"}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-stretch md:items-end gap-2">
        <span
          className="inline-flex self-start md:self-end rounded-full px-3 py-1 uppercase tracking-[0.18em]"
          style={{
            backgroundColor: status.bg,
            color: status.text,
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {status.label}
        </span>
        <span
          className="text-white/45 md:text-right"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
          }}
        >
          Calculated {formatDate(b.createdAt)}
        </span>
        <Link
          href={`/admin/clients/${b.clientId}`}
          className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          View Client
        </Link>
        <Link
          href={`/admin/birthprints/calculator?client=${b.clientId}`}
          className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          Recalculate
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="text-rose border border-rose/40 rounded-full px-4 py-1.5 hover:bg-rose/10 transition-colors uppercase tracking-[0.18em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          Delete Birthprint
        </button>
      </div>
    </div>
  );
}
