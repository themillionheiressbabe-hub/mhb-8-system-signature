"use client";

import { useEffect, useState } from "react";

type CalendarEvent = {
  id: string;
  type: string;
  date: string;
};

type Props = {
  todayIso: string;
  weekdayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
};

const RECURRING_CONTENT_IDS_BY_DOW: Record<number, string[]> = {
  2: ["threads", "facebook", "tiktok-tue"],
  3: ["instagram-wed", "tiktok-wed"],
  4: ["tiktok-thu", "lemon8", "pinterest", "instagram-thu"],
  5: ["wildcard"],
};

export function ContentPostsSummary({ todayIso, weekdayIndex }: Props) {
  const [counts, setCounts] = useState<{ total: number; done: number } | null>(
    null,
  );

  useEffect(() => {
    const recurringSuffixes = RECURRING_CONTENT_IDS_BY_DOW[weekdayIndex] ?? [];
    const recurringIds = recurringSuffixes.map(
      (s) => `recurring:content:${s}:${todayIso}`,
    );

    let userIds: string[] = [];
    try {
      const raw = window.localStorage.getItem("admin_calendar_events");
      if (raw) {
        const events = JSON.parse(raw) as CalendarEvent[];
        userIds = events
          .filter((e) => e.type === "content" && e.date === todayIso)
          .map((e) => e.id);
      }
    } catch {
      // ignore
    }

    const allIds = [...recurringIds, ...userIds];
    const total = allIds.length;

    let completions: Record<string, true> = {};
    try {
      const rawC = window.localStorage.getItem("admin_calendar_completions");
      if (rawC) completions = JSON.parse(rawC) as Record<string, true>;
    } catch {
      // ignore
    }

    const done = allIds.filter((id) => completions[`${id}__${todayIso}`]).length;
    setCounts({ total, done });
  }, [todayIso, weekdayIndex]);

  if (!counts || counts.total === 0) return null;

  const label =
    counts.total === 1
      ? `${counts.done} of 1 content post done today.`
      : `${counts.done} of ${counts.total} content posts done today.`;

  return (
    <p
      className="text-gold/70 text-[14px] mt-3"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {label}
    </p>
  );
}
