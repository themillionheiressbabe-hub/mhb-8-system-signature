"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function SnapshotForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(() => searchParams.get("dob") ?? "");
  const [tob, setTob] = useState("");
  const [pob, setPob] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
        <h2
          className={`${cormorant.className} text-white text-2xl`}
        >
          Your snapshot is being prepared.
        </h2>
        <p className="text-gold">
          This tool is coming soon. Enter your details to be notified when it
          launches.
        </p>
        <Link
          href="/shop"
          className="border border-gold text-gold rounded-full px-6 py-3 text-base font-semibold inline-block"
        >
          Explore the Shop
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto flex flex-col gap-4"
    >
      <label className={labelClass}>
        <span>Full name</span>
        <input
          type="text"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClass}
        />
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
      <label className={labelClass}>
        <span>Time of birth (optional)</span>
        <input
          type="time"
          value={tob}
          onChange={(event) => setTob(event.target.value)}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        <span>Place of birth (optional)</span>
        <input
          type="text"
          value={pob}
          onChange={(event) => setPob(event.target.value)}
          className={inputClass}
        />
      </label>
      <p className="text-gold text-xs">
        Time and place of birth improve accuracy but are not required.
      </p>
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
