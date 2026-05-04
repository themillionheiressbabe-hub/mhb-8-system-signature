"use client";

import { useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

type FrequencyResult = {
  birthExpression: number;
  birthSoulUrge: number;
  birthPersonality: number;
  chosenExpression: number | null;
  businessExpression: number | null;
  preview: string;
};

type Status = "idle" | "loading" | "result" | "error";

const CLOSING_LINE =
  "This is your name frequency preview. Your full Name Frequency read lives inside every BABE Signature report.";

function stripClosingLine(text: string): string {
  return text.replace(CLOSING_LINE, "").trim();
}

function splitNumberSections(text: string): {
  expression: string;
  soulUrge: string;
  personality: string;
} {
  const cleaned = stripClosingLine(text);
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    expression: paragraphs[0] ?? "",
    soulUrge: paragraphs[1] ?? "",
    personality: paragraphs[2] ?? "",
  };
}

export default function NameFrequencyPage() {
  const [birthName, setBirthName] = useState("");
  const [chosenName, setChosenName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<FrequencyResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!birthName) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/name-frequency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthName, chosenName, businessName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setResult(data as FrequencyResult);
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
            Name Frequency
          </h1>
          <p className="text-gold text-center mt-2 mb-8">
            The frequency your name is running.
          </p>

          {status === "idle" ? (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto flex flex-col gap-4"
            >
              <label className={labelClass}>
                <span>
                  Full birth name (as it appears on your birth certificate)
                </span>
                <input
                  type="text"
                  required
                  placeholder="First, middle, last"
                  value={birthName}
                  onChange={(event) => setBirthName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                <span>Chosen name (optional)</span>
                <input
                  type="text"
                  placeholder="The name you actually go by"
                  value={chosenName}
                  onChange={(event) => setChosenName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                <span>Business name (optional)</span>
                <input
                  type="text"
                  placeholder="Your brand or business name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <button
                type="submit"
                className="w-full bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold mt-2"
              >
                Read My Frequency
              </button>
            </form>
          ) : null}

          {status === "loading" ? (
            <p
              className={`${cormorant.className} italic text-gold text-2xl text-center mt-8`}
            >
              Reading your frequency...
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
            <ResultView result={result} />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ResultView({ result }: { result: FrequencyResult }) {
  const sections = splitNumberSections(result.preview);

  return (
    <div className="max-w-3xl mx-auto">
      <h2
        className={`${cormorant.className} text-white text-3xl text-center`}
      >
        Your Name Frequency
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
        <NumberCard
          label="Expression"
          number={result.birthExpression}
          body={sections.expression}
        />
        <NumberCard
          label="Soul Urge"
          number={result.birthSoulUrge}
          body={sections.soulUrge}
        />
        <NumberCard
          label="Personality"
          number={result.birthPersonality}
          body={sections.personality}
        />
      </div>

      {result.chosenExpression !== null ||
      result.businessExpression !== null ? (
        <div className="mt-8 text-center flex flex-col gap-1">
          {result.chosenExpression !== null ? (
            <p
              className={`${cormorant.className} italic text-gold text-sm`}
            >
              Chosen name expression: {result.chosenExpression}
            </p>
          ) : null}
          {result.businessExpression !== null ? (
            <p
              className={`${cormorant.className} italic text-gold text-sm`}
            >
              Business name expression: {result.businessExpression}
            </p>
          ) : null}
        </div>
      ) : null}

      <p
        className={`${cormorant.className} italic text-gold text-center text-sm mt-10 max-w-xl mx-auto`}
      >
        {CLOSING_LINE}
      </p>

      <div className="text-center mt-8">
        <Link
          href="/shop"
          className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block"
        >
          Get Your Full Read
        </Link>
      </div>
    </div>
  );
}

function NumberCard({
  label,
  number,
  body,
}: {
  label: string;
  number: number;
  body: string;
}) {
  return (
    <div className="bg-navy border border-gold rounded-2xl p-6 flex flex-col items-center text-center">
      <p
        className={`${cormorant.className} text-gold text-6xl font-semibold leading-none mb-3`}
      >
        {number}
      </p>
      <p className="text-gold uppercase text-xs tracking-widest mb-4">
        {label}
      </p>
      <p className="text-white text-sm leading-relaxed">{body}</p>
    </div>
  );
}
