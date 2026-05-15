"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const CATEGORY_INFO: Record<Category, { label: string; bg: string }> = {
  build: { label: "Build", bg: "#B51E5A" },
  content: { label: "Content", bg: "#C9A96E" },
  strategy: { label: "Strategy", bg: "#A78BFA" },
  personal: { label: "Personal", bg: "#2D9B6E" },
  ideas: { label: "Ideas", bg: "#F59E0B" },
};

const CATEGORY_ORDER: Category[] = [
  "build",
  "content",
  "strategy",
  "personal",
  "ideas",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STARTER_NOTES: Array<
  Pick<Note, "title" | "category" | "content"> & { pinned?: boolean }
> = [
  {
    title: "Build priorities before launch",
    category: "build",
    content:
      "Railway worker for Content Studio video pipeline. Stripe live mode. Supabase RLS audit. Legal pages. Content gaps panel on Content Intelligence.",
    pinned: true,
  },
  {
    title: "Content ideas",
    category: "content",
    content:
      "TikTok: pattern recognition series. Instagram: Old Script vs New Script carousels. Threads: welcome posts for each avatar. Check Creator Insights daily for content gaps.",
  },
  {
    title: "Launch strategy notes",
    category: "strategy",
    content:
      "Launch date 24 September 2026. Skool community announcement first. Beta testers from existing audience. Soft launch then public.",
  },
];

function newId(): string {
  return `note_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatNoteDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const todayKey = toDateKey(new Date());
  const noteKey = toDateKey(d);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (noteKey === todayKey) return `Today, ${time}`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (noteKey === toDateKey(yesterday)) return `Yesterday, ${time}`;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function firstLine(s: string): string {
  const t = s.trim();
  const idx = t.indexOf("\n");
  return idx === -1 ? t : t.slice(0, idx);
}

function wordCount(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

type CategoryFilter = "all" | Category;

export function NotesBoard() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const flashHideRef = useRef<number | null>(null);

  useEffect(() => {
    let loaded: Note[] = [];
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as Note[];
    } catch {
      // ignore
    }

    if (raw === null) {
      const nowIso = new Date().toISOString();
      loaded = STARTER_NOTES.map((n) => ({
        id: newId(),
        title: n.title,
        category: n.category,
        content: n.content,
        createdAt: nowIso,
        updatedAt: nowIso,
        pinned: n.pinned ?? false,
      }));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      } catch {
        // ignore
      }
    }

    setNotes(loaded);
    if (loaded.length > 0) setSelectedId(loaded[0].id);
    setMounted(true);
  }, []);

  // Debounced auto-save: writes localStorage 500ms after the last edit
  // and flashes "Saved" for 2 seconds. Guarded by dirtyRef so the
  // initial mount does not flash.
  useEffect(() => {
    if (!mounted) return;
    if (!dirtyRef.current) return;

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch {
        // ignore quota errors
      }
      setSavedFlash(true);
      if (flashHideRef.current !== null) {
        window.clearTimeout(flashHideRef.current);
      }
      flashHideRef.current = window.setTimeout(() => {
        setSavedFlash(false);
      }, 2000);
    }, 500);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [notes, mounted]);

  function updateNote(id: string, patch: Partial<Note>) {
    dirtyRef.current = true;
    const nowIso = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: nowIso } : n,
      ),
    );
  }

  function togglePin(id: string) {
    dirtyRef.current = true;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  }

  function createNote(title: string, category: Category) {
    dirtyRef.current = true;
    const nowIso = new Date().toISOString();
    const note: Note = {
      id: newId(),
      title: title.trim() || "Untitled note",
      category,
      content: "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    setNewOpen(false);
  }

  function duplicateNote(id: string) {
    const source = notes.find((n) => n.id === id);
    if (!source) return;
    dirtyRef.current = true;
    const nowIso = new Date().toISOString();
    const copy: Note = {
      id: newId(),
      title: `${source.title} (copy)`,
      category: source.category,
      content: source.content,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setNotes((prev) => [copy, ...prev]);
    setSelectedId(copy.id);
  }

  function deleteNote(id: string) {
    dirtyRef.current = true;
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
    setDeleteConfirm(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    return sorted.filter((n) => {
      if (categoryFilter !== "all" && n.category !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });
  }, [notes, search, categoryFilter]);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const pinnedNotes = useMemo(
    () => filtered.filter((n) => n.pinned),
    [filtered],
  );
  const unpinnedNotes = useMemo(
    () => filtered.filter((n) => !n.pinned),
    [filtered],
  );

  if (!mounted) {
    return <div className="min-h-[500px]" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 min-h-[calc(100vh-80px)]">
      {/* Left column */}
      <aside className="flex flex-col gap-4">
        <p className={EYEBROW}>Notes</p>

        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors self-start"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          + New Note
        </button>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
          style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
        />

        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label="All"
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          />
          {CATEGORY_ORDER.map((c) => (
            <FilterPill
              key={c}
              label={CATEGORY_INFO[c].label}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p
              className="text-cream/40 text-sm italic mt-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {search ? "No matches." : "No notes yet."}
            </p>
          ) : null}

          {pinnedNotes.length > 0 ? (
            <>
              <p className={`${EYEBROW} mt-1 mb-0.5`}>Pinned</p>
              {pinnedNotes.map((n) => (
                <NoteRow
                  key={n.id}
                  note={n}
                  active={n.id === selectedId}
                  onSelect={() => {
                    setSelectedId(n.id);
                    setDeleteConfirm(false);
                  }}
                  onTogglePin={() => togglePin(n.id)}
                />
              ))}
              {unpinnedNotes.length > 0 ? (
                <hr className="border-0 border-t border-gold/10 my-2" />
              ) : null}
            </>
          ) : null}

          {unpinnedNotes.map((n) => (
            <NoteRow
              key={n.id}
              note={n}
              active={n.id === selectedId}
              onSelect={() => {
                setSelectedId(n.id);
                setDeleteConfirm(false);
              }}
              onTogglePin={() => togglePin(n.id)}
            />
          ))}
        </div>
      </aside>

      {/* Right column */}
      <section className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-6 flex flex-col min-h-[500px]">
        {selected ? (
          <Editor
            note={selected}
            savedFlash={savedFlash}
            deleteConfirm={deleteConfirm}
            onTitleChange={(v) => updateNote(selected.id, { title: v })}
            onCategoryChange={(v) =>
              updateNote(selected.id, { category: v })
            }
            onContentChange={(v) => updateNote(selected.id, { content: v })}
            onDuplicate={() => duplicateNote(selected.id)}
            onDeleteClick={() => {
              if (deleteConfirm) {
                deleteNote(selected.id);
              } else {
                setDeleteConfirm(true);
              }
            }}
            onCancelDelete={() => setDeleteConfirm(false)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="serif-it text-gold text-2xl text-center px-4">
              Select a note or create a new one.
            </p>
          </div>
        )}
      </section>

      {newOpen ? (
        <NewNoteModal
          onCreate={createNote}
          onCancel={() => setNewOpen(false)}
        />
      ) : null}
    </div>
  );
}

function PinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function NoteRow({
  note,
  active,
  onSelect,
  onTogglePin,
}: {
  note: Note;
  active: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  const cat = CATEGORY_INFO[note.category];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="text-left bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-xl p-3 hover:border-gold/40 transition-colors cursor-pointer relative"
      style={{
        borderLeftWidth: active ? 3 : 1,
        borderLeftColor: active ? "#B51E5A" : "rgba(201,169,110,0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-white truncate flex-1"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {note.title || "Untitled"}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          aria-pressed={note.pinned ?? false}
          className="shrink-0 -mr-0.5 -mt-0.5 p-1 rounded hover:bg-gold/10 transition-colors"
          style={{
            color: note.pinned ? "#E8C988" : "rgba(201,169,110,0.5)",
            opacity: note.pinned ? 1 : 0.85,
          }}
        >
          <PinIcon />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex text-white uppercase tracking-[0.18em] rounded-full px-2 py-0.5"
          style={{
            backgroundColor: cat.bg,
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 500,
          }}
        >
          {cat.label}
        </span>
        <span
          className="text-white/45"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
          }}
        >
          {formatNoteDate(note.updatedAt)}
        </span>
      </div>
      {note.content ? (
        <p
          className="text-white/45 mt-1.5 truncate"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
          }}
        >
          {firstLine(note.content)}
        </p>
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
      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
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

function Editor({
  note,
  savedFlash,
  deleteConfirm,
  onTitleChange,
  onCategoryChange,
  onContentChange,
  onDuplicate,
  onDeleteClick,
  onCancelDelete,
}: {
  note: Note;
  savedFlash: boolean;
  deleteConfirm: boolean;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: Category) => void;
  onContentChange: (v: string) => void;
  onDuplicate: () => void;
  onDeleteClick: () => void;
  onCancelDelete: () => void;
}) {
  const cat = CATEGORY_INFO[note.category];
  const words = wordCount(note.content);

  return (
    <>
      <input
        type="text"
        value={note.title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Note title"
        className="bg-transparent border-none outline-none text-white w-full placeholder:text-cream/30"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "20px",
          fontWeight: 500,
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <select
          value={note.category}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          className="text-cream uppercase tracking-[0.18em] rounded-full px-3.5 py-1.5 border-none outline-none cursor-pointer appearance-none"
          style={{
            backgroundColor: cat.bg,
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {CATEGORY_ORDER.map((c) => (
            <option
              key={c}
              value={c}
              style={{ backgroundColor: "#0D1220", color: "#F4F1ED" }}
            >
              {CATEGORY_INFO[c].label}
            </option>
          ))}
        </select>
        <span
          className="text-white/45"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
          }}
        >
          Last edited {formatNoteDate(note.updatedAt)}
        </span>
      </div>

      <textarea
        value={note.content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing..."
        className="mt-4 bg-transparent border-none outline-none text-white w-full flex-1 resize-none placeholder:text-cream/30"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "16px",
          lineHeight: 1.7,
          minHeight: "300px",
        }}
      />

      <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className="text-white/45"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
            }}
          >
            {words} {words === 1 ? "word" : "words"}
          </span>
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
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="text-gold text-xs uppercase tracking-[0.2em] border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            Duplicate
          </button>
          {deleteConfirm ? (
            <>
              <button
                type="button"
                onClick={onDeleteClick}
                className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-4 py-1.5 hover:bg-magenta-bright transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="text-cream/50 text-xs uppercase tracking-[0.2em] px-2 py-1.5 hover:text-cream transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onDeleteClick}
              className="text-magenta text-xs uppercase tracking-[0.2em] border border-magenta/40 rounded-full px-4 py-1.5 hover:bg-magenta/10 transition-colors"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function NewNoteModal({
  onCreate,
  onCancel,
}: {
  onCreate: (title: string, category: Category) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("build");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onCreate(title, category);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-2xl p-7 w-full max-w-md flex flex-col gap-4"
      >
        <p className={EYEBROW}>New Note</p>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-gold uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="Optional, defaults to Untitled note"
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
          />
        </label>

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
              <option key={c} value={c}>
                {CATEGORY_INFO[c].label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
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
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
