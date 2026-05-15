"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type EventType = "content" | "gym" | "deadline" | "personal";
type CalendarView = "month" | "week";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: EventType;
  notes?: string;
  pillar?: string | null; // P1..P5 for content events
};

const STORAGE_KEY = "admin_calendar_events";
const STORAGE_KEY_COMPLETIONS = "admin_calendar_completions";

function completionKey(ev: { id: string; date: string }): string {
  return `${ev.id}__${ev.date}`;
}

const PILLARS: { code: string; name: string }[] = [
  { code: "P1", name: "Patterns and Self-Awareness" },
  { code: "P2", name: "Shadow and Inner Work" },
  { code: "P3", name: "Sovereignty and Reclamation" },
  { code: "P4", name: "Behind the BABE Signature" },
  { code: "P5", name: "Working My Own Patterns" },
];

const PILLAR_NAME: Record<string, string> = Object.fromEntries(
  PILLARS.map((p) => [p.code, p.name]),
);

const WEEK_HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am..10pm

function formatHourLabel(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

function eventHour(time: string): number {
  const [h] = time.split(":").map(Number);
  return h;
}

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const TYPE_COLOR: Record<EventType, { bg: string; dot: string; label: string }> = {
  content: { bg: "#B51E5A", dot: "#B51E5A", label: "Content" },
  gym: { bg: "#2D9B6E", dot: "#2D9B6E", label: "Gym" },
  deadline: { bg: "#C9A96E", dot: "#C9A96E", label: "Deadline" },
  personal: { bg: "#A78BFA", dot: "#A78BFA", label: "Personal" },
};

const WEEKDAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function mondayOfWeek(d: Date): Date {
  const out = new Date(d);
  const dow = out.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  out.setDate(out.getDate() + offset);
  out.setHours(0, 0, 0, 0);
  return out;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function isRecurring(id: string): boolean {
  return id.startsWith("recurring:");
}

function getRecurringForDate(date: Date): CalendarEvent[] {
  const dow = date.getDay();
  const key = toDateKey(date);
  const out: CalendarEvent[] = [];

  // Gym: Mon, Tue, Thu, Fri
  if (dow === 1 || dow === 2 || dow === 4 || dow === 5) {
    out.push({
      id: `recurring:gym:${key}`,
      title: "Training",
      date: key,
      type: "gym",
    });
  }

  // Content schedule
  if (dow === 2) {
    out.push({ id: `recurring:content:threads:${key}`, title: "Threads", date: key, time: "09:00", type: "content" });
    out.push({ id: `recurring:content:facebook:${key}`, title: "Facebook", date: key, time: "12:00", type: "content" });
    out.push({ id: `recurring:content:tiktok-tue:${key}`, title: "TikTok", date: key, time: "19:00", type: "content" });
  } else if (dow === 3) {
    out.push({ id: `recurring:content:instagram-wed:${key}`, title: "Instagram", date: key, time: "17:00", type: "content" });
    out.push({ id: `recurring:content:tiktok-wed:${key}`, title: "TikTok", date: key, time: "19:00", type: "content" });
  } else if (dow === 4) {
    out.push({ id: `recurring:content:tiktok-thu:${key}`, title: "TikTok", date: key, time: "18:00", type: "content" });
    out.push({ id: `recurring:content:lemon8:${key}`, title: "Lemon8", date: key, time: "18:00", type: "content" });
    out.push({ id: `recurring:content:pinterest:${key}`, title: "Pinterest", date: key, time: "20:00", type: "content" });
    out.push({ id: `recurring:content:instagram-thu:${key}`, title: "Instagram", date: key, time: "21:00", type: "content" });
  } else if (dow === 5) {
    out.push({ id: `recurring:content:wildcard:${key}`, title: "Wildcard", date: key, time: "19:00", type: "content" });
  }

  // Launch day
  if (key === "2026-09-24") {
    out.push({
      id: "recurring:launch-2026-09-24",
      title: "LAUNCH DAY",
      date: "2026-09-24",
      type: "deadline",
    });
  }

  return out;
}

type FilterState = Record<EventType, boolean>;

const DEFAULT_FILTERS: FilterState = {
  content: true,
  gym: true,
  deadline: true,
  personal: true,
};

export function CalendarBoard() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date>(() => new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [stored, setStored] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [focusDateKey, setFocusDateKey] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date());
  const [completions, setCompletions] = useState<Record<string, true>>({});

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setWeekAnchor(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw) as CalendarEvent[]);
    } catch {
      // ignore parse errors
    }
    try {
      const rawC = window.localStorage.getItem(STORAGE_KEY_COMPLETIONS);
      if (rawC) setCompletions(JSON.parse(rawC) as Record<string, true>);
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: CalendarEvent[]) => {
    setStored(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }, []);

  const todayKey = useMemo(() => toDateKey(today), [today]);

  const weekStripDays = useMemo(() => {
    const monday = mondayOfWeek(today);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [today]);

  const monthGridDays = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const gridStart = mondayOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [viewYear, viewMonth]);

  const weekViewDays = useMemo(() => {
    const monday = mondayOfWeek(weekAnchor);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [weekAnchor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const collect = (days: Date[]) => {
      for (const d of days) {
        const key = toDateKey(d);
        if (!map.has(key)) {
          const recurring = getRecurringForDate(d);
          if (recurring.length) map.set(key, [...recurring]);
        }
      }
    };
    collect(monthGridDays);
    collect(weekStripDays);
    collect(weekViewDays);
    // User events
    for (const ev of stored) {
      const arr = map.get(ev.date) ?? [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [monthGridDays, weekStripDays, weekViewDays, stored]);

  const filteredEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const [key, list] of eventsByDate) {
      const kept = list.filter((e) => filters[e.type]);
      if (kept.length) map.set(key, kept);
    }
    return map;
  }, [eventsByDate, filters]);

  function gotoPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setFocusDateKey(null);
  }

  function gotoNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setFocusDateKey(null);
  }

  function jumpToDay(d: Date) {
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setFocusDateKey(toDateKey(d));
  }

  function openWeekForDay(d: Date) {
    setWeekAnchor(d);
    setView("week");
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function handleAdd(ev: Omit<CalendarEvent, "id">) {
    const next: CalendarEvent = { ...ev, id: newId() };
    persist([...stored, next]);
    setAddOpen(false);
  }

  function handleUpdate(id: string, ev: Omit<CalendarEvent, "id">) {
    if (isRecurring(id)) return;
    persist(
      stored.map((e) => (e.id === id ? { ...e, ...ev, id } : e)),
    );
    setEditingId(null);
    setDetail(null);
  }

  function handleDelete(id: string) {
    if (isRecurring(id)) return;
    persist(stored.filter((e) => e.id !== id));
    setDetail(null);
  }

  function toggleComplete(ev: CalendarEvent) {
    const key = completionKey(ev);
    setCompletions((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      try {
        window.localStorage.setItem(
          STORAGE_KEY_COMPLETIONS,
          JSON.stringify(next),
        );
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }

  function isComplete(ev: CalendarEvent): boolean {
    return !!completions[completionKey(ev)];
  }

  if (!mounted) {
    return <div className="min-h-[600px]" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className={EYEBROW}>Calendar</p>
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={gotoPrevMonth}
            aria-label="Previous month"
            className="text-gold border border-gold/40 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gold/10 transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <h1 className="serif-it text-gold text-[2rem] leading-none">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h1>
          <button
            type="button"
            onClick={gotoNextMonth}
            aria-label="Next month"
            className="text-gold border border-gold/40 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gold/10 transition-colors"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
          <div className="ml-2 flex items-center gap-2">
            <ViewTogglePill
              label="Month"
              active={view === "month"}
              onClick={() => setView("month")}
            />
            <ViewTogglePill
              label="Week"
              active={view === "week"}
              onClick={() => setView("week")}
            />
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-2.5">
        {weekStripDays.map((d) => {
          const key = toDateKey(d);
          const list = filteredEventsByDate.get(key) ?? [];
          const types = new Set(list.map((e) => e.type));
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => jumpToDay(d)}
              className={`bg-[#151B33] rounded-2xl px-3 py-3 text-left transition-colors hover:border-gold/40 ${
                isToday
                  ? "border-2 border-magenta"
                  : "border border-[rgba(201,169,110,0.15)]"
              }`}
            >
              <p
                className="font-sans uppercase text-[10px] tracking-[0.2em] text-gold"
                style={{ fontWeight: 600 }}
              >
                {WEEKDAY_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]}
              </p>
              <p className="serif-it text-cream text-2xl leading-tight mt-1">
                {d.getDate()}
              </p>
              <div className="flex gap-1 mt-2 min-h-[6px]">
                {(["content", "gym", "deadline", "personal"] as EventType[]).map((t) =>
                  types.has(t) ? (
                    <span
                      key={t}
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: TYPE_COLOR[t].dot }}
                      aria-hidden="true"
                    />
                  ) : null,
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main grid + filter sidebar */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Filter sidebar */}
        <aside className="md:w-[160px] md:flex-shrink-0">
          <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5">
            <p className={EYEBROW}>Show</p>
            <div className="mt-4 flex flex-col gap-3">
              {(["content", "gym", "deadline", "personal"] as EventType[]).map((t) => (
                <FilterToggle
                  key={t}
                  label={TYPE_COLOR[t].label}
                  color={TYPE_COLOR[t].dot}
                  checked={filters[t]}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, [t]: !prev[t] }))
                  }
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main view */}
        <div className="flex-1 min-w-0">
          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAY_SHORT.map((w) => (
                  <p
                    key={w}
                    className="font-sans uppercase text-[10px] tracking-[0.25em] text-gold/70 px-2"
                    style={{ fontWeight: 600 }}
                  >
                    {w}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {monthGridDays.map((d) => {
                  const key = toDateKey(d);
                  const inMonth = d.getMonth() === viewMonth;
                  const isToday = key === todayKey;
                  const isFocused = focusDateKey === key;
                  const list = filteredEventsByDate.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={() => openWeekForDay(d)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openWeekForDay(d);
                        }
                      }}
                      className={`min-h-[110px] rounded-lg p-2 flex flex-col gap-1 border cursor-pointer hover:border-gold/40 transition-colors ${
                        isFocused
                          ? "border-gold/60"
                          : "border-[rgba(201,169,110,0.15)]"
                      }`}
                      style={{
                        backgroundColor: isToday
                          ? "rgba(181,30,90,0.08)"
                          : "#151B33",
                        opacity: inMonth ? 1 : 0.35,
                      }}
                    >
                      <p
                        className="font-sans text-[13px] text-cream/80"
                        style={{ fontWeight: 500 }}
                      >
                        {d.getDate()}
                      </p>
                      <div className="flex flex-col gap-1">
                        {list.slice(0, 4).map((ev) => {
                          const completed = isComplete(ev);
                          return (
                            <div
                              key={ev.id}
                              className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-[filter,opacity] hover:brightness-110"
                              style={{
                                backgroundColor: TYPE_COLOR[ev.type].bg,
                                borderRadius: "4px",
                                opacity: completed ? 0.5 : 1,
                              }}
                              title={
                                ev.time ? `${ev.time} ${ev.title}` : ev.title
                              }
                            >
                              <CompleteCheckbox
                                size={11}
                                checked={completed}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleComplete(ev);
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetail(ev);
                                }}
                                className="flex-1 text-left text-white truncate"
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  textDecoration: completed
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {ev.type === "deadline" ? "★ " : ""}
                                {ev.pillar ? (
                                  <span style={{ fontWeight: 300 }}>
                                    {ev.pillar} ·{" "}
                                  </span>
                                ) : null}
                                {ev.time ? `${ev.time} ` : ""}
                                {ev.title}
                              </button>
                            </div>
                          );
                        })}
                        {list.length > 4 ? (
                          <span className="text-cream/40 text-[10px]">
                            +{list.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <WeekTimeGrid
              days={weekViewDays}
              eventsByDate={filteredEventsByDate}
              todayKey={todayKey}
              onEventClick={(ev) => setDetail(ev)}
              isComplete={isComplete}
              onToggleComplete={toggleComplete}
            />
          )}
        </div>
      </div>

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-7 right-7 z-40 bg-magenta text-cream rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] shadow-[0_0_28px_rgba(181,30,90,0.45)] hover:bg-magenta-bright transition-colors"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
      >
        + Add Event
      </button>

      {addOpen ? (
        <AddEventModal
          defaultDate={focusDateKey ?? todayKey}
          onSave={handleAdd}
          onCancel={() => setAddOpen(false)}
        />
      ) : null}

      {(() => {
        const editing = editingId
          ? stored.find((e) => e.id === editingId) ?? null
          : null;
        if (!editing) return null;
        return (
          <AddEventModal
            defaultDate={editing.date}
            initial={editing}
            onSave={(ev) => handleUpdate(editing.id, ev)}
            onCancel={() => setEditingId(null)}
          />
        );
      })()}

      {detail ? (
        <EventDetailDialog
          event={detail}
          completed={isComplete(detail)}
          onClose={() => setDetail(null)}
          onDelete={handleDelete}
          onEdit={() => {
            if (isRecurring(detail.id)) return;
            setEditingId(detail.id);
            setDetail(null);
          }}
          onToggleComplete={() => toggleComplete(detail)}
        />
      ) : null}
    </div>
  );
}

function FilterToggle({
  label,
  color,
  checked,
  onChange,
}: {
  label: string;
  color: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="flex items-center justify-between gap-2 group"
    >
      <span className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: color, opacity: checked ? 1 : 0.3 }}
          aria-hidden="true"
        />
        <span
          className="text-cream text-sm"
          style={{
            fontFamily: "var(--font-sans)",
            opacity: checked ? 1 : 0.4,
          }}
        >
          {label}
        </span>
      </span>
      <span
        className="w-9 h-5 rounded-full relative transition-colors"
        style={{
          backgroundColor: checked ? color : "rgba(201,169,110,0.18)",
        }}
        aria-hidden="true"
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-cream transition-all"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </span>
    </button>
  );
}

function AddEventModal({
  defaultDate,
  initial,
  onSave,
  onCancel,
}: {
  defaultDate: string;
  initial?: CalendarEvent | null;
  onSave: (ev: Omit<CalendarEvent, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [time, setTime] = useState(initial?.time ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "content");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [pillar, setPillar] = useState<string>(initial?.pillar ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({
      title: title.trim(),
      date,
      time: time || undefined,
      type,
      notes: notes.trim() || undefined,
      pillar: type === "content" && pillar ? pillar : null,
    });
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
        <p className={EYEBROW}>{initial ? "Edit Event" : "New Event"}</p>

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
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span
              className="text-gold text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span
              className="text-gold text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              Time
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-gold text-[11px] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
          >
            Type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <option value="content">Content</option>
            <option value="gym">Gym</option>
            <option value="deadline">Deadline</option>
            <option value="personal">Personal</option>
          </select>
        </label>

        {type === "content" ? (
          <label className="flex flex-col gap-1.5">
            <span
              className="text-gold text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              Pillar
            </span>
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <option value="">No pillar</option>
              {PILLARS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
            className="bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60 resize-y"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </label>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-gold text-xs uppercase tracking-[0.2em] border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
          >
            {initial ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EventDetailDialog({
  event,
  completed,
  onClose,
  onDelete,
  onEdit,
  onToggleComplete,
}: {
  event: CalendarEvent;
  completed: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onToggleComplete: () => void;
}) {
  const colour = TYPE_COLOR[event.type];
  const dateLabel = formatDateLong(event.date);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#151B33] border border-[rgba(201,169,110,0.25)] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            className="serif-it text-cream text-xl leading-tight"
            style={{ flex: 1 }}
          >
            {event.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-cream/40 hover:text-cream transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {event.pillar && PILLAR_NAME[event.pillar] ? (
          <p
            className="text-cream/70 text-sm"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {event.pillar} · {PILLAR_NAME[event.pillar]}
          </p>
        ) : null}

        <span
          className="inline-flex self-start text-white text-[10px] uppercase tracking-[0.2em] rounded-full px-2.5 py-1"
          style={{ backgroundColor: colour.bg, fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          {colour.label}
        </span>

        <p
          className="text-cream/80 text-sm"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {dateLabel}
          {event.time ? ` · ${event.time}` : ""}
        </p>

        {event.notes ? (
          <p
            className="text-cream/65 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {event.notes}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-gold/10">
          {completed ? (
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 text-emerald"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: "rgba(45,155,110,0.2)",
                    border: "1px solid #2D9B6E",
                    color: "#2D9B6E",
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
                <span className="text-sm uppercase tracking-[0.2em]">
                  Completed
                </span>
              </span>
              <button
                type="button"
                onClick={onToggleComplete}
                className="text-cream/50 hover:text-cream text-[11px] uppercase tracking-[0.2em] underline-offset-2 hover:underline transition-colors"
              >
                Undo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleComplete}
              className="flex items-center gap-2 text-emerald border border-emerald/40 rounded-full px-4 py-1.5 hover:bg-emerald/10 transition-colors text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  border: "1px solid currentColor",
                }}
              />
              Mark complete
            </button>
          )}

          {!isRecurring(event.id) ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="text-gold text-[11px] uppercase tracking-[0.2em] border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="text-rose text-[11px] uppercase tracking-[0.2em] border border-rose/40 rounded-full px-4 py-1.5 hover:bg-rose/10 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <span className="text-cream/30 text-[11px] italic">
              Recurring, hardcoded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateLong(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  return `${weekday}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

function ViewTogglePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const base =
    "text-xs uppercase tracking-[0.2em] rounded-full px-4 py-2 transition-colors";
  const styles = active
    ? "bg-magenta text-cream hover:bg-magenta-bright"
    : "text-gold border border-gold/40 hover:bg-gold/10";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} ${styles}`}
      style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
    >
      {label}
    </button>
  );
}

function WeekTimeGrid({
  days,
  eventsByDate,
  todayKey,
  onEventClick,
  isComplete,
  onToggleComplete,
}: {
  days: Date[];
  eventsByDate: Map<string, CalendarEvent[]>;
  todayKey: string;
  onEventClick: (ev: CalendarEvent) => void;
  isComplete: (ev: CalendarEvent) => boolean;
  onToggleComplete: (ev: CalendarEvent) => void;
}) {
  const perDay = days.map((d) => {
    const key = toDateKey(d);
    const list = eventsByDate.get(key) ?? [];
    const allDay: CalendarEvent[] = [];
    const timedByHour = new Map<number, CalendarEvent[]>();
    for (const ev of list) {
      if (!ev.time) {
        allDay.push(ev);
        continue;
      }
      let h = eventHour(ev.time);
      if (h < 7) h = 7;
      if (h > 22) h = 22;
      const bucket = timedByHour.get(h) ?? [];
      bucket.push(ev);
      timedByHour.set(h, bucket);
    }
    return { date: d, key, allDay, timedByHour };
  });

  const cols = `56px repeat(7, minmax(110px, 1fr))`;

  return (
    <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-3 overflow-x-auto">
      {/* Header row: blank + day labels */}
      <div className="grid" style={{ gridTemplateColumns: cols }}>
        <div />
        {perDay.map(({ date, key }) => {
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`px-2 py-2 text-center ${
                isToday ? "border-b-2 border-magenta" : "border-b border-gold/15"
              }`}
            >
              <p
                className="font-sans uppercase text-[10px] tracking-[0.2em] text-gold"
                style={{ fontWeight: 600 }}
              >
                {WEEKDAY_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
              </p>
              <p className="serif-it text-cream text-lg leading-none mt-0.5">
                {date.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* All-day strip */}
      <div className="grid" style={{ gridTemplateColumns: cols }}>
        <div className="flex items-center justify-end pr-2 py-2">
          <span
            className="font-sans text-[11px] text-gold/50 uppercase tracking-[0.15em]"
            style={{ fontWeight: 500 }}
          >
            All
          </span>
        </div>
        {perDay.map(({ key, allDay }) => (
          <div
            key={`allday-${key}`}
            className="border-t border-gold/10 p-1 flex flex-col gap-1 min-h-[28px]"
          >
            {allDay.map((ev) => (
              <WeekEventBlock
                key={ev.id}
                event={ev}
                completed={isComplete(ev)}
                onClick={() => onEventClick(ev)}
                onToggleComplete={() => onToggleComplete(ev)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Hour rows */}
      {WEEK_HOURS.map((h) => (
        <div key={`row-${h}`} className="grid" style={{ gridTemplateColumns: cols }}>
          <div className="flex items-start justify-end pr-2 pt-1">
            <span
              className="font-sans text-[11px]"
              style={{ color: "rgba(201,169,110,0.5)", fontWeight: 500 }}
            >
              {formatHourLabel(h)}
            </span>
          </div>
          {perDay.map(({ key, timedByHour }) => {
            const inHour = timedByHour.get(h) ?? [];
            return (
              <div
                key={`${key}-${h}`}
                className="border-t border-gold/10 min-h-[44px] p-1 flex flex-col gap-1"
              >
                {inHour.map((ev) => (
                  <WeekEventBlock
                    key={ev.id}
                    event={ev}
                    completed={isComplete(ev)}
                    onClick={() => onEventClick(ev)}
                    onToggleComplete={() => onToggleComplete(ev)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function WeekEventBlock({
  event,
  completed,
  onClick,
  onToggleComplete,
}: {
  event: CalendarEvent;
  completed: boolean;
  onClick: () => void;
  onToggleComplete: () => void;
}) {
  const colour = TYPE_COLOR[event.type];
  return (
    <div
      className="flex items-start gap-2 rounded px-2 py-1 hover:brightness-110 transition-[filter,opacity]"
      style={{
        backgroundColor: colour.bg,
        borderRadius: "4px",
        opacity: completed ? 0.5 : 1,
      }}
      title={event.time ? `${event.time} ${event.title}` : event.title}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex-1 text-left text-white"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: 500,
          textDecoration: completed ? "line-through" : "none",
        }}
      >
        {event.pillar ? (
          <span style={{ fontWeight: 300 }}>{event.pillar} · </span>
        ) : null}
        {event.time ? <span className="opacity-80">{event.time} </span> : null}
        {event.title}
      </button>
      <CompleteCheckbox
        size={13}
        checked={completed}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
      />
    </div>
  );
}

function CompleteCheckbox({
  checked,
  size,
  onClick,
}: {
  checked: boolean;
  size: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      aria-pressed={checked}
      className="shrink-0 inline-flex items-center justify-center transition-colors"
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.85)",
        backgroundColor: checked ? "rgba(255,255,255,0.2)" : "transparent",
        color: "#ffffff",
        lineHeight: 1,
        fontSize: Math.max(size - 4, 7),
      }}
    >
      {checked ? <span aria-hidden="true">✓</span> : null}
    </button>
  );
}
