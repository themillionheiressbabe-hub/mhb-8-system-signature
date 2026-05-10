"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const inputClass =
  "w-full bg-transparent border border-gold text-gold rounded-lg p-3 mt-2";
const labelClass = "text-gold text-sm flex flex-col";

const SUIT_DISPLAY: Record<string, { symbol: string; className: string }> = {
  hearts: { symbol: "♥", className: "text-rose-400" },
  diamonds: { symbol: "♦", className: "text-yellow-400" },
  clubs: { symbol: "♣", className: "text-emerald-400" },
  spades: { symbol: "♠", className: "text-violet-400" },
  joker: { symbol: "★", className: "text-cream" },
};

const SUIT_LABEL: Record<string, string> = {
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
  spades: "Spades",
  joker: "Joker",
};

type SnapshotResult = {
  snapshot: string;
  cardCode: string;
  cardName: string;
  suit: string;
  lifePath: number;
  expressionNumber: number;
  chosenName: string | null;
  chosenNameExpression: number | null;
  sunSign: string;
  animal: string;
  element: string;
  yinYang: string;
};

type Status = "idle" | "loading" | "result" | "error";

function SnapshotForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SnapshotResult | null>(null);
  const [firstName, setFirstName] = useState("");
  const [fullName, setFullName] = useState("");
  const [chosenName, setChosenName] = useState("");
  const [dob, setDob] = useState(() => searchParams.get("dob") ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName || !dob) return;
    setStatus("loading");

    const displayFirst = (chosenName.trim() || fullName.trim().split(/\s+/)[0]).trim();
    setFirstName(displayFirst);

    try {
      const res = await fetch("/api/birthprint-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, chosenName, dob }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setResult(data as SnapshotResult);
      setStatus("result");
    } catch {
      setStatus("error");
    }
  }

  function retry() {
    setStatus("idle");
    setResult(null);
  }

  if (status === "loading") {
    return (
      <p
        className={`${cormorant.className} italic text-gold text-2xl text-center mt-8`}
      >
        Reading your patterns...
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
        <p className="text-gold">Something went wrong. Please try again.</p>
        <button
          type="button"
          onClick={retry}
          className="border border-gold text-gold rounded-full px-6 py-3 text-base font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "result" && result) {
    const suitDisplay = SUIT_DISPLAY[result.suit] ?? SUIT_DISPLAY.joker;

    return (
      <div className="max-w-2xl mx-auto">
        <p
          className={`${cormorant.className} italic text-gold text-2xl text-center`}
        >
          {firstName}
        </p>
        <h2
          className={`${cormorant.className} text-white text-3xl text-center mt-2`}
        >
          Your Birthprint Snapshot
        </h2>
        <hr className="border-0 border-t border-gold/40 my-10" />

        <ProseBlock text={result.snapshot} className="mb-10" />

        <div className="bg-navy border border-gold rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-gold uppercase text-xs tracking-widest text-center mb-4">
            Your Data
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-gold/60 text-xs uppercase tracking-wide">
                Birth Card
              </span>
              <span className="text-white text-sm">
                {result.cardName}{" "}
                <span className={suitDisplay.className} aria-hidden="true">
                  {suitDisplay.symbol}
                </span>
                <span className="sr-only">
                  {" "}
                  {SUIT_LABEL[result.suit] ?? result.suit}
                </span>
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-gold/60 text-xs uppercase tracking-wide">
                Life Path
              </span>
              <span className="text-white text-sm">{result.lifePath}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-gold/60 text-xs uppercase tracking-wide">
                Name Frequency
              </span>
              {result.chosenNameExpression !== null &&
              result.chosenNameExpression !== result.expressionNumber ? (
                <span className="text-white text-sm flex flex-col items-end">
                  <span>Birth name: Expression {result.expressionNumber}</span>
                  <span>
                    Chosen name: Expression {result.chosenNameExpression}
                  </span>
                </span>
              ) : (
                <span className="text-white text-sm">
                  Expression {result.expressionNumber}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-gold/60 text-xs uppercase tracking-wide">
                Sun Sign
              </span>
              <span className="text-white text-sm">{result.sunSign}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-gold/60 text-xs uppercase tracking-wide">
                Chinese Zodiac
              </span>
              <span className="text-white text-sm">
                {result.yinYang} {result.element} {result.animal}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 flex flex-col items-center gap-3">
          <Link
            href="/shop"
            className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block"
          >
            Get Your Full Read
          </Link>
          <p
            className={`${cormorant.className} italic text-gold text-sm max-w-sm`}
          >
            This is a 5-lens preview. Your full Birthprint runs across all 8 systems.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto flex flex-col gap-4"
    >
      <label className={labelClass}>
        <span>Full name (as it appears on your birth certificate)</span>
        <input
          type="text"
          required
          placeholder="First, middle, last"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        <span>Chosen name (optional)</span>
        <input
          type="text"
          value={chosenName}
          onChange={(event) => setChosenName(event.target.value)}
          className={inputClass}
        />
        <span className="text-gold text-xs mt-1">
          The name you actually go by, if different.
        </span>
      </label>
      <label className={labelClass}>
        <span>Date of birth</span>
        <input
          type="date"
          required
          value={dob}
          onChange={(event) => setDob(event.target.value)}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        className="w-full bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold mt-2"
      >
        Get My Snapshot
      </button>
    </form>
  );
}

export default function BirthprintSnapshotPage() {
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
            Birthprint Snapshot
          </h1>
          <p className="text-gold text-center mt-2 mb-8">
            A 5-lens preview of your pattern.
          </p>

          <Suspense fallback={null}>
            <SnapshotForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
