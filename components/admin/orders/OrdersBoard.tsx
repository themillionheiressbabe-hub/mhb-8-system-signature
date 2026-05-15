"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type OrderClientPick = {
  id: string;
  mhbNumber: string;
  profileId: string;
  fullName: string;
};

export type OrderProductPick = {
  slug: string;
  name: string;
  engine: number | null;
  pricePence: number | null;
};

export type CreateOrderInput = {
  clientId: string;
  productSlug: string;
  notes: string;
};

export type UpdateOrderInput = {
  status: "pending" | "paid" | "failed" | "refunded";
  amountPence: number;
  notes: string;
};

export type EnrichedOrder = {
  id: string;
  orderNumber: string;
  profileId: string;
  productSlug: string;
  productName: string;
  amountPence: number;
  rawStatus: "pending" | "paid" | "failed" | "refunded";
  reportStatus: "draft" | "in_review" | "delivered" | null;
  engine: number | null;
  notes: string | null;
  createdAt: string;
  intakeTokenStatus: string | null;
  productSlaDays: number | null;
  clientFullName: string | null;
  clientEmail: string | null;
};

type StatusKey =
  | "queued"
  | "pending_intake"
  | "in_progress"
  | "review"
  | "delivered"
  | "failed"
  | "refunded";

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const STATUS_FILTERS: { key: StatusKey | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued" },
  { key: "pending_intake", label: "Pending Intake" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "delivered", label: "Delivered" },
];

const ENGINE_FILTERS = [0, 1, 2, 3, 4, 5, 6, 7];

const STATUS_INFO: Record<
  StatusKey,
  { label: string; bg: string; text: string }
> = {
  queued: {
    label: "Queued",
    bg: "rgba(181,30,90,0.15)",
    text: "#D63F7E",
  },
  pending_intake: {
    label: "Pending Intake",
    bg: "rgba(167,139,250,0.15)",
    text: "#A78BFA",
  },
  in_progress: {
    label: "In Progress",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  review: {
    label: "Review",
    bg: "rgba(201,169,110,0.15)",
    text: "#E8C988",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
  failed: {
    label: "Failed",
    bg: "rgba(232,93,117,0.18)",
    text: "#E85D75",
  },
  refunded: {
    label: "Refunded",
    bg: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.6)",
  },
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function deriveStatusKey(o: EnrichedOrder): StatusKey {
  if (o.rawStatus === "failed") return "failed";
  if (o.rawStatus === "refunded") return "refunded";
  if (o.reportStatus === "delivered") return "delivered";
  if (o.reportStatus === "in_review") return "review";
  if (o.reportStatus === "draft") return "in_progress";
  if (o.rawStatus === "paid") return "queued";
  return "pending_intake";
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

const PAGE_SIZE = 20;

type SortField = "date" | "price" | "status";
type SortDir = "asc" | "desc";

export function OrdersBoard({
  orders,
  clients,
  products,
  saveNotes,
  saveRawStatus,
  createOrder,
  updateOrder,
  deleteOrder,
}: {
  orders: EnrichedOrder[];
  clients: OrderClientPick[];
  products: OrderProductPick[];
  saveNotes: (id: string, notes: string) => Promise<void>;
  saveRawStatus: (
    id: string,
    status: "pending" | "paid" | "failed" | "refunded",
  ) => Promise<void>;
  createOrder: (
    input: CreateOrderInput,
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  updateOrder: (
    id: string,
    input: UpdateOrderInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteOrder: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");
  const [engineFilter, setEngineFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const totalOrders = orders.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && deriveStatusKey(o) !== statusFilter)
        return false;
      if (engineFilter !== "all" && (o.engine ?? 0) !== engineFilter)
        return false;
      if (!q) return true;
      const hay = [
        o.id,
        o.orderNumber,
        o.profileId,
        o.productSlug,
        o.productName,
        o.clientFullName ?? "",
        o.clientEmail ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, search, statusFilter, engineFilter]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortField === "price") cmp = a.amountPence - b.amountPence;
      else if (sortField === "status")
        cmp = deriveStatusKey(a).localeCompare(deriveStatusKey(b));
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
      setSortDir("desc");
    }
  }

  const editingOrder = editingId
    ? orders.find((o) => o.id === editingId) ?? null
    : null;
  const deletingOrder = deletingId
    ? orders.find((o) => o.id === deletingId) ?? null
    : null;

  if (totalOrders === 0) {
    return (
      <>
        <EmptyStateWithAdd onAdd={() => setAddOpen(true)} />
        {addOpen ? (
          <NewOrderModal
            clients={clients}
            products={products}
            onCancel={() => setAddOpen(false)}
            onCreate={createOrder}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Orders</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            All Orders.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-gold"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {totalOrders} {totalOrders === 1 ? "order" : "orders"}
          </span>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            + New Order
          </button>
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
        placeholder="Search by client ID, product, or email..."
        className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 w-full max-w-2xl"
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

      {/* Table */}
      <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr
                className="text-left"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Th>Order</Th>
                <Th>Client</Th>
                <Th>Product</Th>
                <Th>Engine</Th>
                <Th sortable onClick={() => toggleSort("price")} sortActive={sortField === "price"} sortDir={sortDir}>
                  Price
                </Th>
                <Th sortable onClick={() => toggleSort("status")} sortActive={sortField === "status"} sortDir={sortDir}>
                  Status
                </Th>
                <Th sortable onClick={() => toggleSort("date")} sortActive={sortField === "date"} sortDir={sortDir}>
                  Date
                </Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-cream/40 italic"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    No orders match these filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((o) => {
                  const isOpen = expandedId === o.id;
                  return (
                    <OrderRow
                      key={o.id}
                      order={o}
                      isOpen={isOpen}
                      isEditingStatus={editingStatusId === o.id}
                      onToggleExpand={() =>
                        setExpandedId(isOpen ? null : o.id)
                      }
                      onEditStatus={() =>
                        setEditingStatusId(
                          editingStatusId === o.id ? null : o.id,
                        )
                      }
                      onSaveStatus={async (next) => {
                        await saveRawStatus(o.id, next);
                        setEditingStatusId(null);
                      }}
                      onSaveNotes={async (notes) => {
                        await saveNotes(o.id, notes);
                      }}
                      onEdit={() => setEditingId(o.id)}
                      onDelete={() => setDeletingId(o.id)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {addOpen ? (
        <NewOrderModal
          clients={clients}
          products={products}
          onCancel={() => setAddOpen(false)}
          onCreate={createOrder}
        />
      ) : null}

      {editingOrder ? (
        <EditOrderModal
          order={editingOrder}
          onCancel={() => setEditingId(null)}
          onSave={async (input) => {
            const res = await updateOrder(editingOrder.id, input);
            if (res.ok) setEditingId(null);
            return res;
          }}
        />
      ) : null}

      {deletingOrder ? (
        <ConfirmModal
          title="Delete order"
          body={`Are you sure you want to delete ${deletingOrder.orderNumber}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeletingId(null)}
          onConfirm={async () => {
            await deleteOrder(deletingOrder.id);
            setDeletingId(null);
          }}
        />
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

function Th({
  children,
  sortable = false,
  sortActive = false,
  sortDir = "desc",
  onClick,
}: {
  children: React.ReactNode;
  sortable?: boolean;
  sortActive?: boolean;
  sortDir?: SortDir;
  onClick?: () => void;
}) {
  return (
    <th
      className="px-4 py-3 border-b border-[rgba(201,169,110,0.15)] text-cream/60 uppercase"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        letterSpacing: "0.2em",
        fontWeight: 500,
      }}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 hover:text-cream transition-colors"
        >
          {children}
          <span
            className="text-gold"
            style={{
              opacity: sortActive ? 1 : 0,
              fontSize: "10px",
            }}
            aria-hidden="true"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
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

function OrderRow({
  order,
  isOpen,
  isEditingStatus,
  onToggleExpand,
  onEditStatus,
  onSaveStatus,
  onSaveNotes,
  onEdit,
  onDelete,
}: {
  order: EnrichedOrder;
  isOpen: boolean;
  isEditingStatus: boolean;
  onToggleExpand: () => void;
  onEditStatus: () => void;
  onSaveStatus: (
    s: "pending" | "paid" | "failed" | "refunded",
  ) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusKey = deriveStatusKey(order);
  const statusInfo = STATUS_INFO[statusKey];

  return (
    <>
      <tr
        className="border-b border-[rgba(201,169,110,0.08)] hover:bg-[rgba(201,169,110,0.04)] cursor-pointer transition-colors"
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3.5">
          <span
            className="text-gold"
            style={{
              fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "13px",
              letterSpacing: "0.05em",
            }}
          >
            {order.orderNumber}
          </span>
        </td>
        <td
          className="px-4 py-3.5 text-cream"
          style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
        >
          {order.clientFullName ?? <span className="text-cream/30">—</span>}
        </td>
        <td
          className="px-4 py-3.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <span className="serif-it text-magenta" style={{ fontSize: "15px" }}>
            {order.productName || (
              <span className="text-cream/30">{order.productSlug}</span>
            )}
          </span>
        </td>
        <td className="px-4 py-3.5">
          {order.engine ? (
            <span
              className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2.5 py-0.5"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                fontWeight: 500,
              }}
            >
              E{order.engine}
            </span>
          ) : (
            <span className="text-cream/30">—</span>
          )}
        </td>
        <td
          className="px-4 py-3.5 text-gold"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {formatPrice(order.amountPence)}
        </td>
        <td className="px-4 py-3.5">
          <span
            className="inline-flex rounded-full px-2.5 py-1 uppercase"
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.text,
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              fontWeight: 500,
            }}
          >
            {statusInfo.label}
          </span>
        </td>
        <td
          className="px-4 py-3.5"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {formatDate(order.createdAt)}
        </td>
        <td className="px-4 py-3.5">
          <div
            className="flex items-center gap-1.5 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionPill label="View" href={`/admin/orders/${order.id}`} />
            <ActionPill label="Edit Status" onClick={onEditStatus} />
            <ActionPill label="Edit" onClick={onEdit} />
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex text-rose border border-rose/40 rounded-full px-3 py-1 hover:bg-rose/10 transition-colors uppercase tracking-[0.16em]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Delete
            </button>
            <ActionPill label="Message" />
          </div>
        </td>
      </tr>

      {isEditingStatus ? (
        <tr className="bg-[#0D1220] border-b border-[rgba(201,169,110,0.08)]">
          <td colSpan={8} className="px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-gold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                Set payment status
              </span>
              <StatusEditButtons
                current={order.rawStatus}
                onPick={onSaveStatus}
              />
            </div>
          </td>
        </tr>
      ) : null}

      {isOpen ? (
        <tr className="bg-[#0D1220] border-b border-[rgba(201,169,110,0.08)]">
          <td colSpan={8} className="px-6 py-5">
            <RowDetail order={order} onSaveNotes={onSaveNotes} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ActionPill({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "inline-flex text-gold border border-gold/40 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors";
  const style: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 500,
  };
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {label}
    </button>
  );
}

function StatusEditButtons({
  current,
  onPick,
}: {
  current: "pending" | "paid" | "failed" | "refunded";
  onPick: (s: "pending" | "paid" | "failed" | "refunded") => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const options: { value: typeof current; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = current === o.value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void onPick(o.value))}
            className={`rounded-full px-3 py-1.5 uppercase tracking-[0.18em] transition-colors ${
              active
                ? "bg-magenta text-cream hover:bg-magenta-bright"
                : "text-gold border border-gold/40 hover:bg-gold/10"
            } ${pending ? "opacity-60 cursor-wait" : ""}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RowDetail({
  order,
  onSaveNotes,
}: {
  order: EnrichedOrder;
  onSaveNotes: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(order.notes ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();
  const days = daysSinceIso(order.createdAt);

  function commit() {
    if (notes === (order.notes ?? "")) return;
    startTransition(async () => {
      await onSaveNotes(notes);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1500);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5">
      <div className="flex flex-col gap-3">
        <DetailRow label="Intake token" value={order.intakeTokenStatus ?? "—"} />
        <DetailRow
          label="Product SLA"
          value={
            order.productSlaDays
              ? `${order.productSlaDays} days`
              : "—"
          }
        />
        <DetailRow label="Days since order" value={`${days}`} />
        <DetailRow
          label="Client email"
          value={order.clientEmail ?? "—"}
        />
        <DetailRow label="Stripe session" value={order.id.slice(0, 8) + "…"} />
      </div>

      <div className="flex flex-col gap-2">
        <span
          className="text-gold uppercase tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={commit}
          rows={5}
          placeholder="Internal notes for this order"
          className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
          style={{
            fontFamily: "var(--font-sans)",
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
              style={{ fontFamily: "var(--font-sans)", fontSize: "11px" }}
            >
              Saving...
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-gold/10 pb-1.5">
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
        style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="diamonds" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>No orders yet</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        Your first order is coming.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        When a client purchases, their order will appear here.
      </p>
    </div>
  );
}

function EmptyStateWithAdd({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="diamonds" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>No orders yet</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        Your first order is coming.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        When a client purchases, their order will appear here.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        + New Order
      </button>
    </div>
  );
}

const EYEBROW_INLINE =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

function NewOrderModal({
  clients,
  products,
  onCancel,
  onCreate,
}: {
  clients: OrderClientPick[];
  products: OrderProductPick[];
  onCancel: () => void;
  onCreate: (
    input: CreateOrderInput,
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
}) {
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients.slice(0, 10);
    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.mhbNumber.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [clients, search]);

  const productsByEngine = useMemo(() => {
    const map = new Map<number, OrderProductPick[]>();
    for (const p of products) {
      const eng = typeof p.engine === "number" ? p.engine : -1;
      const arr = map.get(eng) ?? [];
      arr.push(p);
      map.set(eng, arr);
    }
    return map;
  }, [products]);
  const engineKeys = useMemo(
    () =>
      Array.from(productsByEngine.keys()).sort(
        (a, b) => (a < 0 ? 99 : a) - (b < 0 ? 99 : b),
      ),
    [productsByEngine],
  );

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !productSlug) {
      setError("Pick a client and a product before saving.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onCreate({
        clientId,
        productSlug,
        notes: notes.trim(),
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
        <p className={EYEBROW_INLINE}>New Order</p>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Client
          </label>
          {selectedClient ? (
            <div className="flex items-center justify-between gap-3 bg-[#0D1220] rounded-lg px-3 py-2 border border-[rgba(201,169,110,0.25)]">
              <span>
                <span
                  className="text-gold"
                  style={{
                    fontFamily:
                      "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                    fontSize: "12px",
                    marginRight: "8px",
                  }}
                >
                  {selectedClient.mhbNumber}
                </span>
                <span
                  className="text-cream"
                  style={{ fontSize: "14px" }}
                >
                  {selectedClient.fullName}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setClientId("")}
                className="text-cream/50 hover:text-cream uppercase tracking-[0.2em]"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or MHB number..."
                className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
                style={{ fontSize: "14px" }}
              />
              <ul className="mt-1 max-h-44 overflow-y-auto flex flex-col gap-0.5">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setClientId(c.id)}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-gold/10 rounded transition-colors flex items-center gap-3"
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
                        style={{ fontSize: "13px" }}
                      >
                        {c.fullName}
                      </span>
                    </button>
                  </li>
                ))}
                {matches.length === 0 ? (
                  <li
                    className="text-cream/40 italic px-2 py-1.5"
                    style={{ fontSize: "13px" }}
                  >
                    No matches.
                  </li>
                ) : null}
              </ul>
            </>
          )}
        </div>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Product
          </label>
          <select
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          >
            <option value="">Select a product</option>
            {engineKeys.map((eng) => (
              <optgroup
                key={eng}
                label={eng >= 0 ? `Engine ${eng}` : "Unassigned"}
              >
                {(productsByEngine.get(eng) ?? []).map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional context"
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          />
        </div>

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
            {pending ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditOrderModal({
  order,
  onCancel,
  onSave,
}: {
  order: EnrichedOrder;
  onCancel: () => void;
  onSave: (
    input: UpdateOrderInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [status, setStatus] = useState<
    "pending" | "paid" | "failed" | "refunded"
  >(order.rawStatus);
  const [amount, setAmount] = useState((order.amountPence / 100).toFixed(2));
  const [notes, setNotes] = useState(order.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    setError(null);
    const amountPence = Math.round(parsed * 100);
    startTransition(async () => {
      const res = await onSave({ status, amountPence, notes: notes.trim() });
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
        <p className={EYEBROW_INLINE}>Edit Order · {order.orderNumber}</p>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as typeof status)
            }
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Amount (£)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          />
        </div>

        <div>
          <label
            className="block text-gold uppercase tracking-[0.2em] mb-1.5"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          />
        </div>

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
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
