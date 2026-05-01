import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BODY_PARAGRAPHS = [
  "I'm a multi-lens reader. That means I don't pick one system and force everything through it. I run seven, and I only report the patterns three or more confirm. The rest is interesting. The rest is not the report.",
  "I made this for the women who already know. The therapists, the coaches, the founders, the mothers who've been the unofficial reader for everyone in their orbit. The ones who are tired of being explained to in workshops they could be teaching.",
  "You don't need another framework. You need a mirror that won't blink. That's what BABE is.",
  "I built it because I needed it, and because the women I love kept asking me to read for them, and reading for one woman at a time wasn't going to scale. Now seven systems do the heavy lifting and I do the writing. Receipts, not vibes.",
];

const METHOD = [
  {
    letter: "B",
    name: "Birthprint",
    body: "The data only you have. Your date, time, place. The signature you came in with.",
    accent: "magenta",
    eyebrowClass: "eyebrow-mag",
    borderClass: "border-l-magenta",
  },
  {
    letter: "A",
    name: "Awareness",
    body: "Naming the pattern in plain language. Not interpretation. Recognition.",
    accent: "gold",
    eyebrowClass: "",
    borderClass: "border-l-gold",
  },
  {
    letter: "B",
    name: "Boundaries",
    body: "What's yours. What isn't. What you're carrying that didn't start with you.",
    accent: "emerald",
    eyebrowClass: "",
    borderClass: "border-l-emerald",
    eyebrowColor: "text-emerald",
  },
  {
    letter: "E",
    name: "Evidence",
    body: "3+ lens confirmation. The receipts. The thing that stops being your imagination the third time it shows up.",
    accent: "violet",
    eyebrowClass: "",
    borderClass: "border-l-violet",
    eyebrowColor: "text-violet",
  },
];

export default function AboutPage() {
  return (
    <div className="flex-1">
      <Navbar />

      <main>
        <section className="pt-32 pb-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20 items-start">
              {/* LEFT: photo placeholder */}
              <div className="md:sticky md:top-28">
                <div className="relative aspect-[4/5] rounded-2xl border border-[rgba(201,169,110,0.25)] overflow-hidden bg-gradient-to-b from-[#1A1428] via-[#0D1220] to-[#0A0E1A]">
                  {/* Soft glow accents */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_35%,rgba(232,189,176,0.18),transparent_60%),radial-gradient(ellipse_40%_30%_at_50%_70%,rgba(181,30,90,0.22),transparent_65%)]" />

                  {/* Corner marks */}
                  <div className="absolute top-5 left-5 w-[18px] h-[18px] border-t border-l border-gold" />
                  <div className="absolute top-5 right-5 w-[18px] h-[18px] border-t border-r border-gold" />
                  <div className="absolute bottom-5 left-5 w-[18px] h-[18px] border-b border-l border-gold" />
                  <div className="absolute bottom-5 right-5 w-[18px] h-[18px] border-b border-r border-gold" />

                  {/* Caption */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="eyebrow mb-1.5">Photo · Yemi Truth</p>
                    <p className="muted text-xs">Founder portrait</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: text content */}
              <div>
                <p className="eyebrow mb-4">The Founder</p>
                <h1 className="serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.1] mb-3.5">
                  Yemi Truth
                </h1>
                <p className="serif-it text-[1.5rem] text-magenta mb-9 leading-[1.4]">
                  Built BABE because nobody else was reading the receipts.
                </p>

                <hr className="rule-gold mb-9" />

                <div className="text-base leading-[1.8] text-cream/88 flex flex-col gap-5">
                  {BODY_PARAGRAPHS.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <hr className="rule-gold my-12" />

                <p className="eyebrow mb-4">The Method</p>
                <h2 className="serif text-[1.75rem] mb-6">B.A.B.E.</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {METHOD.map((m, i) => {
                    const eyebrowColorClass =
                      m.accent === "magenta"
                        ? "text-magenta"
                        : m.accent === "gold"
                          ? "text-gold"
                          : m.accent === "emerald"
                            ? "text-emerald"
                            : "text-violet";
                    return (
                      <div
                        key={i}
                        className={`p-5 border border-gold/18 rounded-[12px] border-l-[3px] ${m.borderClass}`}
                      >
                        <p className={`eyebrow ${eyebrowColorClass} mb-2`}>
                          {m.letter}
                        </p>
                        <p className="serif text-[1.3rem] mb-2">{m.name}</p>
                        <p className="muted text-[13px] leading-[1.6]">
                          {m.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
