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
      className={`${outfit.className} flex flex-1 flex-col items-center justify-center text-center px-6`}
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <h1
        className={cormorant.className}
        style={{
          color: "#B51E5A",
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          margin: 0,
        }}
      >
        The MillionHeiress BABE&trade;
      </h1>
      <p
        style={{
          color: "#C9A96E",
          fontSize: "clamp(1rem, 2vw, 1.375rem)",
          marginTop: "1.25rem",
          letterSpacing: "0.02em",
        }}
      >
        Pattern recognition for women who are done guessing
      </p>
    </div>
  );
}
