"use client";

import { useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ProseBlock from "@/components/ProseBlock";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

type YearResult = {
  personalYear: number;
  yearLabel: string;
  yearRead: string;
  cyclePosition: number | null;
  isMaster: boolean;
  currentYear: number;
  nextShiftDate: string;
};

type Status = "idle" | "loading" | "result" | "error";

export default function YourBabeYearPage() {
  const [dob, setDob] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<YearResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dob) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/babe-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dob }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setResult(data as YearResult);
      setStatus("result");
    } catch {
      setStatus("error");
    }
  }

  function retry() {
    setStatus("idle");
    setResult(null);
  }

  return (
    <div className={`${outfit.className} flex-1`}>
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-gold text-sm hover:underline inline-block mb-6"
          >
            &larr; Back
          </Link>

          <h1
            className={`${cormorant.className} text-white text-4xl font-semibold text-center`}
          >
            Your BABE Year
          </h1>
          <p className="text-gold text-center mt-2 mb-8">
            Find out what this year is asking of you.
          </p>

          {status === "idle" ? (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto flex flex-col gap-4"
            >
              <label className="text-gold text-sm flex flex-col">
                <span>Your date of birth</span>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  className="w-full bg-transparent border border-gold text-gold rounded-lg p-3 mt-2"
                />
              </label>
              <button
                type="submit"
                className="w-full bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold mt-2"
              >
                Find My Year
              </button>
            </form>
          ) : null}

          {status === "loading" ? (
            <p
              className={`${cormorant.className} italic text-gold text-2xl text-center mt-8`}
            >
              Reading your year...
            </p>
          ) : null}

          {status === "error" ? (
            <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
              <p className="text-gold">
                Something went wrong. Please try again.
              </p>
              <button
                type="button"
                onClick={retry}
                className="border border-gold text-gold rounded-full px-6 py-3 text-base font-semibold"
              >
                Try again
              </button>
            </div>
          ) : null}

          {status === "result" && result ? (
            <YearResultView result={result} />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function YearResultView({ result }: { result: YearResult }) {
  const cycleLabel = result.isMaster
    ? "Master Year"
    : `Year ${result.cyclePosition} of 9`;

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-gold uppercase text-xs tracking-widest text-center">
        Personal Year
      </p>
      <p
        className={`${cormorant.className} text-white text-7xl font-semibold text-center mt-2 leading-none`}
      >
        {result.personalYear}
      </p>
      <p
        className={`${cormorant.className} italic text-gold text-xl text-center mt-3`}
      >
        {result.yearLabel}
      </p>

      <hr className="border-0 border-t border-gold/40 my-10" />

      <ProseBlock text={result.yearRead} className="mb-10" />

      <hr className="border-0 border-t border-gold/40 my-10" />

      <div className="bg-navy border border-gold rounded-2xl p-6 max-w-sm mx-auto">
        <p className="text-gold uppercase text-xs tracking-widest text-center mb-4">
          Your Year At A Glance
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-gold/60 text-xs uppercase tracking-wide">
              Personal Year
            </span>
            <span className="text-magenta text-sm font-semibold">
              {result.personalYear}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-gold/60 text-xs uppercase tracking-wide">
              Cycle
            </span>
            <span className="text-white text-sm">{cycleLabel}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-gold/60 text-xs uppercase tracking-wide">
              Energy shifts
            </span>
            <span className="text-gold text-sm">{result.nextShiftDate}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 flex flex-col items-center gap-3">
        <Link
          href="/shop"
          className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block"
        >
          Get Your Full Year Map
        </Link>
        <p
          className={`${cormorant.className} italic text-gold text-sm max-w-sm`}
        >
          This is a numerology preview. Your full year map runs across 4 timing lenses.
        </p>
      </div>
    </div>
  );
}
