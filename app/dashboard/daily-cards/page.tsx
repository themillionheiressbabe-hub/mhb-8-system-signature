"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CardArt from "@/components/CardArt";
import { drawRandomCard, type TarotCard } from "@/lib/tarot/deck";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

type DailyRead = {
  dailyRead: string | null;
  cardCode: string;
  cardName: string;
  cardSuit: string;
  cardValue: string;
  dailyEnergyHeading: string | null;
  dailyEnergyBody: string | null;
  dailyEnergyCta: string | null;
};

type PulledTarot = {
  card: TarotCard;
  reversed: boolean;
  read: string | null;
  loadingRead: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

function firstThreeSentences(text: string | null | undefined): string {
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  return sentences.join(" ");
}

export default function DailyCardsPage() {
  const [daily, setDaily] = useState<DailyRead | null>(null);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [tarot, setTarot] = useState<PulledTarot | null>(null);
  const [imageError, setImageError] = useState(false);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/daily-read")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setDailyError(data.error);
        } else {
          setDaily(data as DailyRead);
        }
      })
      .catch(() => {
        if (!cancelled) setDailyError("Failed to load today's card");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function pullTarot() {
    const { card, reversed } = drawRandomCard();
    setTarot({ card, reversed, read: null, loadingRead: true });
    setImageError(false);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/tarot-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: card.name,
          reversed,
          destinyCardName: daily?.cardName ?? "",
          destinyCardEnergyBody: daily?.dailyEnergyBody ?? "",
        }),
      });
      const data = await res.json();
      setTarot({
        card,
        reversed,
        read: data.read ?? null,
        loadingRead: false,
      });
    } catch {
      setTarot({ card, reversed, read: null, loadingRead: false });
    }
  }

  function pullAgain() {
    setTarot(null);
    setImageError(false);
    setNotes("");
    setSaveStatus("idle");
  }

  async function saveEntry() {
    if (!tarot) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/journal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinyCardCode: daily?.cardCode ?? null,
          tarotCardName: tarot.card.name,
          tarotCardReversed: tarot.reversed,
          notes,
        }),
      });
      if (!res.ok) {
        setSaveStatus("error");
        return;
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className={`${outfit.className} flex-1`}>
      <Navbar />

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="text-gold text-sm hover:underline inline-block mb-6"
          >
            &larr; Dashboard
          </Link>

          <h1
            className={`${cormorant.className} text-white text-4xl font-semibold text-center`}
          >
            Daily Cards
          </h1>
          <p className="text-gold text-center mt-2 mb-12">
            Your destiny card and your tarot pull, side by side.
          </p>

          {/* SECTION 1: Destiny Card of the Day */}
          <section className="mb-16">
            <p className="eyebrow text-gold mb-6 text-center">
              Destiny Card of the Day
            </p>
            {dailyError ? (
              <p className="text-gold text-center">{dailyError}</p>
            ) : !daily ? (
              <p
                className={`${cormorant.className} italic text-gold text-center`}
              >
                Loading today's card...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
                <div className="flex justify-center">
                  <CardArt
                    value={daily.cardValue === "Joker" ? "★" : daily.cardValue}
                    suit={daily.cardSuit}
                    size="md"
                  />
                </div>
                <div>
                  <h2
                    className={`${cormorant.className} text-white text-2xl mb-3`}
                  >
                    {daily.cardName}
                  </h2>
                  {daily.dailyEnergyHeading ? (
                    <p className="text-cream/85 text-base leading-relaxed mb-3">
                      {daily.dailyEnergyHeading}
                    </p>
                  ) : null}
                  {daily.dailyEnergyBody ? (
                    <p className="text-white/75 text-sm leading-relaxed">
                      {expanded
                        ? daily.dailyEnergyBody
                        : firstThreeSentences(daily.dailyEnergyBody)}
                    </p>
                  ) : null}
                  {expanded && daily.dailyEnergyCta ? (
                    <p className="eyebrow text-gold mt-4">
                      {daily.dailyEnergyCta}
                    </p>
                  ) : null}
                  {daily.dailyEnergyBody ? (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="text-gold text-sm inline-flex items-center gap-1.5 mt-3 cursor-pointer hover:text-gold-bright transition-colors"
                    >
                      {expanded ? "Read less" : "Read more"}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={
                          expanded ? "rotate-180 transition-transform" : "transition-transform"
                        }
                      >
                        <polyline points="3 4.5 6 7.5 9 4.5" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          <hr className="border-0 border-t border-gold/30 my-10" />

          {/* SECTION 2: Tarot Pull */}
          <section className="mb-16">
            <h2
              className={`${cormorant.className} text-white text-2xl text-center`}
            >
              Pull a Tarot Card
            </h2>
            <p
              className={`${cormorant.className} italic text-gold text-sm text-center mt-2 mb-8`}
            >
              One card. Your intuition chose it.
            </p>

            {!tarot ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={pullTarot}
                  className="bg-magenta text-white rounded-full px-8 py-3 text-base font-semibold"
                >
                  Pull My Card
                </button>
              </div>
            ) : (
              <div className="tarot-reveal max-w-xl mx-auto bg-navy border border-gold rounded-2xl p-8 text-center">
                <div className="mb-6">
                  {!imageError ? (
                    <Image
                      src={tarot.card.imagePath}
                      alt={tarot.card.name}
                      width={200}
                      height={340}
                      className="rounded-xl object-cover mx-auto"
                      style={{
                        boxShadow:
                          "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(201,169,110,0.15)",
                        ...(tarot.reversed ? { transform: "rotate(180deg)" } : {}),
                      }}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div
                      className="rounded-xl mx-auto flex items-center justify-center text-gold text-5xl"
                      style={{
                        width: 200,
                        height: 340,
                        boxShadow:
                          "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(201,169,110,0.15)",
                      }}
                    >
                      ✦
                    </div>
                  )}
                </div>
                <h3
                  className={`${cormorant.className} italic text-white text-2xl`}
                >
                  {tarot.card.name}
                </h3>
                {tarot.reversed ? (
                  <span className="inline-block bg-magenta text-white text-xs uppercase tracking-widest rounded-full px-3 py-1 mt-3">
                    Reversed
                  </span>
                ) : null}
                <p className="text-gold uppercase text-xs tracking-widest mt-3">
                  {tarot.card.arcana === "major"
                    ? "Major Arcana"
                    : `Minor Arcana · ${tarot.card.suit}`}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {(tarot.reversed
                    ? tarot.card.reversedKeywords
                    : tarot.card.uprightKeywords
                  )
                    .slice(0, 3)
                    .map((k) => (
                      <span
                        key={k}
                        className="text-gold text-xs border border-gold rounded-full px-3 py-1"
                      >
                        {k}
                      </span>
                    ))}
                </div>

                <p className="text-white/85 text-sm leading-relaxed mt-3">
                  {tarot.card.meaning}
                </p>

                {tarot.loadingRead ? (
                  <p
                    className={`${cormorant.className} italic text-gold text-sm mt-4`}
                  >
                    Reading the pull...
                  </p>
                ) : tarot.read ? (
                  <p className="text-white text-base leading-relaxed mt-4">
                    {tarot.read}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={pullAgain}
                  className="text-gold text-sm hover:text-gold-bright transition-colors mt-6"
                >
                  Pull Again &rarr;
                </button>
              </div>
            )}
          </section>

          {/* SECTION 3: Save to Journal */}
          {tarot ? (
            <section className="tarot-reveal max-w-xl mx-auto">
              <hr className="border-0 border-t border-gold/30 my-10" />
              <h2
                className={`${cormorant.className} text-white text-xl text-center`}
              >
                Save to your journal
              </h2>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What came up for you today? What are you noticing?"
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="w-full bg-navy border border-gold text-white rounded-xl p-4 mt-5 min-h-[120px] disabled:opacity-60"
              />
              <p className="text-gold/70 text-xs mt-2">
                Today's Destiny Card and your Tarot pull will be saved
                automatically with your note.
              </p>
              <div className="text-center mt-5">
                {saveStatus === "saved" ? (
                  <p className="text-emerald text-sm">Saved to your journal</p>
                ) : (
                  <button
                    type="button"
                    onClick={saveEntry}
                    disabled={saveStatus === "saving"}
                    className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold disabled:opacity-60"
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save Entry"}
                  </button>
                )}
                {saveStatus === "error" ? (
                  <p className="text-magenta text-sm mt-3">
                    Save failed. Try again.
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
