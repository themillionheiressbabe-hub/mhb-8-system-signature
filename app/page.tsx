import { Cormorant_Garamond, Outfit } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center justify-center bg-bg px-6 text-center`}
    >
      <h1
        className={`${cormorant.className} text-magenta font-semibold tracking-tight text-5xl sm:text-6xl md:text-7xl`}
      >
        The MillionHeiress BABE&trade;
      </h1>
      <p className="text-gold mt-5 text-lg sm:text-xl tracking-wide">
        Pattern recognition for women who are done guessing
      </p>
    </div>
  );
}
