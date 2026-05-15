"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type ProcessingItem = {
  id: string;
  orderNumber: string;
  profileId: string;
  clientId: string | null;
  productSlug: string;
  productName: string;
  engine: number | null;
  createdAt: string;
  orderNotes: string | null;
  clientName: string;
  clientDob: string | null;
  clientTob: string | null;
  clientPlace: string | null;
  reportId: string | null;
  reportStatus: "draft" | "in_review" | null;
  reportCreatedAt: string | null;
  reportUpdatedAt: string | null;
};

type StageKey = "intake_complete" | "drafting" | "review" | "approved";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "intake_complete", label: "Intake Complete" },
  { key: "drafting", label: "Drafting" },
  { key: "review", label: "Review" },
  { key: "approved", label: "Approved" },
];

const NEXT_LABEL: Record<StageKey, string> = {
  intake_complete: "Start Draft",
  drafting: "Send to Review",
  review: "Approve",
  approved: "",
};

const APPROVED_STORAGE_KEY = "admin_approved_reports";

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const SLA_DAYS = 14;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function daysBetween(from: string | number, to: number = Date.now()): number {
  const then = typeof from === "number" ? from : new Date(from).getTime();
  return Math.max(0, Math.floor((to - then) / (1000 * 60 * 60 * 24)));
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysStageStyle(days: number): { color: string; warn: boolean } {
  if (days <= 3) return { color: "#C9A96E", warn: false };
  if (days <= 6) return { color: "#F59E0B", warn: false };
  return { color: "#B51E5A", warn: true };
}

type ApprovedMap = Record<string, number>; // reportId -> approvedAtMs

function stageOf(
  item: ProcessingItem,
  approved: ApprovedMap,
): StageKey {
  if (!item.reportId) return "intake_complete";
  if (item.reportStatus === "draft") return "drafting";
  if (item.reportStatus === "in_review") {
    return approved[item.reportId] ? "approved" : "review";
  }
  return "intake_complete";
}

function stageAnchorIso(
  item: ProcessingItem,
  stage: StageKey,
  approved: ApprovedMap,
): string {
  if (stage === "intake_complete") return item.createdAt;
  if (stage === "drafting") {
    return item.reportCreatedAt ?? item.createdAt;
  }
  if (stage === "review") {
    return item.reportUpdatedAt ?? item.reportCreatedAt ?? item.createdAt;
  }
  if (stage === "approved" && item.reportId && approved[item.reportId]) {
    return new Date(approved[item.reportId]).toISOString();
  }
  return item.createdAt;
}

export function ProcessingBoard({
  items,
  startDraft,
  sendToReview,
  deliver,
  saveNotes,
  deleteReport,
}: {
  items: ProcessingItem[];
  startDraft: (
    orderId: string,
    profileId: string,
    productSlug: string,
    clientId: string,
  ) => Promise<void>;
  sendToReview: (reportId: string) => Promise<void>;
  deliver: (
    orderId: string,
    reportId: string,
    productName: string,
    clientName: string,
  ) => Promise<void>;
  saveNotes: (orderId: string, notes: string) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [approved, setApproved] = useState<ApprovedMap>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [confirmDeliverId, setConfirmDeliverId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(APPROVED_STORAGE_KEY);
      if (raw) setApproved(JSON.parse(raw) as ApprovedMap);
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  function persistApproved(next: ApprovedMap) {
    setApproved(next);
    try {
      window.localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }

  function approveItem(reportId: string) {
    persistApproved({ ...approved, [reportId]: Date.now() });
  }

  function unapproveItem(reportId: string) {
    const next = { ...approved };
    delete next[reportId];
    persistApproved(next);
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  const grouped = useMemo(() => {
    const map: Record<StageKey, ProcessingItem[]> = {
      intake_complete: [],
      drafting: [],
      review: [],
      approved: [],
    };
    for (const it of items) {
      map[stageOf(it, approved)].push(it);
    }
    return map;
  }, [items, approved]);

  const total = items.length;
  const drawerItem = drawerId
    ? items.find((i) => i.id === drawerId) ?? null
    : null;
  const confirmDeliverItem = confirmDeliverId
    ? items.find((i) => i.id === confirmDeliverId) ?? null
    : null;
  const confirmRemoveItem = confirmRemoveId
    ? items.find((i) => i.reportId === confirmRemoveId) ?? null
    : null;

  if (!mounted) {
    return <div className="min-h-[500px]" />;
  }

  if (total === 0) {
    return <FullEmptyState />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Processing</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            Reports in build.
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
          {total} {total === 1 ? "order" : "orders"}
        </span>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.key}
            stage={stage.key}
            label={stage.label}
            items={grouped[stage.key]}
            approved={approved}
            onCardClick={(id) => setDrawerId(id)}
            onPrimaryAction={(item) => {
              const s = stageOf(item, approved);
              if (s === "intake_complete") {
                if (!item.clientId) {
                  showToast("Cannot start without client intake");
                  return;
                }
                void startDraft(
                  item.id,
                  item.profileId,
                  item.productSlug,
                  item.clientId,
                );
              } else if (s === "drafting") {
                if (item.reportId) void sendToReview(item.reportId);
              } else if (s === "review") {
                if (item.reportId) approveItem(item.reportId);
              }
            }}
            onDeliver={(item) => setConfirmDeliverId(item.id)}
          />
        ))}
      </div>

      {drawerItem ? (
        <DetailDrawer
          item={drawerItem}
          stage={stageOf(drawerItem, approved)}
          approvedAt={
            drawerItem.reportId
              ? approved[drawerItem.reportId] ?? null
              : null
          }
          onClose={() => setDrawerId(null)}
          onSaveNotes={saveNotes}
          onSendNext={() => {
            const s = stageOf(drawerItem, approved);
            if (s === "intake_complete" && drawerItem.clientId) {
              void startDraft(
                drawerItem.id,
                drawerItem.profileId,
                drawerItem.productSlug,
                drawerItem.clientId,
              );
            } else if (s === "drafting" && drawerItem.reportId) {
              void sendToReview(drawerItem.reportId);
            } else if (s === "review" && drawerItem.reportId) {
              approveItem(drawerItem.reportId);
            }
            setDrawerId(null);
          }}
          onFlagQc={() => {
            showToast("Flagged for QC");
          }}
          onUnapprove={() => {
            if (drawerItem.reportId) unapproveItem(drawerItem.reportId);
          }}
          onDeliver={() => {
            setConfirmDeliverId(drawerItem.id);
            setDrawerId(null);
          }}
          onAskRemove={() => {
            if (drawerItem.reportId) {
              setConfirmRemoveId(drawerItem.reportId);
              setDrawerId(null);
            }
          }}
        />
      ) : null}

      {confirmDeliverItem ? (
        <ConfirmDeliverModal
          item={confirmDeliverItem}
          onCancel={() => setConfirmDeliverId(null)}
          onConfirm={async () => {
            if (!confirmDeliverItem.reportId) {
              setConfirmDeliverId(null);
              return;
            }
            await deliver(
              confirmDeliverItem.id,
              confirmDeliverItem.reportId,
              confirmDeliverItem.productName ||
                confirmDeliverItem.productSlug,
              confirmDeliverItem.clientName,
            );
            unapproveItem(confirmDeliverItem.reportId);
            setConfirmDeliverId(null);
          }}
        />
      ) : null}

      {confirmRemoveItem && confirmRemoveId ? (
        <ConfirmModal
          title="Remove from board"
          body={`Are you sure you want to delete the report for ${confirmRemoveItem.clientName}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmRemoveId(null)}
          onConfirm={async () => {
            await deleteReport(confirmRemoveId);
            unapproveItem(confirmRemoveId);
            setConfirmRemoveId(null);
          }}
        />
      ) : null}

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

function Column({
  stage,
  label,
  items,
  approved,
  onCardClick,
  onPrimaryAction,
  onDeliver,
}: {
  stage: StageKey;
  label: string;
  items: ProcessingItem[];
  approved: ApprovedMap;
  onCardClick: (id: string) => void;
  onPrimaryAction: (item: ProcessingItem) => void;
  onDeliver: (item: ProcessingItem) => void;
}) {
  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 flex flex-col gap-3 min-h-[280px]">
      <div className="flex items-center justify-between">
        <p className={EYEBROW}>{label}</p>
        <span
          className="bg-magenta text-cream rounded-full px-2.5 py-0.5 uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.length === 0 ? (
          <p
            className="text-cream/35"
            style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
          >
            Nothing here.
          </p>
        ) : null}
        {items.map((it) => (
          <ReportCard
            key={it.id}
            item={it}
            stage={stage}
            approved={approved}
            onClick={() => onCardClick(it.id)}
            onPrimary={() => onPrimaryAction(it)}
            onDeliver={() => onDeliver(it)}
          />
        ))}
      </div>
    </div>
  );
}

function ReportCard({
  item,
  stage,
  approved,
  onClick,
  onPrimary,
  onDeliver,
}: {
  item: ProcessingItem;
  stage: StageKey;
  approved: ApprovedMap;
  onClick: () => void;
  onPrimary: () => void;
  onDeliver: () => void;
}) {
  const slaIso = addDaysIso(item.createdAt, SLA_DAYS);
  const slaDate = new Date(slaIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slaIsTodayOrPast = slaDate.getTime() <= today.getTime() + 24 * 60 * 60 * 1000 - 1 && (slaDate.getTime() < today.getTime() + 24 * 60 * 60 * 1000);
  const slaOverdue = slaDate.getTime() < today.getTime();
  const slaUrgent = slaOverdue || slaDate.toDateString() === new Date().toDateString();

  const anchorIso = stageAnchorIso(item, stage, approved);
  const days = daysBetween(anchorIso);
  const style = daysStageStyle(days);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-[#1A2140] border border-[rgba(201,169,110,0.15)] rounded-xl cursor-pointer hover:border-gold/40 transition-colors flex flex-col gap-2"
      style={{ padding: "16px" }}
    >
      <span
        className="text-gold"
        style={{
          fontFamily:
            "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
          fontSize: "12px",
          letterSpacing: "0.05em",
        }}
      >
        {item.orderNumber}
      </span>

      <h3
        className="serif-it text-white"
        style={{ fontSize: "20px", lineHeight: 1.2 }}
      >
        {item.clientName}
      </h3>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-magenta"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {item.productName || item.productSlug}
        </span>
        {item.engine ? (
          <span
            className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2 py-0.5"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              fontWeight: 500,
            }}
          >
            E{item.engine}
          </span>
        ) : null}
      </div>

      <div
        className="flex items-center gap-2 mt-1"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
        }}
      >
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: style.color, fontWeight: 500 }}
        >
          {style.warn ? <WarningIcon /> : null}
          {days} {days === 1 ? "day" : "days"} in stage
        </span>
      </div>

      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          color: slaUrgent ? "#B51E5A" : "rgba(255,255,255,0.45)",
          fontWeight: slaUrgent ? 500 : 400,
        }}
      >
        SLA {formatDate(slaIso)}
      </span>

      <div
        className="mt-2 flex flex-wrap gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {stage !== "approved" ? (
          <button
            type="button"
            onClick={onPrimary}
            className="text-magenta border border-magenta/40 rounded-full px-3 py-1 hover:bg-magenta/10 transition-colors uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {NEXT_LABEL[stage]}
          </button>
        ) : (
          <button
            type="button"
            onClick={onDeliver}
            className="bg-emerald text-cream rounded-full px-3 py-1 hover:brightness-110 transition-[filter] uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Deliver to Client
          </button>
        )}
      </div>
    </div>
  );
}

function DetailDrawer({
  item,
  stage,
  approvedAt,
  onClose,
  onSaveNotes,
  onSendNext,
  onFlagQc,
  onUnapprove,
  onDeliver,
  onAskRemove,
}: {
  item: ProcessingItem;
  stage: StageKey;
  approvedAt: number | null;
  onClose: () => void;
  onSaveNotes: (orderId: string, notes: string) => Promise<void>;
  onSendNext: () => void;
  onFlagQc: () => void;
  onUnapprove: () => void;
  onDeliver: () => void;
  onAskRemove: () => void;
}) {
  const [notes, setNotes] = useState(item.orderNotes ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();

  function commit() {
    if (notes === (item.orderNotes ?? "")) return;
    startTransition(async () => {
      await onSaveNotes(item.id, notes);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1500);
    });
  }

  const slaIso = addDaysIso(item.createdAt, SLA_DAYS);
  const slaTarget = new Date(slaIso).getTime();
  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);
  const remaining = Math.ceil((slaTarget - todayMid.getTime()) / (1000 * 60 * 60 * 24));

  const stageLabel = STAGES.find((s) => s.key === stage)?.label ?? "";

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Order detail"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="absolute top-0 right-0 h-full overflow-y-auto bg-[#0D1220]"
        style={{
          width: "420px",
          maxWidth: "100vw",
          borderLeft: "2px solid #C9A96E",
          boxShadow: "0 0 60px rgba(0,0,0,0.7)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div className="flex items-start justify-between gap-3 p-6 border-b border-gold/10 sticky top-0 bg-[#0D1220] z-10">
          <div>
            <p className={EYEBROW}>{stageLabel}</p>
            <h2
              className="serif-it text-white mt-2"
              style={{ fontSize: "28px", lineHeight: 1.15 }}
            >
              {item.clientName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="text-cream/45 hover:text-cream transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-magenta"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              {item.productName || item.productSlug}
            </span>
            {item.engine ? (
              <span
                className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2 py-0.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  fontWeight: 500,
                }}
              >
                Engine {item.engine}
              </span>
            ) : null}
          </div>

          <DrawerRow
            label="Order"
            value={`${item.orderNumber} · ${formatDate(item.createdAt)}`}
          />
          <DrawerRow
            label="SLA"
            value={
              <span
                style={{
                  color: remaining <= 0 ? "#B51E5A" : "rgba(255,255,255,0.85)",
                  fontWeight: remaining <= 0 ? 500 : 400,
                }}
              >
                {formatDate(slaIso)} ·{" "}
                {remaining < 0
                  ? `${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? "" : "s"} overdue`
                  : remaining === 0
                    ? "due today"
                    : `${remaining} day${remaining === 1 ? "" : "s"} remaining`}
              </span>
            }
          />
          {approvedAt ? (
            <DrawerRow
              label="Approved"
              value={`${daysBetween(approvedAt)} day${daysBetween(approvedAt) === 1 ? "" : "s"} ago`}
            />
          ) : null}

          <div className="pt-4 border-t border-gold/10 flex flex-col gap-2">
            <p
              className="text-gold uppercase tracking-[0.2em]"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Client birth data
            </p>
            {item.clientId ? (
              <div className="flex flex-col gap-1">
                <DrawerRow
                  label="DOB"
                  value={item.clientDob ?? "Not provided"}
                />
                <DrawerRow
                  label="Time"
                  value={item.clientTob ?? "Not provided"}
                />
                <DrawerRow
                  label="Place"
                  value={item.clientPlace ?? "Not provided"}
                />
              </div>
            ) : (
              <p
                className="text-cream/40 italic"
                style={{ fontSize: "13px" }}
              >
                Intake data not yet submitted.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gold/10 flex flex-col gap-2">
            <p
              className="text-gold uppercase tracking-[0.2em]"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={commit}
              rows={5}
              placeholder="Internal notes for this order"
              className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            />
            <div className="flex items-center justify-between">
              <span
                className={`text-gold transition-opacity duration-500 ${
                  savedFlash ? "opacity-60" : "opacity-0"
                }`}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
                aria-live="polite"
              >
                Saved
              </span>
              {pending ? (
                <span
                  className="text-cream/40"
                  style={{ fontSize: "11px" }}
                >
                  Saving...
                </span>
              ) : null}
            </div>
          </div>

          <div className="pt-4 border-t border-gold/10 flex flex-col gap-2">
            <Link
              href="/admin/reports"
              className="bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors text-center uppercase tracking-[0.18em]"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Open Report Builder
            </Link>
            {stage !== "approved" ? (
              <button
                type="button"
                onClick={onSendNext}
                className="bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Send to Next Stage
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDeliver}
                  className="bg-emerald text-cream rounded-full px-4 py-2 hover:brightness-110 transition-[filter] uppercase tracking-[0.18em]"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  Deliver to Client
                </button>
                <button
                  type="button"
                  onClick={onUnapprove}
                  className="text-cream/50 hover:text-cream text-xs uppercase tracking-[0.2em] px-2 py-1 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Move back to Review
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onFlagQc}
              className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Flag for QC
            </button>
            <Link
              href={`/admin/orders/${item.id}`}
              className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Edit Order
            </Link>
            {item.reportId ? (
              <button
                type="button"
                onClick={onAskRemove}
                className="text-rose border border-rose/40 rounded-full px-4 py-2 hover:bg-rose/10 transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Remove from Board
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ConfirmDeliverModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: ProcessingItem;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-2xl p-7 w-full max-w-md flex flex-col gap-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <p className={EYEBROW}>Confirm delivery</p>
        <p className="text-white" style={{ fontSize: "16px", lineHeight: 1.5 }}>
          Ready to deliver{" "}
          <span className="text-magenta font-medium">
            {item.productName || item.productSlug}
          </span>{" "}
          to{" "}
          <span className="text-gold font-medium">{item.clientName}</span>?
          This will send the report PDF and mark the order as delivered.
        </p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Not yet
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void onConfirm())}
            className={`bg-emerald text-cream rounded-full px-5 py-2.5 hover:brightness-110 transition-[filter] uppercase tracking-[0.2em] ${
              pending ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending ? "Delivering..." : "Deliver Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DrawerRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span
        className="text-cream/50 uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10.5px",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        className="text-right text-cream"
        style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
      >
        {value}
      </span>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="11"
      height="11"
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

function FullEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="spades" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>All clear</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        No reports in build.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        Orders move here once intake is complete.
      </p>
    </div>
  );
}
