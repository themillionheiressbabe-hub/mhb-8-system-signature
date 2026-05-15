"use client";

import { useEffect, useRef, useState } from "react";

type Category = "build" | "content" | "strategy" | "personal" | "ideas";

type Note = {
  id: string;
  title: string;
  category: Category;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
};

const STORAGE_KEY = "admin_notes";

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const CATEGORY_ORDER: { value: Category; label: string }[] = [
  { value: "build", label: "Build" },
  { value: "content", label: "Content" },
  { value: "strategy", label: "Strategy" },
  { value: "personal", label: "Personal" },
  { value: "ideas", label: "Ideas" },
];

function newId(): string {
  return `note_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("ideas");
  const [toast, setToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCapture =
        e.ctrlKey &&
        e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        (e.key === "N" || e.key === "n");
      if (isCapture) {
        e.preventDefault();
        setOpen(true);
        setTitle("");
        setContent("");
        setCategory("ideas");
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => titleRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim() || "Untitled note";
    const cleanContent = content.trim();
    if (!cleanContent && title.trim() === "") return;

    let existing: Note[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) existing = JSON.parse(raw) as Note[];
    } catch {
      // ignore parse errors
    }

    const nowIso = new Date().toISOString();
    const note: Note = {
      id: newId(),
      title: cleanTitle,
      category,
      content: cleanContent,
      createdAt: nowIso,
      updatedAt: nowIso,
      pinned: false,
    };

    const next = [note, ...existing];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }

    setOpen(false);
    setToast(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(false);
    }, 2000);
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Quick capture"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-2xl p-7 w-full max-w-md flex flex-col gap-4"
          >
            <p className={EYEBROW}>Quick Capture</p>

            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to capture..."
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                minHeight: "120px",
                lineHeight: 1.55,
              }}
            />

            <label className="flex flex-col gap-1.5">
              <span
                className="text-gold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
                style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end gap-3 mt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gold text-xs uppercase tracking-[0.2em] border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
              >
                Save to Notes
              </button>
            </div>

            <p
              className="text-cream/35 text-[11px] uppercase tracking-[0.2em] mt-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Esc to close · Ctrl + Shift + N to reopen
            </p>
          </form>
        </div>
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
          Note saved.
        </div>
      ) : null}
    </>
  );
}
