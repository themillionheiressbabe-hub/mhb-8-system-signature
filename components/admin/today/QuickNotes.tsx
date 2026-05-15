"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "babe-hq:today:notes";

export function QuickNotes() {
  const [value, setValue] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setValue(raw);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore
      }
      setSavedFlash(true);
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
      flashTimerRef.current = window.setTimeout(() => {
        setSavedFlash(false);
      }, 2000);
    }, 500);

    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [value, hydrated]);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Notes"
        className="w-full bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 text-cream text-base leading-relaxed outline-none focus:border-gold/40 resize-y"
        style={{
          fontFamily: "var(--font-sans)",
          minHeight: "200px",
        }}
      />
      <span
        className={`absolute bottom-3 right-4 text-gold text-xs uppercase tracking-[0.2em] transition-opacity duration-500 ${
          savedFlash ? "opacity-60" : "opacity-0"
        }`}
        aria-live="polite"
      >
        Saved
      </span>
    </div>
  );
}
