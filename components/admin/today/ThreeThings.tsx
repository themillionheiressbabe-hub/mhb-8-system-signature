"use client";

import { useEffect, useState } from "react";

type Props = { storageKey: string };

const PLACEHOLDERS = ["First thing", "Second thing", "Third thing"];

export function ThreeThings({ storageKey }: Props) {
  const [values, setValues] = useState<[string, string, string]>(["", "", ""]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setValues([parsed[0] ?? "", parsed[1] ?? "", parsed[2] ?? ""]);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, [storageKey]);

  function update(i: number, v: string) {
    setValues((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = v;
      return next;
    });
  }

  function persist() {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      // ignore quota errors
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLACEHOLDERS.map((placeholder, i) => (
        <div
          key={i}
          className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5"
        >
          <input
            type="text"
            value={values[i]}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            onBlur={persist}
            className="w-full bg-transparent border-none outline-none text-cream text-base placeholder:text-cream/35"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
      ))}
    </div>
  );
}
