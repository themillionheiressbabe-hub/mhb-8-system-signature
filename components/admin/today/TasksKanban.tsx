"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "todo" | "in_progress" | "done";
type Task = { id: string; text: string; stage: Stage };

const STORAGE_KEY = "babe-hq:today:tasks";

const COLUMNS: { stage: Stage; label: string }[] = [
  { stage: "todo", label: "To Do" },
  { stage: "in_progress", label: "In Progress" },
  { stage: "done", label: "Done" },
];

const NEXT_STAGE: Record<Stage, { stage: Stage; label: string }> = {
  todo: { stage: "in_progress", label: "Start" },
  in_progress: { stage: "done", label: "Done" },
  done: { stage: "todo", label: "Reopen" },
};

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function TasksKanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks, hydrated]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function addTask() {
    const text = draft.trim();
    if (!text) {
      setAdding(false);
      setDraft("");
      return;
    }
    setTasks((prev) => [...prev, { id: newId(), text, stage: "todo" }]);
    setDraft("");
    setAdding(false);
  }

  function moveTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, stage: NEXT_STAGE[t.stage].stage } : t,
      ),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.stage === col.stage);
        return (
          <div
            key={col.stage}
            className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5"
          >
            <p className="text-gold text-xs uppercase tracking-[0.25em] mb-4">
              {col.label}
              <span className="text-cream/40 ml-2 normal-case tracking-normal">
                {items.length}
              </span>
            </p>

            <div className="flex flex-col gap-2.5 min-h-[20px]">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#0D1220] border border-[rgba(201,169,110,0.12)] rounded-xl p-3.5 flex flex-col gap-2.5"
                >
                  <p
                    className="text-cream text-[15px] leading-snug break-words"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t.text}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => moveTask(t.id)}
                      className="text-magenta text-[11px] uppercase tracking-[0.18em] border border-magenta/40 rounded-full px-3 py-1 hover:bg-magenta/10 transition-colors"
                    >
                      {NEXT_STAGE[t.stage].label}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTask(t.id)}
                      aria-label="Remove task"
                      className="text-cream/35 hover:text-rose text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 ? (
                <p className="text-cream/30 text-xs italic">Nothing here.</p>
              ) : null}
            </div>

            {col.stage === "todo" ? (
              <div className="mt-4">
                {adding ? (
                  <div className="flex flex-col gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask();
                        if (e.key === "Escape") {
                          setAdding(false);
                          setDraft("");
                        }
                      }}
                      onBlur={addTask}
                      placeholder="Task text, press Enter"
                      className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream text-sm outline-none focus:border-gold/60"
                      style={{ fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="text-magenta text-xs uppercase tracking-[0.2em] border border-magenta/40 rounded-full px-4 py-2 hover:bg-magenta/10 transition-colors"
                  >
                    + Add task
                  </button>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
