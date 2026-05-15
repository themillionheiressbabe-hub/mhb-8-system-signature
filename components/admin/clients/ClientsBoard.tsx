"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type ClientOrderSummary = {
  id: string;
  productSlug: string;
  productName: string;
  engine: number | null;
  amountPence: number;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  reportStatus: "draft" | "in_review" | "delivered" | null;
  createdAt: string;
};

export type ClientStatus = "active" | "pending" | "delivered";

export type EnrichedClient = {
  id: string;
  mhbNumber: string;
  fullName: string;
  email: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  isJoker: boolean;
  notes: string | null;
  createdAt: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  engines: number[];
  orders: ClientOrderSummary[];
  orderCount: number;
  totalSpendPence: number;
  latestProductName: string | null;
  latestOrderDate: string | null;
  latestEngine: number | null;
  status: ClientStatus;
  birthCardName: string | null;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUS_INFO: Record<
  ClientStatus,
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

const STATUS_FILTERS: { key: ClientStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
];

const ENGINE_FILTERS = [0, 1, 2, 3, 4, 5, 6, 7];

const PAGE_SIZE = 20;

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

function sumDigits(n: number): number {
  let s = 0;
  let t = Math.abs(n);
  while (t > 0) {
    s += t % 10;
    t = Math.floor(t / 10);
  }
  return s;
}

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

function lifePathFromDob(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return reduce(sumDigits(y) + sumDigits(m) + sumDigits(d));
}

function personalYearFromDob(iso: string): number {
  const [, m, d] = iso.split("-").map(Number);
  const yr = new Date().getFullYear();
  return reduce(sumDigits(m) + sumDigits(d) + sumDigits(yr));
}

const CHINESE_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const CHINESE_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth",
  "Earth", "Metal", "Metal", "Water", "Water",
];

function chineseZodiacFromDob(iso: string): string {
  const y = Number(iso.split("-")[0]);
  const animal = CHINESE_ANIMALS[(((y - 4) % 12) + 12) % 12];
  const element = CHINESE_ELEMENTS[(((y - 4) % 10) + 10) % 10];
  return `${element} ${animal}`;
}

type SortField = "name" | "orders" | "spend" | "date";
type SortDir = "asc" | "desc";

export function ClientsBoard({
  clients,
  saveNotes,
  deleteClient,
}: {
  clients: EnrichedClient[];
  saveNotes: (clientId: string, notes: string) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [engineFilter, setEngineFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalClients = clients.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (
        engineFilter !== "all" &&
        (c.latestEngine ?? -1) !== engineFilter
      )
        return false;
      if (!q) return true;
      const hay = [
        c.fullName,
        c.email ?? "",
        c.mhbNumber,
        c.latestProductName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [clients, search, statusFilter, engineFilter]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.fullName.localeCompare(b.fullName);
      else if (sortField === "orders") cmp = a.orderCount - b.orderCount;
      else if (sortField === "spend") cmp = a.totalSpendPence - b.totalSpendPence;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  }

  if (totalClients === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Clients</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            Your people.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-gold"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {totalClients} {totalClients === 1 ? "client" : "clients"}
          </span>
          <Link
            href="/admin/clients/new"
            className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            + New Client
          </Link>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search by name, email, or MHB number..."
        className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 w-full"
        style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
      />

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            active={statusFilter === f.key}
            onClick={() => {
              setStatusFilter(f.key);
              setPage(1);
            }}
          />
        ))}
      </div>

      {/* Engine filters */}
      <div className="flex flex-wrap gap-2">
        {ENGINE_FILTERS.map((e) => (
          <FilterPill
            key={e}
            label={e === 0 ? "All Engines" : `Engine ${e}`}
            active={engineFilter === (e === 0 ? "all" : e)}
            onClick={() => {
              setEngineFilter(e === 0 ? "all" : e);
              setPage(1);
            }}
          />
        ))}
      </div>

      {/* Sort row */}
      <div
        className="flex items-center gap-3 flex-wrap"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span
          className="text-cream/50 uppercase tracking-[0.2em]"
          style={{ fontSize: "10.5px", fontWeight: 500 }}
        >
          Sort
        </span>
        <SortButton
          label="Name"
          active={sortField === "name"}
          dir={sortDir}
          onClick={() => toggleSort("name")}
        />
        <SortButton
          label="Orders"
          active={sortField === "orders"}
          dir={sortDir}
          onClick={() => toggleSort("orders")}
        />
        <SortButton
          label="Spend"
          active={sortField === "spend"}
          dir={sortDir}
          onClick={() => toggleSort("spend")}
        />
        <SortButton
          label="Date"
          active={sortField === "date"}
          dir={sortDir}
          onClick={() => toggleSort("date")}
        />
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {pageRows.length === 0 ? (
          <p
            className="text-cream/40 italic py-6 text-center"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            No clients match these filters.
          </p>
        ) : null}
        {pageRows.map((c) => (
          <ClientCard
            key={c.id}
            client={c}
            expanded={expandedId === c.id}
            onToggle={() =>
              setExpandedId(expandedId === c.id ? null : c.id)
            }
            onSaveNotes={saveNotes}
            onDelete={() => setDeletingId(c.id)}
          />
        ))}
      </div>

      {(() => {
        const deleting = deletingId
          ? clients.find((c) => c.id === deletingId) ?? null
          : null;
        if (!deleting) return null;
        return (
          <ConfirmModal
            title="Delete client"
            body={`Deleting ${deleting.fullName} will also delete all their orders, reports, and journal entries. This cannot be undone.`}
            confirmLabel="Delete"
            onCancel={() => setDeletingId(null)}
            onConfirm={async () => {
              await deleteClient(deleting.id);
              setDeletingId(null);
            }}
          />
        );
      })()}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span
          className="text-cream/50"
          style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
        >
          Showing {pageRows.length === 0 ? 0 : pageStart + 1}
          {" to "}
          {pageStart + pageRows.length} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <PageButton
            disabled={currentPage === 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            Prev
          </PageButton>
          <span
            className="text-gold"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <PageButton
            disabled={currentPage === totalPages}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          >
            Next
          </PageButton>
        </div>
      </div>
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

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
        active
          ? "text-gold border border-gold/40 bg-gold/5"
          : "text-cream/60 border border-transparent hover:text-cream"
      }`}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      {label}
      {active ? (
        <span aria-hidden="true" style={{ fontSize: "10px" }}>
          {dir === "asc" ? "↑" : "↓"}
        </span>
      ) : null}
    </button>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-xs uppercase tracking-[0.2em] rounded-full px-4 py-1.5 transition-colors ${
        disabled
          ? "text-cream/30 border border-cream/15 cursor-not-allowed"
          : "text-gold border border-gold/40 hover:bg-gold/10"
      }`}
      style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

function ClientCard({
  client,
  expanded,
  onToggle,
  onSaveNotes,
  onDelete,
}: {
  client: EnrichedClient;
  expanded: boolean;
  onToggle: () => void;
  onSaveNotes: (clientId: string, notes: string) => Promise<void>;
  onDelete: () => void;
}) {
  const statusInfo = STATUS_INFO[client.status];

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
      <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_200px] gap-5">
        {/* Left: Orbit */}
        <div className="flex md:justify-center md:items-start">
          <Orbit
            size={52}
            suit={client.suit}
            compact
            showCardinals={false}
          />
        </div>

        {/* Middle: client info */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <span
            className="text-gold"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "12px",
              letterSpacing: "0.05em",
            }}
          >
            {client.mhbNumber}
          </span>
          <h2
            className="serif-it text-white"
            style={{ fontSize: "24px", lineHeight: 1.15 }}
          >
            {client.fullName}
          </h2>
          <p
            className="text-white/45"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
            }}
          >
            {client.email ?? "Email not on file"}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {client.engines.map((e) => (
              <span
                key={e}
                className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2 py-0.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  fontWeight: 500,
                }}
              >
                E{e}
              </span>
            ))}
            <span
              className="text-gold"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {client.orderCount}{" "}
              {client.orderCount === 1 ? "order" : "orders"}
            </span>
            <span
              className="text-gold/50"
              style={{ fontSize: "11px" }}
              aria-hidden="true"
            >
              ·
            </span>
            <span
              className="text-gold"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {formatPrice(client.totalSpendPence)}
            </span>
          </div>

          {client.latestProductName ? (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p
                className="text-cream/80"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                }}
              >
                Latest: {client.latestProductName}
              </p>
              {client.latestOrderDate ? (
                <span
                  className="text-white/45"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                  }}
                >
                  {formatDate(client.latestOrderDate)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right: status + actions */}
        <div
          className="flex flex-col items-stretch md:items-end gap-2"
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
          {client.isJoker ? (
            <span
              className="inline-flex self-start md:self-end text-white uppercase tracking-[0.18em] rounded-full px-2.5 py-0.5"
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

          <Link
            href={`/admin/clients/${client.id}`}
            className="bg-magenta text-cream rounded-full px-4 py-1.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em] text-center"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            View
          </Link>
          <Link
            href={`/admin/reports/new?client=${client.id}`}
            className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            New Report
          </Link>
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Edit
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
            Delete
          </button>
          <button
            type="button"
            className="text-cream/60 border border-[rgba(255,255,255,0.18)] rounded-full px-4 py-1.5 hover:text-cream hover:border-cream/40 transition-colors uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Message
          </button>
        </div>
      </div>

      {expanded ? (
        <div
          className="mt-5 pt-5 border-t border-gold/10"
          onClick={(e) => e.stopPropagation()}
        >
          <ClientDetail client={client} onSaveNotes={onSaveNotes} />
        </div>
      ) : null}
    </div>
  );
}

function ClientDetail({
  client,
  onSaveNotes,
}: {
  client: EnrichedClient;
  onSaveNotes: (clientId: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(client.notes ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();

  function commit() {
    if (notes === (client.notes ?? "")) return;
    startTransition(async () => {
      await onSaveNotes(client.id, notes);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1500);
    });
  }

  const lifePath = lifePathFromDob(client.dateOfBirth);
  const personalYear = personalYearFromDob(client.dateOfBirth);
  const zodiac = chineseZodiacFromDob(client.dateOfBirth);

  return (
    <div className="flex flex-col gap-5">
      {/* Birthprint chips */}
      <div>
        <p className={EYEBROW}>Birthprint</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {client.birthCardName ? (
            <Chip label="Birth Card" value={client.birthCardName} />
          ) : null}
          <Chip label="Life Path" value={`${lifePath}`} />
          <Chip label="Personal Year" value={`${personalYear}`} />
          <Chip label="Chinese Zodiac" value={zodiac} />
        </div>
      </div>

      {/* Intake */}
      <div>
        <p className={EYEBROW}>Most recent intake</p>
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DetailField label="DOB" value={formatDob(client.dateOfBirth)} />
          <DetailField
            label="Time"
            value={client.timeOfBirth ?? "Not provided"}
          />
          <DetailField
            label="Place"
            value={client.placeOfBirth ?? "Not provided"}
          />
        </div>
      </div>

      {/* Orders */}
      <div>
        <p className={EYEBROW}>Order history</p>
        <div className="mt-2.5 overflow-x-auto">
          {client.orders.length === 0 ? (
            <p
              className="text-cream/40 italic"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
              }}
            >
              No orders yet.
            </p>
          ) : (
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
                {client.orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-gold/10"
                    style={{ fontSize: "13px" }}
                  >
                    <td
                      className="py-2 pr-3 text-gold"
                      style={{
                        fontFamily:
                          "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                        fontSize: "12px",
                      }}
                    >
                      MHB-{o.id.replace(/-/g, "").slice(-4).toUpperCase()}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className={EYEBROW}>Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={commit}
          rows={4}
          placeholder="Internal notes about this client"
          className="mt-2.5 w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        />
        <div className="flex items-center justify-between mt-1.5">
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
          {pending ? (
            <span
              className="text-cream/40"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
              }}
            >
              Saving...
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function orderStatusLabel(o: ClientOrderSummary): string {
  if (o.reportStatus === "delivered") return "Delivered";
  if (o.reportStatus === "in_review") return "Review";
  if (o.reportStatus === "draft") return "Drafting";
  if (o.status === "paid") return "Queued";
  if (o.status === "pending") return "Pending";
  if (o.status === "failed") return "Failed";
  if (o.status === "refunded") return "Refunded";
  return "—";
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex flex-col border border-gold/30 rounded-lg px-3 py-1.5 bg-gold/5"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <span
        className="text-gold uppercase tracking-[0.2em]"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="text-cream"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        {value}
      </span>
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
      <p
        className="text-cream mt-1"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
        }}
      >
        {value}
      </p>
    </div>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="hearts" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>No clients yet</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        Your first client is on their way.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        When someone purchases, their profile will appear here.
      </p>
    </div>
  );
}
