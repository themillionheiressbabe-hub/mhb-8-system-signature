"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type IntakeEdit = {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string | null;
  placeOfBirth: string;
};

export type IntakeData = {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  latitude: number | null;
  longitude: number | null;
  isJoker: boolean;
};

export type EnrichedIntake = {
  id: string;
  orderNumber: string;
  profileId: string;
  clientId: string | null;
  productSlug: string;
  productName: string;
  engine: number | null;
  createdAt: string;
  clientName: string;
  intake: IntakeData | null;
  hasReport: boolean;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const ENGINE_FILTERS = [0, 1, 2, 3, 4, 6, 7];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type IntakeStatusKey = "awaiting" | "received" | "complete";

const INTAKE_STATUS: Record<
  IntakeStatusKey,
  { label: string; bg: string; text: string }
> = {
  awaiting: {
    label: "Awaiting Intake",
    bg: "rgba(167,139,250,0.15)",
    text: "#A78BFA",
  },
  received: {
    label: "Intake Received",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  complete: {
    label: "Intake Complete",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
};

function intakeStatus(o: EnrichedIntake): IntakeStatusKey {
  if (o.hasReport) return "complete";
  if (o.clientId && o.intake) return "received";
  return "awaiting";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function daysWaitingStyle(days: number): { color: string; warn: boolean } {
  if (days <= 2) return { color: "#C9A96E", warn: false };
  if (days <= 5) return { color: "#F59E0B", warn: false };
  return { color: "#B51E5A", warn: true };
}

export function IntakeBoard({
  intakes,
  markComplete,
  saveIntake,
  deleteOrder,
}: {
  intakes: EnrichedIntake[];
  markComplete: (
    orderId: string,
    profileId: string,
    productSlug: string,
    clientId: string,
  ) => Promise<void>;
  saveIntake: (
    orderId: string,
    profileId: string,
    clientId: string | null,
    input: IntakeEdit,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteOrder: (orderId: string) => Promise<void>;
}) {
  const [engineFilter, setEngineFilter] = useState<number | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (engineFilter === "all") return intakes;
    return intakes.filter((o) => (o.engine ?? 0) === engineFilter);
  }, [intakes, engineFilter]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  if (intakes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Pending Intake</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            Waiting for client data.
          </h1>
        </div>
        <span
          className="bg-magenta text-cream rounded-full uppercase tracking-[0.18em]"
          style={{
            padding: "8px 18px",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          {intakes.length}{" "}
          {intakes.length === 1 ? "intake" : "intakes"}
        </span>
      </div>

      {/* Engine filters */}
      <div className="flex flex-wrap gap-2">
        {ENGINE_FILTERS.map((e) => (
          <FilterPill
            key={e}
            label={e === 0 ? "All" : `Engine ${e}`}
            active={engineFilter === (e === 0 ? "all" : e)}
            onClick={() => setEngineFilter(e === 0 ? "all" : e)}
          />
        ))}
      </div>

      {/* Intake queue */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p
            className="text-cream/40 italic py-6 text-center"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Nothing matches this filter.
          </p>
        ) : null}
        {filtered.map((o) => (
          <IntakeCard
            key={o.id}
            intake={o}
            expanded={expandedId === o.id}
            onToggle={() =>
              setExpandedId(expandedId === o.id ? null : o.id)
            }
            onReminder={() => showToast("Reminder sent")}
            onMarkComplete={async () => {
              if (!o.clientId) return;
              await markComplete(
                o.id,
                o.profileId,
                o.productSlug,
                o.clientId,
              );
            }}
            onEditIntake={() => setEditingId(o.id)}
            onDelete={() => setDeletingId(o.id)}
          />
        ))}
      </div>

      {(() => {
        const editing = editingId
          ? intakes.find((i) => i.id === editingId) ?? null
          : null;
        if (!editing) return null;
        return (
          <IntakeEditModal
            intake={editing}
            onCancel={() => setEditingId(null)}
            onSave={async (input) => {
              const res = await saveIntake(
                editing.id,
                editing.profileId,
                editing.clientId,
                input,
              );
              if (res.ok) {
                setEditingId(null);
                showToast("Intake saved");
              }
              return res;
            }}
          />
        );
      })()}

      {(() => {
        const deleting = deletingId
          ? intakes.find((i) => i.id === deletingId) ?? null
          : null;
        if (!deleting) return null;
        return (
          <ConfirmModal
            title="Delete order"
            body={`Are you sure you want to delete the order for ${deleting.clientName}? This cannot be undone.`}
            confirmLabel="Delete"
            onCancel={() => setDeletingId(null)}
            onConfirm={async () => {
              await deleteOrder(deleting.id);
              setDeletingId(null);
            }}
          />
        );
      })()}

      {toast ? (
        <div
          className="fixed bottom-7 right-7 z-[110] bg-emerald text-white rounded-full px-4 py-2 shadow-[0_0_24px_rgba(45,155,110,0.4)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
          }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
        active
          ? "bg-magenta text-cream hover:bg-magenta-bright"
          : "text-gold border border-gold/40 hover:bg-gold/10"
      }`}
      style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
    >
      {label}
    </button>
  );
}

function IntakeCard({
  intake,
  expanded,
  onToggle,
  onReminder,
  onMarkComplete,
  onEditIntake,
  onDelete,
}: {
  intake: EnrichedIntake;
  expanded: boolean;
  onToggle: () => void;
  onReminder: () => void;
  onMarkComplete: () => Promise<void>;
  onEditIntake: () => void;
  onDelete: () => void;
}) {
  const status = intakeStatus(intake);
  const statusInfo = INTAKE_STATUS[status];
  const days = daysSinceIso(intake.createdAt);
  const waitStyle = daysWaitingStyle(days);
  const isJoker = !!intake.intake?.isJoker;
  const canMarkComplete = !!intake.clientId && !intake.hasReport;
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl cursor-pointer hover:border-gold/40 transition-colors"
      style={{ padding: "20px" }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        {/* Left side */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <span
            className="text-gold"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "13px",
              letterSpacing: "0.05em",
            }}
          >
            {intake.orderNumber}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="serif-it text-white"
              style={{ fontSize: "22px", lineHeight: 1.2 }}
            >
              {intake.clientName}
            </h2>
            {isJoker ? (
              <span
                className="inline-flex text-white uppercase tracking-[0.18em] rounded-full px-2.5 py-0.5"
                style={{
                  backgroundColor: "#F59E0B",
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                Joker
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-magenta"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {intake.productName || intake.productSlug}
            </p>
            {intake.engine ? (
              <span
                className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2 py-0.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  fontWeight: 500,
                }}
              >
                Engine {intake.engine}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span
              className="text-white/45"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
              }}
            >
              Ordered {formatDate(intake.createdAt)}
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                color: waitStyle.color,
                fontWeight: 500,
              }}
            >
              {waitStyle.warn ? (
                <WarningIcon aria-hidden="true" />
              ) : null}
              {days} {days === 1 ? "day" : "days"} waiting
            </span>
          </div>
        </div>

        {/* Right side */}
        <div
          className="flex flex-col items-stretch md:items-end gap-2.5 md:min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="inline-flex self-start md:self-end rounded-full px-3 py-1 uppercase tracking-[0.18em]"
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.text,
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {statusInfo.label}
          </span>

          <button
            type="button"
            onClick={onReminder}
            className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Send Reminder
          </button>

          <button
            type="button"
            disabled={!canMarkComplete || pending}
            onClick={() => {
              if (!canMarkComplete) return;
              startTransition(async () => {
                await onMarkComplete();
              });
            }}
            className={`rounded-full px-4 py-1.5 uppercase tracking-[0.18em] transition-colors ${
              canMarkComplete && !pending
                ? "bg-magenta text-cream hover:bg-magenta-bright"
                : "bg-magenta/30 text-cream/60 cursor-not-allowed"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
            title={
              canMarkComplete
                ? "Move to report build"
                : "Cannot complete: waiting for intake data"
            }
          >
            {pending ? "Saving..." : "Mark Complete"}
          </button>

          <Link
            href={`/admin/orders/${intake.id}`}
            className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            View Order
          </Link>

          <button
            type="button"
            onClick={onEditIntake}
            className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Edit Intake
          </button>

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
            Delete Order
          </button>
        </div>
      </div>

      {expanded ? (
        <div
          className="mt-5 pt-5 border-t border-gold/10"
          onClick={(e) => e.stopPropagation()}
        >
          <IntakeDetail intake={intake} onReminder={onReminder} />
        </div>
      ) : null}
    </div>
  );
}

function IntakeDetail({
  intake,
  onReminder,
}: {
  intake: EnrichedIntake;
  onReminder: () => void;
}) {
  if (!intake.intake) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <p
          className="serif-it text-gold"
          style={{ fontSize: "20px", lineHeight: 1.3 }}
        >
          Client has not submitted intake yet.
        </p>
        <button
          type="button"
          onClick={onReminder}
          className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          Send Reminder
        </button>
      </div>
    );
  }

  const d = intake.intake;
  const eng = intake.engine ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
      <DetailRow label="Full legal name" value={d.fullName} />
      <DetailRow label="Chosen name" value={d.fullName} />
      <DetailRow label="Date of birth" value={d.dateOfBirth} />
      <DetailRow
        label="Time of birth"
        value={d.timeOfBirth ?? "Not provided"}
      />
      <DetailRow
        label="Place of birth"
        value={d.placeOfBirth ?? "Not provided"}
      />
      <DetailRow
        label="Latitude / longitude"
        value={
          d.latitude !== null && d.longitude !== null
            ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}`
            : "Not geocoded"
        }
      />
      {eng === 3 ? (
        <>
          <DetailRow label="Business name" value="Not captured yet" muted />
          <DetailRow label="Business type" value="Not captured yet" muted />
          <DetailRow label="Start date" value="Not captured yet" muted />
          <DetailRow label="Stage" value="Not captured yet" muted />
        </>
      ) : null}
      {eng === 4 ? (
        <>
          <DetailRow label="Person B name" value="Not captured yet" muted />
          <DetailRow label="Person B DOB" value="Not captured yet" muted />
          <DetailRow label="Person B time" value="Not captured yet" muted />
          <DetailRow label="Person B place" value="Not captured yet" muted />
          <DetailRow
            label="Relationship type"
            value="Not captured yet"
            muted
          />
          <DetailRow
            label="Relationship length"
            value="Not captured yet"
            muted
          />
          <DetailRow label="Consent confirmed" value="Pending" muted />
        </>
      ) : null}
      {eng === 6 ? (
        <>
          <DetailRow label="Window start" value="Not captured yet" muted />
          <DetailRow label="Window end" value="Not captured yet" muted />
        </>
      ) : null}
      {eng === 7 ? (
        <DetailRow
          label="Subscription start"
          value="Not captured yet"
          muted
        />
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
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
        className="text-right"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          color: muted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="clubs" compact showCardinals={false} />
      <p
        className="font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold mt-6"
      >
        All clear
      </p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        No intakes waiting.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        When clients complete their intake forms, they will appear here.
      </p>
    </div>
  );
}

function IntakeEditModal({
  intake,
  onCancel,
  onSave,
}: {
  intake: EnrichedIntake;
  onCancel: () => void;
  onSave: (
    input: IntakeEdit,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [fullName, setFullName] = useState(intake.intake?.fullName ?? "");
  const [dob, setDob] = useState(intake.intake?.dateOfBirth ?? "");
  const [time, setTime] = useState(intake.intake?.timeOfBirth ?? "");
  const [timeUnknown, setTimeUnknown] = useState(
    !intake.intake?.timeOfBirth,
  );
  const [place, setPlace] = useState(intake.intake?.placeOfBirth ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const engine = intake.engine ?? 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !dob || !place.trim()) {
      setError("Full name, DOB, and place are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onSave({
        fullName: fullName.trim(),
        dateOfBirth: dob,
        timeOfBirth: timeUnknown ? null : time || null,
        placeOfBirth: place.trim(),
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#151B33] rounded-2xl w-full max-w-md flex flex-col gap-4"
        style={{
          padding: "28px",
          border: "1px solid rgba(201,169,110,0.25)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className={EYEBROW}>
          Edit Intake · {intake.orderNumber}
          {engine ? ` · Engine ${engine}` : ""}
        </p>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Full legal name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              className="block text-gold uppercase tracking-[0.2em] mb-1.5"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Date of birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px" }}
            />
          </div>
          <div>
            <label
              className="block text-gold uppercase tracking-[0.2em] mb-1.5"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Time of birth
            </label>
            <input
              type="time"
              value={timeUnknown ? "" : time ?? ""}
              onChange={(e) => setTime(e.target.value)}
              disabled={timeUnknown}
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px", opacity: timeUnknown ? 0.5 : 1 }}
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
                style={{ fontSize: "12px" }}
              >
                Time unknown
              </span>
            </label>
          </div>
        </div>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Place of birth
          </label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="City, Country"
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          />
        </div>

        {engine === 3 || engine === 4 || engine === 6 || engine === 7 ? (
          <p
            className="text-cream/45 italic"
            style={{ fontSize: "12px", lineHeight: 1.5 }}
          >
            Engine-specific fields are not yet captured in the schema. Base
            birth data saves to the linked client record.
          </p>
        ) : null}

        {error ? (
          <p
            className="text-magenta"
            style={{ fontSize: "13px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 mt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className={`bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] ${
              pending ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending ? "Saving..." : "Save Intake"}
          </button>
        </div>
      </form>
    </div>
  );
}
