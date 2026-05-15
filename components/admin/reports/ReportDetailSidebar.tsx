"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type ReportStatus = "draft" | "in_review" | "approved" | "delivered";

const NEXT_STAGE: Record<ReportStatus, ReportStatus | null> = {
  draft: "in_review",
  in_review: "approved",
  approved: "delivered",
  delivered: null,
};

const NEXT_LABEL: Record<ReportStatus, string> = {
  draft: "Move to Review",
  in_review: "Move to Approved",
  approved: "Move to Delivered",
  delivered: "Delivered",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

export function ReportDetailSidebar({
  status,
  orderId,
  sections,
  reportLabel,
  moveStage,
  deliver,
  deleteReport,
}: {
  status: ReportStatus;
  orderId: string;
  sections: { id: string; title: string; number: number }[];
  reportLabel: string;
  moveStage: () => Promise<void>;
  deliver: () => Promise<void>;
  deleteReport: () => Promise<void>;
}) {
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [pendingMove, startMove] = useTransition();
  const [pendingDeliver, startDeliver] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (sections.length === 0) return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      {
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0,
      },
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [sections]);

  const next = NEXT_STAGE[status];

  return (
    <aside
      className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl lg:sticky"
      style={{
        padding: "20px",
        top: "16px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>In This Report</p>
      <ol className="mt-3 flex flex-col gap-1">
        {sections.length === 0 ? (
          <li
            className="text-cream/40 italic"
            style={{ fontSize: "13px" }}
          >
            No sections yet.
          </li>
        ) : null}
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-lg px-3 py-1.5 transition-colors"
                style={{
                  color: isActive ? "#D63F7E" : "rgba(244,241,237,0.7)",
                  borderLeft: isActive
                    ? "2px solid #B51E5A"
                    : "2px solid transparent",
                  fontSize: "13px",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  className="text-gold mr-2"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  {String(s.number).padStart(2, "0")}
                </span>
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 pt-4 border-t border-gold/10 flex flex-col gap-2">
        <Link
          href={`/admin/reports/new?order=${orderId}`}
          className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Edit Report
        </Link>

        {next ? (
          <button
            type="button"
            disabled={pendingMove}
            onClick={() => startMove(() => moveStage())}
            className={`bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em] ${
              pendingMove ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {pendingMove ? "Moving..." : NEXT_LABEL[status]}
          </button>
        ) : null}

        {status === "approved" ? (
          <button
            type="button"
            disabled={pendingDeliver}
            onClick={() => startDeliver(() => deliver())}
            className={`bg-emerald text-cream rounded-full px-4 py-2 hover:brightness-110 transition-[filter] uppercase tracking-[0.18em] ${
              pendingDeliver ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {pendingDeliver ? "Delivering..." : "Deliver to Client"}
          </button>
        ) : null}

        <button
          type="button"
          className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Download PDF
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="text-rose border border-rose/40 rounded-full px-4 py-2 hover:bg-rose/10 transition-colors uppercase tracking-[0.18em]"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Delete Report
        </button>
      </div>

      {confirmDelete ? (
        <ConfirmModal
          title="Delete report"
          body={`Are you sure you want to delete ${reportLabel}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteReport();
            setConfirmDelete(false);
          }}
        />
      ) : null}
    </aside>
  );
}
