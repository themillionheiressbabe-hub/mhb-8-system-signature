"use client";

import { useMemo, useState, useTransition } from "react";

export type QcReportOption = {
  id: string;
  clientName: string;
  productName: string;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

export function QcFlagButton({
  reports,
  flagReport,
}: {
  reports: QcReportOption[];
  flagReport: (
    reportId: string,
    reason: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [reportId, setReportId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports.slice(0, 12);
    return reports
      .filter(
        (r) =>
          r.clientName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [search, reports]);

  const selected = reportId
    ? reports.find((r) => r.id === reportId) ?? null
    : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportId) {
      setError("Pick a report to flag.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await flagReport(reportId, reason.trim());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setReportId("");
      setSearch("");
      setReason("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
      >
        + Flag Report
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
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
            <p className={EYEBROW}>Flag Report</p>

            <div>
              <label
                className="block text-gold uppercase tracking-[0.2em] mb-1.5"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Report
              </label>
              {selected ? (
                <div className="flex items-center justify-between gap-3 bg-[#0D1220] rounded-lg px-3 py-2 border border-[rgba(201,169,110,0.25)]">
                  <span className="text-cream" style={{ fontSize: "14px" }}>
                    {selected.clientName} ·{" "}
                    <span className="text-magenta">{selected.productName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReportId("")}
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
                    placeholder="Search by client name or product..."
                    className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
                    style={{ fontSize: "14px" }}
                  />
                  <ul className="mt-1 max-h-52 overflow-y-auto flex flex-col gap-0.5">
                    {matches.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => setReportId(r.id)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-gold/10 rounded transition-colors flex items-center gap-3"
                        >
                          <span className="text-cream" style={{ fontSize: "13px" }}>
                            {r.clientName}
                          </span>
                          <span className="text-magenta" style={{ fontSize: "12px" }}>
                            · {r.productName}
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
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="What needs another look?"
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
                onClick={() => setOpen(false)}
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
                {pending ? "Flagging..." : "Save Flag"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export function QcEditFlagButton({
  reportId,
  initialReason,
  updateFlag,
}: {
  reportId: string;
  initialReason: string;
  updateFlag: (
    reportId: string,
    reason: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(initialReason);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateFlag(reportId, reason.trim());
      if (!res.ok) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setReason(initialReason);
          setOpen(true);
        }}
        className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 500,
        }}
      >
        Edit Flag
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
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
            <p className={EYEBROW}>Edit Flag</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="What needs another look?"
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
              style={{ fontSize: "14px", lineHeight: 1.5 }}
            />
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
                onClick={() => setOpen(false)}
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
                {pending ? "Saving..." : "Save Flag"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
