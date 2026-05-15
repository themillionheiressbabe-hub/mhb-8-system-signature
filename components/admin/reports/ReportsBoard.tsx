"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";

export type ReportSectionShape = {
  title?: string;
  complete?: boolean;
};

export type ReportStatus = "draft" | "in_review" | "approved" | "delivered";

export type EnrichedReport = {
  id: string;
  reportNumber: string;
  orderId: string;
  clientId: string;
  clientName: string;
  productSlug: string;
  productName: string;
  engine: number | null;
  status: ReportStatus;
  slaDays: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  sectionCount: number;
  completedSections: number;
  sectionTitles: string[];
  sectionCompletes: boolean[];
};

type StatusFilter = "all" | ReportStatus;
type SortKey = "newest" | "oldest" | "client" | "status";

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "in_review", label: "In Review" },
  { key: "approved", label: "Approved" },
  { key: "delivered", label: "Delivered" },
];

const ENGINE_FILTERS = [0, 1, 2, 3, 4, 5, 6, 7];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "client", label: "By Client" },
  { key: "status", label: "By Status" },
];

const STATUS_INFO: Record<
  ReportStatus,
  { label: string; bg: string; text: string }
> = {
  draft: {
    label: "Draft",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  in_review: {
    label: "In Review",
    bg: "rgba(167,139,250,0.15)",
    text: "#A78BFA",
  },
  approved: {
    label: "Approved",
    bg: "rgba(181,30,90,0.15)",
    text: "#D63F7E",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
};

const NEXT_STAGE: Partial<Record<ReportStatus, ReportStatus>> = {
  draft: "in_review",
  in_review: "approved",
  approved: "delivered",
};

const NEXT_STAGE_LABEL: Partial<Record<ReportStatus, string>> = {
  draft: "Send to Review",
  in_review: "Approve",
  approved: "Deliver",
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const PAGE_SIZE = 20;

export function ReportsBoard({
  reports,
  moveStage,
  deleteReport,
}: {
  reports: EnrichedReport[];
  moveStage: (id: string, next: ReportStatus) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [engineFilter, setEngineFilter] = useState<number | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const out: Record<ReportStatus, number> = {
      draft: 0,
      in_review: 0,
      approved: 0,
      delivered: 0,
    };
    for (const r of reports) {
      out[r.status] = (out[r.status] ?? 0) + 1;
    }
    return out;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (engineFilter !== "all" && (r.engine ?? 0) !== engineFilter)
        return false;
      if (!q) return true;
      const hay = [
        r.id,
        r.reportNumber,
        r.clientName,
        r.productName,
        r.productSlug,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [reports, search, statusFilter, engineFilter]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      if (sortKey === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sortKey === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sortKey === "client") return a.clientName.localeCompare(b.clientName);
      return a.status.localeCompare(b.status);
    });
    return out;
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  if (reports.length === 0) {
    return <EmptyState />;
  }

  function handleMove(id: string, next: ReportStatus) {
    startTransition(async () => {
      await moveStage(id, next);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteReport(id);
      setConfirmId(null);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Reports</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            All reports.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-gold"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {reports.length}{" "}
            {reports.length === 1 ? "report" : "reports"}
          </span>
          <Link
            href="/admin/reports/new"
            className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            + New Report
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiTile label="Draft" value={totals.draft} color="#C9A96E" />
        <KpiTile label="In Review" value={totals.in_review} color="#A78BFA" />
        <KpiTile label="Approved" value={totals.approved} color="#D63F7E" />
        <KpiTile label="Delivered" value={totals.delivered} color="#2D9B6E" />
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search by client name, product, or report ID..."
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

      {/* Sort pills */}
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((s) => (
          <FilterPill
            key={s.key}
            label={s.label}
            active={sortKey === s.key}
            onClick={() => setSortKey(s.key)}
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
                <Th>Report</Th>
                <Th>Client</Th>
                <Th>Product</Th>
                <Th>Engine</Th>
                <Th>Status</Th>
                <Th>SLA</Th>
                <Th>Created</Th>
                <Th>Delivered</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-cream/40 italic"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    No reports match these filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => {
                  const isOpen = expandedId === r.id;
                  return (
                    <ReportRow
                      key={r.id}
                      report={r}
                      isOpen={isOpen}
                      confirming={confirmId === r.id}
                      pending={pending}
                      onToggleExpand={() =>
                        setExpandedId(isOpen ? null : r.id)
                      }
                      onMove={(next) => handleMove(r.id, next)}
                      onAskDelete={() =>
                        setConfirmId(confirmId === r.id ? null : r.id)
                      }
                      onConfirmDelete={() => handleDelete(r.id)}
                      onCancelDelete={() => setConfirmId(null)}
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
    </div>
  );
}

function KpiTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5">
      <p className={EYEBROW}>{label}</p>
      <p
        className="serif-it mt-2 leading-none"
        style={{
          fontSize: "44px",
          color,
        }}
      >
        {value}
      </p>
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

function Th({ children }: { children: React.ReactNode }) {
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
      {children}
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

function ReportRow({
  report,
  isOpen,
  confirming,
  pending,
  onToggleExpand,
  onMove,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  report: EnrichedReport;
  isOpen: boolean;
  confirming: boolean;
  pending: boolean;
  onToggleExpand: () => void;
  onMove: (next: ReportStatus) => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const statusInfo = STATUS_INFO[report.status];
  const slaInfo = computeSla(report);
  const completedPct =
    report.sectionCount > 0
      ? Math.round((report.completedSections / report.sectionCount) * 100)
      : 0;

  return (
    <Fragment>
      <tr
        className="border-b border-[rgba(201,169,110,0.08)] hover:bg-[rgba(201,169,110,0.04)] cursor-pointer transition-colors"
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3.5">
          <span
            className="text-gold"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "12px",
              letterSpacing: "0.05em",
            }}
          >
            {report.reportNumber}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <span
            className="serif-it text-white"
            style={{ fontSize: "16px" }}
          >
            {report.clientName}
          </span>
        </td>
        <td
          className="px-4 py-3.5 text-magenta"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {report.productName || (
            <span className="text-cream/30">{report.productSlug}</span>
          )}
        </td>
        <td className="px-4 py-3.5">
          {report.engine ? (
            <span
              className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2.5 py-0.5"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                fontWeight: 500,
              }}
            >
              E{report.engine}
            </span>
          ) : (
            <span className="text-cream/30">—</span>
          )}
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
            color: slaInfo.color,
            fontWeight: 500,
          }}
        >
          {slaInfo.label}
        </td>
        <td
          className="px-4 py-3.5"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {formatDate(report.createdAt)}
        </td>
        <td
          className="px-4 py-3.5"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {report.deliveredAt ? (
            formatDate(report.deliveredAt)
          ) : (
            <span className="text-cream/30">—</span>
          )}
        </td>
        <td className="px-4 py-3.5">
          <div
            className="flex items-center gap-1.5 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionPill label="Edit" href={`/admin/reports/${report.id}`} />
            <MoveStageMenu
              current={report.status}
              pending={pending}
              onPick={(next) => onMove(next)}
            />
            {confirming ? (
              <>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={pending}
                  className="bg-rose text-cream rounded-full px-3 py-1 hover:brightness-110 transition-[filter] uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="text-cream/50 hover:text-cream text-[11px] uppercase tracking-[0.18em] px-2 py-1 transition-colors"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onAskDelete}
                className="text-rose border border-rose/40 rounded-full px-3 py-1 hover:bg-rose/10 transition-colors uppercase tracking-[0.18em]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            )}
          </div>
        </td>
      </tr>

      {isOpen ? (
        <tr className="bg-[#0D1220] border-b border-[rgba(201,169,110,0.08)]">
          <td colSpan={9} className="px-6 py-6">
            <ReportDetail
              report={report}
              completedPct={completedPct}
              onMove={onMove}
            />
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function MoveStageMenu({
  current,
  pending,
  onPick,
}: {
  current: ReportStatus;
  pending: boolean;
  onPick: (next: ReportStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const allStages: ReportStatus[] = [
    "draft",
    "in_review",
    "approved",
    "delivered",
  ];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={pending}
        className="text-gold border border-gold/40 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 500,
        }}
      >
        Move Stage
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full mt-1 bg-[#0D1220] border border-gold/30 rounded-lg p-1.5 z-20 min-w-[160px]"
          style={{
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {allStages.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s !== current) onPick(s);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 rounded transition-colors ${
                current === s ? "text-magenta" : "text-cream hover:bg-gold/10"
              }`}
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {STATUS_INFO[s].label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
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

function ReportDetail({
  report,
  completedPct,
  onMove,
}: {
  report: EnrichedReport;
  completedPct: number;
  onMove: (next: ReportStatus) => void;
}) {
  const nextStage = NEXT_STAGE[report.status];
  const nextLabel = nextStage ? NEXT_STAGE_LABEL[report.status] : null;
  const isDeliverNext = nextStage === "delivered";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          className="serif-it text-white"
          style={{ fontSize: "22px", lineHeight: 1.2 }}
        >
          {report.clientName}
        </h3>
        <span
          className="text-magenta"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {report.productName || report.productSlug}
        </span>
        {report.engine ? (
          <span
            className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2 py-0.5"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              fontWeight: 500,
            }}
          >
            Engine {report.engine}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailKv label="Created" value={formatDate(report.createdAt)} />
        <DetailKv label="Last updated" value={formatDate(report.updatedAt)} />
        <DetailKv
          label="Delivered"
          value={report.deliveredAt ? formatDate(report.deliveredAt) : "Not yet"}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <p className={EYEBROW}>Sections</p>
          <span
            className="text-cream/50"
            style={{ fontFamily: "var(--font-sans)", fontSize: "12px" }}
          >
            {report.completedSections} of {report.sectionCount} complete ·{" "}
            {completedPct}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 6,
            border: "1px solid rgba(201,169,110,0.4)",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
          aria-label={`Sections ${completedPct}% complete`}
        >
          <div
            className="h-full bg-magenta transition-[width]"
            style={{ width: `${completedPct}%` }}
          />
        </div>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {report.sectionTitles.map((title, i) => (
            <li
              key={i}
              className="flex items-center gap-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {report.sectionCompletes[i] ? (
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    backgroundColor: "rgba(45,155,110,0.18)",
                    border: "1px solid #2D9B6E",
                    color: "#2D9B6E",
                    fontSize: 9,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    border: "1px solid rgba(201,169,110,0.5)",
                  }}
                />
              )}
              <span
                className="text-cream/80"
                style={{ fontSize: "13px" }}
              >
                {String(i + 1).padStart(2, "0")} · {title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/reports/new?order=${report.orderId}`}
          className="bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          Open Report Builder
        </Link>
        {nextStage && nextLabel ? (
          <button
            type="button"
            onClick={() => onMove(nextStage)}
            className={`rounded-full px-4 py-2 uppercase tracking-[0.18em] transition-colors ${
              isDeliverNext
                ? "bg-emerald text-cream hover:brightness-110 transition-[filter]"
                : "bg-magenta text-cream hover:bg-magenta-bright"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DetailKv({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
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

function computeSla(report: EnrichedReport): {
  label: string;
  color: string;
} {
  if (report.status === "delivered") {
    return { label: "Delivered", color: "rgba(255,255,255,0.45)" };
  }
  const deadline = new Date(addDaysIso(report.createdAt, report.slaDays));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) {
    return {
      label: `${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} overdue`,
      color: "#B51E5A",
    };
  }
  if (diff <= 3) {
    return {
      label: `${diff} day${diff === 1 ? "" : "s"} left`,
      color: "#C9A96E",
    };
  }
  return {
    label: `${diff} days left`,
    color: "#2D9B6E",
  };
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Orbit size={120} suit="diamonds" compact showCardinals={false} />
      <p className={`${EYEBROW} mt-6`}>No reports yet</p>
      <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
        Your first report is waiting to be built.
      </h1>
      <p
        className="text-cream/70 max-w-md mt-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        Create a new report to get started.
      </p>
      <Link
        href="/admin/reports/new"
        className="mt-6 bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        + New Report
      </Link>
    </div>
  );
}
