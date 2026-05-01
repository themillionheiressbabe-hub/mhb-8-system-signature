"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export function DayInteractionForm() {
  const router = useRouter();
  const [dob, setDob] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dob) return;
    router.push(`/tools/birthprint-snapshot?dob=${dob}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy border border-gold rounded-2xl max-w-lg mx-auto p-8 mt-8"
    >
      <h2
        className={`${cormorant.className} text-white text-2xl text-center`}
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
        className="w-full bg-transparent border border-gold text-gold rounded-lg p-3 mt-4"
      />
      <button
        type="submit"
        className="w-full bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold mt-4"
      >
        See My Interaction
      </button>
    </form>
  );
}
