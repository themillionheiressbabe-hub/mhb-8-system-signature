"use client";

import Link from "next/link";
import { Fragment, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type DetailOrder = {
  id: string;
  productSlug: string;
  productName: string;
  engine: number | null;
  amountPence: number;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  reportStatus: "draft" | "in_review" | "delivered" | null;
  createdAt: string;
  intakeSubmitted: boolean;
};

export type DetailReport = {
  id: string;
  orderId: string;
  productSlug: string;
  productName: string;
  status: "draft" | "in_review" | "delivered" | null;
  createdAt: string;
  deliveredAt: string | null;
};

export type ClientDetailData = {
  id: string;
  mhbNumber: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  fullName: string;
  chosenName: string | null;
  email: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  isJoker: boolean;
  notes: string | null;
  createdAt: string;
  status: "active" | "pending" | "delivered";
  intakeComplete: boolean;
  birthCardName: string | null;
  lifePath: number;
  personalYear: number;
  chineseZodiac: string;
};

type TabKey =
  | "overview"
  | "birthprint"
  | "orders"
  | "reports"
  | "notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "birthprint", label: "Birthprint" },
  { key: "orders", label: "Orders" },
  { key: "reports", label: "Reports" },
  { key: "notes", label: "Admin Notes" },
];

const STATUS_INFO: Record<
  ClientDetailData["status"],
  { label: string; bg: string; text: string }
> = {
  active: {
    label: "Active",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
  pending: {
    label: "Pending",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(167,139,250,0.15)",
    text: "#A78BFA",
  },
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDob(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${date}, ${hh}:${mm}`;
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)));
}

function orderStatusLabel(o: DetailOrder): string {
  if (o.reportStatus === "delivered") return "Delivered";
  if (o.reportStatus === "in_review") return "Review";
  if (o.reportStatus === "draft") return "Drafting";
  if (o.status === "paid") return "Queued";
  if (o.status === "pending") return "Pending";
  if (o.status === "failed") return "Failed";
  if (o.status === "refunded") return "Refunded";
  return "—";
}

const REPORT_STATUS_INFO: Record<
  "draft" | "in_review" | "delivered",
  { label: string; bg: string; text: string }
> = {
  draft: {
    label: "Drafting",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  in_review: {
    label: "In Review",
    bg: "rgba(232,201,136,0.15)",
    text: "#E8C988",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
};

export function ClientDetail({
  client,
  orders,
  reports,
  saveNotes,
  deleteClient,
  geocodeWarning,
}: {
  client: ClientDetailData;
  orders: DetailOrder[];
  reports: DetailReport[];
  saveNotes: (notes: string) => Promise<void>;
  deleteClient: () => Promise<void>;
  geocodeWarning: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusInfo = STATUS_INFO[client.status];

  const totalOrders = orders.length;
  const totalSpend = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountPence, 0);
  const reportsDelivered = reports.filter((r) => r.status === "delivered").length;
  const daysAsClient = daysSinceIso(client.createdAt);

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/admin/clients"
          className="text-gold hover:text-gold-bright transition-colors inline-flex items-center gap-2"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <span aria-hidden="true">&larr;</span>
          Back to clients
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/reports/new?client=${client.id}`}
            className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            New Report
          </Link>
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            Edit Client
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-rose border border-rose/40 rounded-full px-5 py-2.5 hover:bg-rose/10 transition-colors uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            Delete Client
          </button>
        </div>
      </div>

      {confirmDelete ? (
        <ConfirmModal
          title="Delete client"
          body={`Deleting ${client.fullName} will also delete all their orders and reports. This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteClient();
            setConfirmDelete(false);
          }}
        />
      ) : null}

      {geocodeWarning ? (
        <p
          className="text-gold"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            backgroundColor: "rgba(201,169,110,0.08)",
            border: "1px solid rgba(201,169,110,0.25)",
            borderRadius: "12px",
            padding: "10px 14px",
          }}
        >
          Location could not be geocoded. You can update this later.
        </p>
      ) : null}

      {/* Client header */}
      <div className="flex items-start gap-6 flex-wrap">
        <Orbit size={80} suit={client.suit} compact showCardinals={false} />
        <div className="flex-1 min-w-0">
          <span
            className="text-gold"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "13px",
              letterSpacing: "0.05em",
            }}
          >
            {client.mhbNumber}
          </span>
          <h1
            className="serif-it text-white mt-1"
            style={{
              fontSize: "48px",
              lineHeight: 1.05,
            }}
          >
            {client.fullName}
          </h1>
          {client.chosenName ? (
            <p
              className="text-cream/70 mt-1"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
              }}
            >
              Goes by {client.chosenName}
            </p>
          ) : null}
          <p
            className="text-white/45 mt-1"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            }}
          >
            {client.email ?? "Email not on file"}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex rounded-full px-3 py-1 uppercase tracking-[0.18em]"
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
            {client.isJoker ? (
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
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-0 border-b border-gold/15"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="px-4 py-3 transition-colors"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: active ? "#D63F7E" : "rgba(244,241,237,0.7)",
                borderBottom: active
                  ? "2px solid #B51E5A"
                  : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" ? (
        <OverviewTab
          client={client}
          orders={orders}
          totalOrders={totalOrders}
          totalSpend={totalSpend}
          reportsDelivered={reportsDelivered}
          daysAsClient={daysAsClient}
          saveNotes={saveNotes}
        />
      ) : null}
      {tab === "birthprint" ? <BirthprintTab client={client} /> : null}
      {tab === "orders" ? (
        <OrdersTab orders={orders} clientId={client.id} />
      ) : null}
      {tab === "reports" ? (
        <ReportsTab reports={reports} clientId={client.id} />
      ) : null}
      {tab === "notes" ? (
        <NotesTab client={client} saveNotes={saveNotes} />
      ) : null}
    </div>
  );
}

function OverviewTab({
  client,
  orders,
  totalOrders,
  totalSpend,
  reportsDelivered,
  daysAsClient,
  saveNotes,
}: {
  client: ClientDetailData;
  orders: DetailOrder[];
  totalOrders: number;
  totalSpend: number;
  reportsDelivered: number;
  daysAsClient: number;
  saveNotes: (notes: string) => Promise<void>;
}) {
  const recent = orders.slice(0, 5);
  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiTile label="Total Orders" value={`${totalOrders}`} color="#D63F7E" />
        <KpiTile
          label="Total Spend"
          value={formatPrice(totalSpend)}
          color="#C9A96E"
        />
        <KpiTile
          label="Reports Delivered"
          value={`${reportsDelivered}`}
          color="#2D9B6E"
        />
        <KpiTile
          label="Days as Client"
          value={`${daysAsClient}`}
          color="#C9A96E"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5">
          <p className={EYEBROW}>Recent Orders</p>
          {recent.length === 0 ? (
            <p
              className="text-cream/40 italic mt-3"
              style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
            >
              No orders yet.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <OrdersTable orders={recent} compact />
            </div>
          )}
        </div>

        <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5">
          <p className={EYEBROW}>Quick Birthprint</p>
          <h3
            className="serif-it text-gold mt-3"
            style={{ fontSize: "24px", lineHeight: 1.2 }}
          >
            {client.birthCardName ?? "Birth Card pending"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <MiniChip label="Life Path" value={`${client.lifePath}`} />
            <MiniChip label="Personal Year" value={`${client.personalYear}`} />
            <MiniChip label="Chinese Zodiac" value={client.chineseZodiac} />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <MetaRow
              label="Place"
              value={client.placeOfBirth ?? "Not provided"}
            />
            <MetaRow label="DOB" value={formatDob(client.dateOfBirth)} />
            <MetaRow
              label="Time"
              value={client.timeOfBirth ?? "Not provided"}
            />
          </div>
          <div className="mt-4">
            {client.intakeComplete ? (
              <span
                className="inline-flex rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: "rgba(45,155,110,0.15)",
                  color: "#2D9B6E",
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                Intake complete
              </span>
            ) : (
              <span
                className="inline-flex rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: "rgba(201,169,110,0.15)",
                  color: "#C9A96E",
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                Intake pending
              </span>
            )}
          </div>
        </div>
      </div>

      <NotesPanel client={client} saveNotes={saveNotes} compact />
    </div>
  );
}

function BirthprintTab({ client }: { client: ClientDetailData }) {
  // No birthprints table yet. Show placeholder per spec.
  void client;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="hearts" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>Birthprint Pending</p>
      <h2 className="serif-it text-gold text-3xl leading-tight mt-3">
        Intake required.
      </h2>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        Once this client completes their intake, their full Birthprint will
        appear here.
      </p>
    </div>
  );
}

function OrdersTab({
  orders,
  clientId,
}: {
  orders: DetailOrder[];
  clientId: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className={EYEBROW}>All Orders</p>
        <button
          type="button"
          onClick={() => void clientId}
          className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          Create Order
        </button>
      </div>
      {orders.length === 0 ? (
        <p
          className="text-cream/40 italic py-4"
          style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
        >
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <OrdersTable
            orders={orders}
            expandedId={expandedId}
            onToggle={(id) =>
              setExpandedId(expandedId === id ? null : id)
            }
          />
        </div>
      )}
    </div>
  );
}

function ReportsTab({
  reports,
  clientId,
}: {
  reports: DetailReport[];
  clientId: string;
}) {
  if (reports.length === 0) {
    return (
      <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-8 text-center">
        <p className={EYEBROW}>Reports</p>
        <p
          className="text-cream/50 italic mt-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
        >
          No reports yet.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {reports.map((r) => {
        const info = r.status ? REPORT_STATUS_INFO[r.status] : null;
        return (
          <div
            key={r.id}
            className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl"
            style={{ padding: "20px" }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3
                  className="serif-it text-white"
                  style={{ fontSize: "22px", lineHeight: 1.2 }}
                >
                  {r.productName || r.productSlug}
                </h3>
                <p
                  className="text-cream/60 mt-1"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                  }}
                >
                  Created {formatDate(r.createdAt)}
                  {r.deliveredAt
                    ? ` · Delivered ${formatDate(r.deliveredAt)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {info ? (
                  <span
                    className="inline-flex rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: info.bg,
                      color: info.text,
                      fontFamily: "var(--font-sans)",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    {info.label}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  View Report
                </button>
                <Link
                  href={`/admin/reports/new?client=${clientId}&order=${r.orderId}`}
                  className="bg-magenta text-cream rounded-full px-4 py-1.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  Build Report
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function NotesTab({
  client,
  saveNotes,
}: {
  client: ClientDetailData;
  saveNotes: (notes: string) => Promise<void>;
}) {
  return (
    <NotesPanel client={client} saveNotes={saveNotes} compact={false} />
  );
}

function NotesPanel({
  client,
  saveNotes,
  compact,
}: {
  client: ClientDetailData;
  saveNotes: (notes: string) => Promise<void>;
  compact: boolean;
}) {
  const [notes, setNotes] = useState(client.notes ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();

  function commit() {
    if (notes === (client.notes ?? "")) return;
    startTransition(async () => {
      await saveNotes(notes);
      setSavedAt(Date.now());
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1500);
    });
  }

  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 flex flex-col gap-3">
      <p className={EYEBROW}>Admin Notes</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={commit}
        rows={compact ? 4 : 14}
        placeholder="Internal notes about this client. Not visible to the client."
        className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          lineHeight: 1.5,
          minHeight: compact ? "120px" : "360px",
        }}
      />
      <div className="flex items-center justify-between">
        <span
          className={`text-gold transition-opacity duration-500 ${
            savedFlash ? "opacity-60" : "opacity-0"
          }`}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
          aria-live="polite"
        >
          Saved
        </span>
        <span
          className="text-white/40"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
          }}
        >
          {pending
            ? "Saving..."
            : savedAt
              ? `Last saved ${formatTimestamp(new Date(savedAt).toISOString())}`
              : ""}
        </span>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  compact = false,
  expandedId,
  onToggle,
}: {
  orders: DetailOrder[];
  compact?: boolean;
  expandedId?: string | null;
  onToggle?: (id: string) => void;
}) {
  return (
    <table
      className="w-full border-collapse"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <thead>
        <tr className="text-left">
          <OrderTh>Order ID</OrderTh>
          <OrderTh>Product</OrderTh>
          <OrderTh>Engine</OrderTh>
          <OrderTh>Price</OrderTh>
          <OrderTh>Status</OrderTh>
          <OrderTh>Date</OrderTh>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => {
          const expanded = expandedId === o.id;
          const num = `MHB-${o.id.replace(/-/g, "").slice(-4).toUpperCase()}`;
          return (
            <Fragment key={o.id}>
              <tr
                className="border-t border-gold/10"
                style={{ fontSize: "13px" }}
                onClick={onToggle ? () => onToggle(o.id) : undefined}
              >
                <td
                  className="py-2 pr-3 text-gold"
                  style={{
                    fontFamily:
                      "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                    fontSize: "12px",
                  }}
                >
                  {num}
                </td>
                <td className="py-2 pr-3 text-cream">
                  {o.productName || o.productSlug}
                </td>
                <td className="py-2 pr-3 text-cream/70">
                  {o.engine ? `E${o.engine}` : "—"}
                </td>
                <td className="py-2 pr-3 text-gold">
                  {formatPrice(o.amountPence)}
                </td>
                <td className="py-2 pr-3 text-cream/70">
                  {orderStatusLabel(o)}
                </td>
                <td className="py-2 pr-3 text-white/45">
                  {formatDate(o.createdAt)}
                </td>
              </tr>
              {expanded && !compact ? (
                <tr className="bg-[#0D1220]">
                  <td colSpan={6} className="px-3 py-3">
                    <p
                      className="text-cream/60"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "13px",
                      }}
                    >
                      {o.intakeSubmitted
                        ? "Intake data submitted. See Birthprint tab."
                        : "Intake not yet submitted."}
                    </p>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function OrderTh({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-cream/50 uppercase pb-2 pr-3"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        letterSpacing: "0.2em",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function KpiTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5">
      <p className={EYEBROW}>{label}</p>
      <p
        className="mt-2 leading-none"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "28px",
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function MiniChip({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex flex-col border border-gold/30 rounded-lg px-2.5 py-1 bg-gold/5"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <span
        className="text-gold uppercase tracking-[0.2em]"
        style={{ fontSize: "9.5px", fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="text-cream"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        {value}
      </span>
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
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
        className="text-cream text-right"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <p className={EYEBROW}>Not found</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        This client does not exist.
      </h1>
      <Link
        href="/admin/clients"
        className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] mt-6"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        Back to Clients
      </Link>
    </div>
  );
}
