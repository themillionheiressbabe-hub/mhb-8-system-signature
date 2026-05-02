import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BODY_PARAGRAPHS = [
  "I am Yemi Truth. I built a pattern recognition system for women who are done waiting for someone outside themselves to name what they already know is there.",
  "I did not plan to build a system. I found tarot first. That felt like a gift arriving rather than something I went looking for. Then came astrology, then the Destiny Cards, and before I understood what was happening I was thirteen years deep into frameworks that were answering questions I did not even know how to ask yet.",
  "I was standing in the middle of my own wounds for a long time. Not broken. Just carrying things I had not yet named. The work of learning these systems was also the work of learning myself. And what I kept finding was that no single system said everything. But when several of them started saying the same thing, that was when I knew something real was there.",
  "So I built the thing. The system I needed did not exist. Eight independent frameworks, cross-referenced. A pattern only makes it into your read when three or more confirm it. Not because one system is wrong, but because one system alone is not enough. Eight do the heavy lifting. I do the writing. Receipts, not vibes.",
  "I built this for every woman who has felt something true about herself that she could not quite prove. The ones who have done the workshops, read the books, and still felt like something was missing. The therapists doing their own work. The coaches who need their own mirror. The founders building alone. The mothers who have been the unofficial reader for everyone in their orbit for years. The ones who are tired of being explained to in rooms they could be teaching.",
  "You do not need a saviour outside of yourself. You need a mirror that will not blink. That is what this is.",
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
              {/* LEFT: founder portrait */}
              <div className="md:sticky md:top-28">
                <div className="relative aspect-[4/5] rounded-2xl border border-[rgba(201,169,110,0.25)] overflow-hidden">
                  <Image
                    src="/yemi-truth.jpg"
                    alt="Yemi Truth, founder of The MillionHeiress BABE"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />

                  {/* Corner marks */}
                  <div className="absolute top-5 left-5 w-[18px] h-[18px] border-t border-l border-gold" />
                  <div className="absolute top-5 right-5 w-[18px] h-[18px] border-t border-r border-gold" />
                  <div className="absolute bottom-5 left-5 w-[18px] h-[18px] border-b border-l border-gold" />
                  <div className="absolute bottom-5 right-5 w-[18px] h-[18px] border-b border-r border-gold" />
                </div>
              </div>

              {/* RIGHT: text content */}
              <div>
                <p className="eyebrow mb-4">The Founder</p>
                <h1 className="serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.1] mb-3.5">
                  Yemi Truth
                </h1>
                <p className="serif-it text-[1.5rem] text-magenta mb-9 leading-[1.4]">
                  Thirteen years in. Still learning. Still reading.
                </p>

                <hr className="rule-gold mb-10" />

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
