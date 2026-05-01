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

const YEAR_MEANINGS: Record<number, string> = {
  1: "A year of new beginnings. What you start now sets the pattern for the next 9 years. Plant seeds with intention.",
  2: "A year of patience and partnership. What you are building needs time. Collaboration matters more than solo effort right now.",
  3: "A year of expression and expansion. Your voice is the tool. Create, communicate, and let yourself be seen.",
  4: "A year of foundations and discipline. Build the structure. What gets laid down now will hold weight for years.",
  5: "A year of change and freedom. Expect the unexpected. Stay flexible and move with the shifts rather than against them.",
  6: "A year of responsibility and love. Home, family, and relationships take centre stage. Service is the theme.",
  7: "A year of reflection and inner work. Go deep, not wide. What you learn about yourself this year changes everything.",
  8: "A year of power and harvest. What you have built is ready to produce results. Step into the authority.",
  9: "A year of completion and release. Let go of what is finished. Clear the ground for the new cycle ahead.",
  11: "A Master Year of spiritual awakening and illumination. Heightened sensitivity. Trust the inner knowing.",
  22: "A Master Year of building at scale. What you create this year has the potential to last beyond you.",
};

function reduce(value: number): number {
  if (value === 11 || value === 22) return value;
  if (value < 10) return value;
  let sum = 0;
  let temp = value;
  while (temp > 0) {
    sum += temp % 10;
    temp = Math.floor(temp / 10);
  }
  return reduce(sum);
}

function calculatePersonalYear(dob: string): number {
  const [, monthStr, dayStr] = dob.split("-");
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const currentYear = new Date().getFullYear();

  return reduce(reduce(month) + reduce(day) + reduce(currentYear));
}

export default function YourBabeYearPage() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<number | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dob) return;
    setResult(calculatePersonalYear(dob));
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

          {result === null ? (
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
          ) : (
            <>
              <div className="bg-navy border border-gold rounded-2xl max-w-md mx-auto p-8 text-center">
                <p className="text-gold text-xs uppercase tracking-widest">
                  Personal Year
                </p>
                <p
                  className={`${cormorant.className} text-white text-6xl font-semibold mt-2`}
                >
                  {result}
                </p>
                <p className="text-white text-base leading-relaxed mt-4">
                  {YEAR_MEANINGS[result] ?? ""}
                </p>
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/shop"
                  className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block"
                >
                  Get My Full Year Map
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
