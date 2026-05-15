"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Stage = "todo" | "in_progress" | "done";
type Category = "build" | "content" | "admin" | "personal" | "gym";
type Priority = "high" | "normal" | "low";

type Task = {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  stage: Stage;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  doneAt?: string;
  archived?: boolean;
};

type CategoryFilter = "all" | Category | "archived";
type PriorityFilter = "all" | Priority;

const STORAGE_KEY = "admin_tasks_permanent";

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const CATEGORY_INFO: Record<Category, { label: string; bg: string }> = {
  build: { label: "Build", bg: "#B51E5A" },
  content: { label: "Content", bg: "#C9A96E" },
  admin: { label: "Admin", bg: "#A78BFA" },
  personal: { label: "Personal", bg: "#2D9B6E" },
  gym: { label: "Gym", bg: "#3D7A6F" },
};

const CATEGORY_ORDER: Category[] = [
  "build",
  "content",
  "admin",
  "personal",
  "gym",
];

const PRIORITY_ORDER: Priority[] = ["high", "normal", "low"];

const PRIORITY_INFO: Record<Priority, { label: string; border: string }> = {
  high: { label: "High", border: "#B51E5A" },
  normal: { label: "Normal", border: "#C9A96E" },
  low: { label: "Low", border: "rgba(201,169,110,0.25)" },
};

const STARTER_SEED: Array<{
  title: string;
  category: Category;
  priority: Priority;
}> = [
  { title: "Complete mockup translation in Claude Code", category: "build", priority: "high" },
  { title: "Set up Stripe live mode", category: "build", priority: "high" },
  { title: "Wire Supabase RLS on all tables", category: "build", priority: "high" },
  { title: "Record this week's TikTok sets", category: "content", priority: "normal" },
  { title: "Check Creator Insights content gaps daily", category: "content", priority: "normal" },
  { title: "Set up Railway worker for Content Studio", category: "admin", priority: "normal" },
  { title: "Write Terms of Service", category: "admin", priority: "low" },
  { title: "Write Privacy Policy", category: "admin", priority: "low" },
];

function newId(): string {
  return `task_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDueDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
}

function dueDateColor(due: string, todayKey: string): string {
  if (!todayKey) return "rgba(255,255,255,0.45)";
  if (due < todayKey) return "#B51E5A";
  if (due === todayKey) return "#C9A96E";
  return "rgba(255,255,255,0.45)";
}

export function TasksBoard() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAllDone, setShowAllDone] = useState(false);
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    setTodayKey(toDateKey(new Date()));

    let loaded: Task[] = [];
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as Task[];
    } catch {
      // ignore
    }

    if (raw === null) {
      const nowIso = new Date().toISOString();
      loaded = STARTER_SEED.map((t) => ({
        id: newId(),
        title: t.title,
        category: t.category,
        priority: t.priority,
        stage: "todo" as Stage,
        createdAt: nowIso,
      }));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      } catch {
        // ignore
      }
    }

    setTasks(loaded);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-task-menu="true"]')) return;
      setOpenMenuId(null);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openMenuId]);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  function handleSave(
    form: {
      title: string;
      category: Category;
      priority: Priority;
      dueDate?: string;
      notes?: string;
    },
    existingId?: string,
  ) {
    if (existingId) {
      persist(
        tasks.map((t) => (t.id === existingId ? { ...t, ...form } : t)),
      );
    } else {
      const next: Task = {
        ...form,
        id: newId(),
        stage: "todo",
        createdAt: new Date().toISOString(),
      };
      persist([...tasks, next]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    persist(tasks.filter((t) => t.id !== id));
    setOpenMenuId(null);
  }

  function moveTask(id: string, stage: Stage) {
    persist(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const next: Task = { ...t, stage };
        if (stage === "done") {
          next.doneAt = new Date().toISOString();
        } else {
          delete next.doneAt;
          if (t.archived) delete next.archived;
        }
        return next;
      }),
    );
  }

  function archiveTask(id: string) {
    persist(
      tasks.map((t) => (t.id === id ? { ...t, archived: true } : t)),
    );
  }

  const filtered = useMemo(() => {
    if (categoryFilter === "archived") {
      return tasks.filter((t) => {
        if (!t.archived) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter)
          return false;
        return true;
      });
    }
    return tasks.filter((t) => {
      if (t.archived) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter)
        return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [tasks, categoryFilter, priorityFilter]);

  const todoTasks = filtered.filter((t) => t.stage === "todo");
  const inProgressTasks = filtered.filter((t) => t.stage === "in_progress");
  const doneTasksSorted = filtered
    .filter((t) => t.stage === "done")
    .sort((a, b) => {
      if (a.doneAt && b.doneAt) return b.doneAt.localeCompare(a.doneAt);
      if (a.doneAt) return -1;
      if (b.doneAt) return 1;
      return 0;
    });
  const doneTotal = doneTasksSorted.length;
  const doneVisible = showAllDone ? doneTasksSorted : doneTasksSorted.slice(0, 20);

  if (!mounted) {
    return <div className="min-h-[500px]" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className={EYEBROW}>Tasks</p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          + New Task
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
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
        <FilterPill
          label="Archived"
          active={categoryFilter === "archived"}
          onClick={() => setCategoryFilter("archived")}
        />
      </div>

      {/* Priority filters */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="All Priorities"
          active={priorityFilter === "all"}
          onClick={() => setPriorityFilter("all")}
        />
        {PRIORITY_ORDER.map((p) => (
          <FilterPill
            key={p}
            label={PRIORITY_INFO[p].label}
            active={priorityFilter === p}
            onClick={() => setPriorityFilter(p)}
          />
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Column label="To Do" count={todoTasks.length}>
          {todoTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              todayKey={todayKey}
              openMenu={openMenuId === t.id}
              onMenuToggle={() =>
                setOpenMenuId(openMenuId === t.id ? null : t.id)
              }
              onEdit={() => {
                setEditing(t);
                setModalOpen(true);
                setOpenMenuId(null);
              }}
              onDelete={() => handleDelete(t.id)}
              onMove={(stage) => moveTask(t.id, stage)}
              onArchive={() => archiveTask(t.id)}
            />
          ))}
          {todoTasks.length === 0 ? <EmptyColumnNote /> : null}
        </Column>

        <Column label="In Progress" count={inProgressTasks.length}>
          {inProgressTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              todayKey={todayKey}
              openMenu={openMenuId === t.id}
              onMenuToggle={() =>
                setOpenMenuId(openMenuId === t.id ? null : t.id)
              }
              onEdit={() => {
                setEditing(t);
                setModalOpen(true);
                setOpenMenuId(null);
              }}
              onDelete={() => handleDelete(t.id)}
              onMove={(stage) => moveTask(t.id, stage)}
              onArchive={() => archiveTask(t.id)}
            />
          ))}
          {inProgressTasks.length === 0 ? <EmptyColumnNote /> : null}
        </Column>

        <Column label="Done" count={doneTotal}>
          {doneVisible.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              todayKey={todayKey}
              openMenu={openMenuId === t.id}
              onMenuToggle={() =>
                setOpenMenuId(openMenuId === t.id ? null : t.id)
              }
              onEdit={() => {
                setEditing(t);
                setModalOpen(true);
                setOpenMenuId(null);
              }}
              onDelete={() => handleDelete(t.id)}
              onMove={(stage) => moveTask(t.id, stage)}
              onArchive={() => archiveTask(t.id)}
            />
          ))}
          {doneVisible.length === 0 ? <EmptyColumnNote /> : null}
          {!showAllDone && doneTotal > 20 ? (
            <button
              type="button"
              onClick={() => setShowAllDone(true)}
              className="text-gold text-sm hover:text-gold-bright transition-colors self-start mt-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              View all completed ({doneTotal})
            </button>
          ) : null}
          {showAllDone && doneTotal > 20 ? (
            <button
              type="button"
              onClick={() => setShowAllDone(false)}
              className="text-gold/60 text-sm hover:text-gold transition-colors self-start mt-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Show fewer
            </button>
          ) : null}
        </Column>
      </div>

      {modalOpen ? (
        <TaskModal
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
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

function Column({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 flex flex-col gap-3 min-h-[300px]">
      <div className="flex items-center justify-between">
        <p className={EYEBROW}>{label}</p>
        <span
          className="bg-magenta text-cream text-[10px] uppercase tracking-[0.15em] rounded-full px-2.5 py-0.5"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function EmptyColumnNote() {
  return (
    <p
      className="text-cream/30 text-sm italic"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Nothing here yet.
    </p>
  );
}

function TaskCard({
  task,
  todayKey,
  openMenu,
  onMenuToggle,
  onEdit,
  onDelete,
  onMove,
  onArchive,
}: {
  task: Task;
  todayKey: string;
  openMenu: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (stage: Stage) => void;
  onArchive: () => void;
}) {
  const cat = CATEGORY_INFO[task.category];
  const showArchive =
    task.stage === "done" &&
    !!task.doneAt &&
    daysSinceIso(task.doneAt) > 30 &&
    !task.archived;

  return (
    <div
      className="bg-[#1A2140] border border-[rgba(201,169,110,0.15)] rounded-xl p-4 relative flex flex-col gap-2.5"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: PRIORITY_INFO[task.priority].border,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-white flex-1 leading-snug"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          {task.title}
        </p>
        <div className="relative shrink-0" data-task-menu="true">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Task menu"
            className="text-cream/45 hover:text-cream text-base leading-none px-1.5 py-0.5 rounded transition-colors"
          >
            &#x22EF;
          </button>
          {openMenu ? (
            <div
              data-task-menu="true"
              className="absolute right-0 top-7 bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg p-1.5 z-20 min-w-[120px] shadow-lg"
            >
              <button
                type="button"
                onClick={onEdit}
                className="block w-full text-left text-cream text-sm hover:bg-gold/10 px-3 py-1.5 rounded transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="block w-full text-left text-rose text-sm hover:bg-rose/10 px-3 py-1.5 rounded transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex text-white text-[10px] uppercase tracking-[0.18em] rounded-full px-2.5 py-1"
          style={{
            backgroundColor: cat.bg,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          {cat.label}
        </span>
        {task.dueDate ? (
          <span
            className="text-[12px]"
            style={{
              color: dueDateColor(task.dueDate, todayKey),
              fontFamily: "var(--font-sans)",
            }}
          >
            Due {formatDueDate(task.dueDate)}
          </span>
        ) : null}
        {task.archived ? (
          <span
            className="text-cream/40 text-[11px] uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Archived
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        {task.stage === "todo" ? (
          <MoveButton label="Start" onClick={() => onMove("in_progress")} />
        ) : null}
        {task.stage === "in_progress" ? (
          <>
            <MoveButton label="Done" onClick={() => onMove("done")} />
            <MoveButton label="Back" onClick={() => onMove("todo")} muted />
          </>
        ) : null}
        {task.stage === "done" ? (
          <MoveButton label="Reopen" onClick={() => onMove("todo")} />
        ) : null}
        {showArchive ? (
          <button
            type="button"
            onClick={onArchive}
            className="text-cream/45 hover:text-cream text-[11px] uppercase tracking-[0.18em] border border-[rgba(201,169,110,0.2)] rounded-full px-3 py-1 hover:border-gold/40 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Archive
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MoveButton({
  label,
  onClick,
  muted = false,
}: {
  label: string;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] uppercase tracking-[0.18em] rounded-full px-3 py-1 transition-colors ${
        muted
          ? "text-cream/50 border border-[rgba(255,255,255,0.18)] hover:text-cream hover:border-cream/40"
          : "text-magenta border border-magenta/40 hover:bg-magenta/10"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {label}
    </button>
  );
}

function TaskModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: Task | null;
  onSave: (
    form: {
      title: string;
      category: Category;
      priority: Priority;
      dueDate?: string;
      notes?: string;
    },
    existingId?: string,
  ) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "build");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "normal");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        category,
        priority,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      },
      initial?.id,
    );
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
        <p className={EYEBROW}>{initial ? "Edit Task" : "New Task"}</p>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-gold text-[11px] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span
              className="text-gold text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
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

          <label className="flex flex-col gap-1.5">
            <span
              className="text-gold text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              Priority
            </span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_INFO[p].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-gold text-[11px] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            Due date
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-gold text-[11px] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
            style={{ fontFamily: "var(--font-sans)", fontSize: "16px" }}
          />
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
            Save Task
          </button>
        </div>
      </form>
    </div>
  );
}
