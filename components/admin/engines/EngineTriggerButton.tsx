"use client";

import { useState, useTransition } from "react";

export function EngineTriggerButton({
  label,
  pendingLabel = "Working...",
  successLabel = "Generated successfully",
  variant = "magenta",
  action,
}: {
  label: string;
  pendingLabel?: string;
  successLabel?: string;
  variant?: "magenta" | "gold";
  action: () => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "ok"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setStatus({ kind: "idle" });
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        setStatus({ kind: "ok", message: successLabel });
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  }

  const styles =
    variant === "magenta"
      ? "bg-magenta text-cream hover:bg-magenta-bright"
      : "text-gold border border-gold/40 hover:bg-gold/10";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`${styles} rounded-full px-4 py-2 uppercase tracking-[0.18em] transition-colors self-start ${
          pending ? "opacity-60 cursor-wait" : ""
        }`}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 500,
        }}
      >
        {pending ? pendingLabel : label}
      </button>
      {status.kind === "ok" ? (
        <p
          className="text-emerald"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
          }}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p
          className="text-magenta"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
          role="alert"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
