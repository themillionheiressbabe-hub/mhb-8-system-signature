import { Cormorant_Garamond, Outfit } from "next/font/google";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

const FREE_TOOLS = [
  {
    title: "Daily Frequency",
    body: "See which card is active today.",
  },
  {
    title: "Birthprint Snapshot",
    body: "Get a 5-lens preview of your pattern.",
  },
  {
    title: "Your BABE Year",
    body: "Find out what this year is asking of you.",
  },
];

const ORBIT_NODES = [
  { dir: "n", symbol: "☀" },
  { dir: "ne", symbol: "☽" },
  { dir: "e", symbol: "↑" },
  { dir: "se", symbol: "★" },
  { dir: "s", symbol: "♥" },
  { dir: "sw", symbol: "◈" },
  { dir: "w", symbol: "∞" },
  { dir: "nw", symbol: "☯" },
];

export default function Home() {
  return (
    <div className={`${outfit.className} flex-1`}>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <h1
            className={`${cormorant.className} text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight`}
          >
            You are not the problem. Your pattern is just unread.
          </h1>
          <p className="text-gold text-xl mt-8 max-w-2xl mx-auto">
            Multi-system pattern recognition for women who are done guessing.
          </p>

          <div className="orbit mx-auto my-12">
            <div className="orbit-rotator">
              <div className="orbit-track" />
              {ORBIT_NODES.map((node) => (
                <div
                  key={`line-${node.dir}`}
                  className={`orbit-line orbit-line-${node.dir}`}
                />
              ))}
              {ORBIT_NODES.map((node) => (
                <div
                  key={node.dir}
                  className={`orbit-node orbit-node-${node.dir}`}
                >
                  <span className="orbit-node-symbol" aria-hidden="true">
                    {node.symbol}
                  </span>
                </div>
              ))}
            </div>
            <div className="orbit-center">
              <span
                aria-hidden="true"
                className={`${cormorant.className} italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[60px] leading-none orbit-heart-back`}
              >
                &hearts;
              </span>
              <span
                aria-hidden="true"
                className={`${cormorant.className} italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[52px] leading-none orbit-heart-front`}
              >
                &hearts;
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/shop"
              className="bg-magenta text-bg rounded-full px-6 py-3 text-base font-semibold inline-block"
            >
              Read My Pattern
            </Link>
            <Link
              href="/tools"
              className="border border-gold text-gold rounded-full px-6 py-3 text-base font-semibold inline-block"
            >
              Try a Free Tool
            </Link>
          </div>
        </div>
      </section>

      {/* THE SYSTEM */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-navy border border-gold/30 rounded-lg p-10 sm:p-14 text-center">
          <h2
            className={`${cormorant.className} text-magenta text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-6`}
          >
            One birthdate. Eight lenses. One clear picture.
          </h2>
          <p className="text-white text-lg leading-relaxed">
            Most systems give you one angle. We use eight independent
            frameworks, cross-referenced, to find what actually repeats across
            your data. A pattern only makes it into your report when three or
            more lenses confirm it. No guessing. No generalising. Just what is
            actually there.
          </p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="bg-[#1a1f2e] py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <h2
            className={`${cormorant.className} text-gold text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight`}
          >
            You have tried to figure yourself out.
          </h2>
          <div className="flex flex-col gap-5 text-white text-base sm:text-lg leading-relaxed">
            <p>
              You have taken the tests. You have read the books. You have tried
              every new framework that promised to finally explain why you do
              what you do.
            </p>
            <p>
              Some of it stuck. Most of it gave you vocabulary, not clarity. You
              came away with new words, but the same questions about why the
              same things keep happening.
            </p>
            <p>
              You do not need another label. You need a read on the actual
              pattern that runs through your work, your relationships, and the
              decisions you keep making at three in the morning. The one that
              repeats no matter what you call it.
            </p>
          </div>
        </div>
      </section>

      {/* FREE TOOLS */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FREE_TOOLS.map((card) => (
              <div
                key={card.title}
                className="bg-navy border border-gold rounded-lg p-8 flex flex-col gap-4"
              >
                <h3
                  className={`${cormorant.className} text-magenta text-2xl font-semibold`}
                >
                  {card.title}
                </h3>
                <p className="text-white text-base leading-relaxed flex-1">
                  {card.body}
                </p>
                <Link
                  href="/tools"
                  className="bg-emerald text-white rounded-full px-5 py-2 text-sm font-semibold inline-block self-start"
                >
                  Try it free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
