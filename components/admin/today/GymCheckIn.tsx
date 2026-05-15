"use client";

import { useEffect, useState } from "react";

type Status = "pending" | "done" | "skipped";
type State = { status: Status; reason?: string };

type Props = {
  storageKey: string;
  isTrainingDay: boolean;
};

export function GymCheckIn({ storageKey, isTrainingDay }: Props) {
  const [state, setState] = useState<State>({ status: "pending" });
  const [hydrated, setHydrated] = useState(false);
  const [reasonDraft, setReasonDraft] = useState("");
  const [askingReason, setAskingReason] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey]);

  function persist(next: State) {
    setState(next);
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  if (!isTrainingDay) {
    return (
      <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-6">
        <p className="serif-it text-gold text-xl">Rest day. Good.</p>
      </div>
    );
  }

  if (state.status === "done") {
    return (
      <div className="bg-emerald/10 border border-emerald/40 rounded-2xl p-6 flex items-center gap-3">
        <span className="text-emerald text-2xl leading-none">✓</span>
        <p className="text-emerald text-base" style={{ fontFamily: "var(--font-sans)" }}>
          Checked in.
        </p>
        <button
          type="button"
          onClick={() => persist({ status: "pending" })}
          className="ml-auto text-cream/40 hover:text-cream/70 text-xs uppercase tracking-[0.2em] transition-colors"
        >
          Undo
        </button>
      </div>
    );
  }

  if (state.status === "skipped") {
    return (
      <div className="bg-[#0D1220] border border-[rgba(201,169,110,0.10)] rounded-2xl p-6 opacity-60">
        <p className="text-cream/70 text-base" style={{ fontFamily: "var(--font-sans)" }}>
          Skipping today.
        </p>
        {state.reason ? (
          <p className="text-cream/50 text-sm mt-1.5">
            Reason: {state.reason}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => persist({ status: "pending" })}
          className="mt-3 text-cream/40 hover:text-cream/70 text-xs uppercase tracking-[0.2em] transition-colors"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-6">
      <p className="text-cream text-base" style={{ fontFamily: "var(--font-sans)" }}>
        Training day. Have you been?
      </p>

      {askingReason ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={reasonDraft}
            onChange={(e) => setReasonDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                persist({ status: "skipped", reason: reasonDraft.trim() });
                setAskingReason(false);
                setReasonDraft("");
              }
              if (e.key === "Escape") {
                setAskingReason(false);
                setReasonDraft("");
              }
            }}
            placeholder="Why skipping?"
            autoFocus
            className="flex-1 bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <button
            type="button"
            onClick={() => {
              persist({ status: "skipped", reason: reasonDraft.trim() });
              setAskingReason(false);
              setReasonDraft("");
            }}
            className="text-gold text-xs uppercase tracking-[0.2em] border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => persist({ status: "done" })}
            className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
          >
            Yes, done
          </button>
          <button
            type="button"
            onClick={() => setAskingReason(true)}
            className="text-gold text-xs uppercase tracking-[0.2em] border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors"
          >
            Skipping today
          </button>
        </div>
      )}
    </div>
  );
}
