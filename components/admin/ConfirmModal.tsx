"use client";

import { useTransition } from "react";

export function ConfirmModal({
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-[#151B33] rounded-2xl w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "28px",
          border: "1px solid rgba(201,169,110,0.25)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p
          className="font-sans uppercase tracking-[0.35em] text-gold font-semibold"
          style={{ fontSize: "10.5px" }}
        >
          {title}
        </p>
        <p
          className="text-cream"
          style={{ fontSize: "15px", lineHeight: 1.55 }}
        >
          {body}
        </p>
        <div className="flex justify-end gap-3 mt-2">
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
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => {
              await onConfirm();
            })}
            className={`bg-rose text-cream rounded-full px-5 py-2.5 hover:brightness-110 transition-[filter] uppercase tracking-[0.2em] ${
              pending ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
