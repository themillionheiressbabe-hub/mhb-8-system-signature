"use client";

import { useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import CardArt from "@/components/CardArt";
import ProseBlock from "@/components/ProseBlock";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const RELATIONSHIP_LABEL: Record<string, string> = {
  karma_card: "KARMA CARD",
  past_life: "PAST LIFE",
  karma_cousin: "KARMA COUSIN",
};

const RELATIONSHIP_PILL: Record<string, string> = {
  karma_card: "bg-magenta text-white",
  past_life: "bg-violet text-white",
  karma_cousin: "border border-gold text-gold bg-bg",
};

const CONNECTION_MESSAGE: Record<string, string> = {
  karma_card:
    "Today's card is one of your karma cards. This energy has a direct line to your core pattern. What surfaces today is not random.",
  past_life:
    "Today's card is one of your past life cards. Old soul energy is active. Pay attention to what feels familiar today.",
  karma_cousin:
    "Today's card is a karma cousin to your birth card. A secondary resonance is running. Notice what feels adjacent or connected.",
};

type Result = {
  birthCardCode: string;
  birthCardName: string;
  birthCardSuit: string;
  birthCardValue: string;
  relationshipType: "karma_card" | "past_life" | "karma_cousin" | "neutral";
  combinedRead: string;
};

type Props = {
  todayCardCode: string;
  todayCardName: string;
  todayCardSuit: string;
  todayCardValue: string;
};

export function DayInteractionForm({
  todayCardCode,
  todayCardName,
  todayCardSuit,
  todayCardValue,
}: Props) {
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dob) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/daily-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dob, todayCardCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      setResult(data as Result);
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  if (result) {
    const isNeutral = result.relationshipType === "neutral";
    const pillClass = RELATIONSHIP_PILL[result.relationshipType];
    const pillLabel = RELATIONSHIP_LABEL[result.relationshipType];
    const connectionMessage = CONNECTION_MESSAGE[result.relationshipType];

    return (
      <div className="bg-navy border border-gold rounded-2xl max-w-2xl mx-auto p-8">
        <p className="eyebrow text-center mb-8">How today lands for you</p>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 relative">
          {/* Vertical divider */}
          <div
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gold/30 pointer-events-none"
            aria-hidden="true"
          />

          {/* Left: birth card */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gold uppercase text-xs tracking-widest text-center">
              Your Birth Card
            </p>
            <CardArt
              value={result.birthCardValue}
              suit={result.birthCardSuit}
              size="sm"
            />
            <p className="text-cream text-sm text-center">
              {result.birthCardName}
            </p>
          </div>

          {/* Right: today's card */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gold uppercase text-xs tracking-widest text-center">
              Today&apos;s Card
            </p>
            <CardArt value={todayCardValue} suit={todayCardSuit} size="sm" />
            <p className="text-cream text-sm text-center">{todayCardName}</p>
          </div>

          {/* Pill on the divider, only for actual connections */}
          {!isNeutral && pillClass && pillLabel ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold whitespace-nowrap ${pillClass}`}
              >
                {pillLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="max-w-md mx-auto mt-6 text-center">
          {result.combinedRead ? (
            <>
              <p className="eyebrow tracking-widest text-xs text-center">
                How These Two Meet Today
              </p>
              <ProseBlock text={result.combinedRead} className="mt-3" />
            </>
          ) : null}

          {!isNeutral && connectionMessage ? (
            <>
              <hr className="rule-gold my-10" />
              <p className="eyebrow text-center">The Connection</p>
              <p className="text-cream text-sm leading-relaxed mt-2">
                {connectionMessage}
              </p>
            </>
          ) : null}
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={reset}
            className="text-gold text-sm hover:text-gold-bright transition-colors"
          >
            Try another date &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy border border-gold rounded-2xl max-w-lg mx-auto p-8"
    >
      <h2
        className={`${cormorant.className} text-cream text-2xl text-center`}
      >
        How does today interact with your birth card?
      </h2>
      <p className="text-gold text-sm text-center mt-2">
        Enter your date of birth and see how today&apos;s energy lands
        specifically for your card.
      </p>

      <input
        type="date"
        value={dob}
        onChange={(event) => setDob(event.target.value)}
        required
        disabled={loading}
        className="w-full bg-transparent border border-gold text-gold rounded-lg p-3 mt-4 disabled:opacity-50"
      />

      {error ? (
        <p className="text-magenta text-sm text-center mt-3">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !dob}
        className="w-full bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Reading..." : "See My Interaction"}
      </button>
    </form>
  );
}
