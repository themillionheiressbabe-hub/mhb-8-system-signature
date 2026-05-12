"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Orbit } from "@/components/Orbit";
import { Particles } from "@/components/Particles";
import { useReveal } from "@/hooks/useReveal";

const PERSONAS: Array<{ name: string; desc: string }> = [
  { name: "Tasha", desc: "Exhausted single mum, holding it all." },
  { name: "Zara", desc: "Young woman with no map, building one." },
  { name: "Carmen", desc: "Sixty plus, rebuilding from scratch." },
  { name: "Nicole", desc: "Hollow success, full calendar, empty room." },
  { name: "Grace", desc: "Religious deconstructor, slow remaking." },
  { name: "Pauline", desc: "Grief reckoner, learning a new floor." },
  { name: "Amara", desc: "Between two worlds, fluent in neither." },
  { name: "Diane", desc: "Recently divorced, naming what is hers." },
  { name: "Rachel", desc: "Done the work. Still stuck." },
  { name: "Jade", desc: "Invisible middle, 35 to 45, ready." },
];

const FREE_TOOLS: Array<{
  name: string;
  sub: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  href: string;
}> = [
  {
    name: "Daily Frequency",
    sub: "A free card pull for today.",
    suit: "hearts",
    href: "/tools/daily-frequency",
  },
  {
    name: "Birthprint Snapshot",
    sub: "A free 5-lens mini read.",
    suit: "diamonds",
    href: "/tools/birthprint-snapshot",
  },
  {
    name: "Your BABE Year",
    sub: "Your free personal year tool.",
    suit: "clubs",
    href: "/tools/your-babe-year",
  },
];

const HOME_PRODUCTS: Array<{ name: string; price: string; sub: string }> = [
  {
    name: "The BABE Mirror",
    price: "£24",
    sub: "A clean first read across 12 sections.",
  },
  {
    name: "The BABE Lens",
    price: "£37",
    sub: "A focused single-question deep read.",
  },
  {
    name: "The BABE Signature",
    price: "£127",
    sub: "The flagship, full-pattern receipt.",
  },
  {
    name: "The BABE Life Spread",
    price: "£14",
    sub: "A small spread for a small moment.",
  },
];

const TESTIMONIALS: Array<{ quote: string; who: string }> = [
  {
    quote:
      "I have done eight years of therapy. This put words on the thing my therapist could not.",
    who: "A. R., London",
  },
  {
    quote:
      "It read me like it had been in the room. The receipts were exact.",
    who: "C. M., Toronto",
  },
  {
    quote: "I cried, then I got organised. That is what a good read should do.",
    who: "J. O., Brooklyn",
  },
];

const FEATURE_CARDS: Array<{ t: string; s: string; accent: string }> = [
  {
    t: "Eight Lenses",
    s: "Astrology, cardology, numerology, Chinese zodiac, name frequency, chakras, medicine wheel, sidereal.",
    accent: "var(--emerald)",
  },
  {
    t: "One Pattern",
    s: "When eight independent systems agree, that is not coincidence. That is structure.",
    accent: "var(--magenta)",
  },
  {
    t: "Entirely Yours",
    s: "Yours by birth. We do not assign it. We confirm it. You take it from there.",
    accent: "var(--gold)",
  },
];

const STEPS: Array<{ n: number; t: string; s: string }> = [
  {
    n: 1,
    t: "You share your birth data.",
    s: "Date, time, place, name. That is all we need.",
  },
  {
    n: 2,
    t: "We cross-verify across eight lenses.",
    s: "No single lens carries the read. Eight do, together.",
  },
  {
    n: 3,
    t: "Your pattern emerges confirmed.",
    s: "Only what three or more lenses agree on makes the report.",
  },
];

function Eyebrow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="eyebrow" style={style}>
      {children}
    </div>
  );
}

function HomeHero() {
  return (
    <section
      className="grain"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 102px)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Particles count={40} />
      <div
        className="container"
        style={{
          position: "relative",
          textAlign: "center",
          padding: "120px 32px",
        }}
      >
        <Eyebrow style={{ marginBottom: 28 }}>
          Multi-System Pattern Recognition for Women
        </Eyebrow>
        <h1
          className="serif-it reveal"
          style={{
            fontSize: "clamp(44px, 6vw, 76px)",
            maxWidth: 1000,
            margin: "0 auto 24px",
            lineHeight: 1.05,
          }}
        >
          You already know who you are.
          <br />
          Your Birthprint just confirms it.
        </h1>
        <p
          className="reveal"
          style={{
            fontSize: 18,
            color: "var(--text-soft)",
            maxWidth: 620,
            margin: "0 auto 40px",
          }}
        >
          Eight independent lenses. One pattern. Entirely yours.
        </p>
        <div
          className="reveal"
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/tools/birthprint-snapshot" className="btn-magenta">
            Discover Your Pattern
          </Link>
          <Link href="#how-it-works" className="btn-ghost-gold">
            See How It Works
          </Link>
        </div>
        <div
          style={{
            marginTop: 80,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Orbit size={260} suit="hearts" />
        </div>
      </div>
    </section>
  );
}

function WhatIsBirthprint() {
  return (
    <section className="section">
      <div className="container-narrow" style={{ textAlign: "center" }}>
        <Eyebrow style={{ marginBottom: 18 }}>What is a Birthprint</Eyebrow>
        <h2
          className="serif-it reveal"
          style={{
            fontSize: "clamp(34px, 4.4vw, 52px)",
            color: "var(--magenta-hover)",
            marginBottom: 22,
          }}
        >
          As unique as your fingerprint.
        </h2>
        <p
          className="reveal"
          style={{
            fontSize: 18,
            color: "var(--text-soft)",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          It is the pattern your birth data left behind. You were born carrying
          it. It is not something you need to achieve or become. It is already
          there. We just read it.
        </p>
      </div>
      <div className="container" style={{ marginTop: 64 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
          }}
        >
          {FEATURE_CARDS.map((c) => (
            <div
              key={c.t}
              className="card card-hover reveal"
              style={{
                padding: "26px 26px 28px",
                borderLeft: `3px solid ${c.accent}`,
              }}
            >
              <h3
                className="serif-it"
                style={{
                  fontSize: 26,
                  color: "var(--gold-bright)",
                  marginBottom: 10,
                }}
              >
                {c.t}
              </h3>
              <p style={{ color: "var(--text-soft)", fontSize: 15.5 }}>{c.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section
      className="section"
      style={{ background: "rgba(255, 255, 255, 0.015)" }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto 56px",
            textAlign: "center",
          }}
        >
          <Eyebrow style={{ marginBottom: 18 }}>The Pattern</Eyebrow>
          <h2
            className="serif-it reveal"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              marginBottom: 22,
            }}
          >
            You have done the work.
            <br />
            You are still stuck.
          </h2>
          <p
            className="reveal"
            style={{ fontSize: 18, color: "var(--text-soft)" }}
          >
            Therapy. Journaling. Courses. You have tried all of it. The issue
            is not effort. The issue is that no one has shown you the actual
            wiring.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 14,
          }}
        >
          {PERSONAS.map((p, i) => (
            <div
              key={p.name}
              className="card card-hover reveal"
              style={{ padding: "20px 18px", textAlign: "left" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${
                    i % 2 ? "var(--magenta-hover)" : "var(--gold-bright)"
                  }, ${i % 2 ? "var(--magenta)" : "var(--gold)"})`,
                  marginBottom: 14,
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: "var(--gold-bright)",
                  fontSize: 22,
                  marginBottom: 4,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-soft)",
                  lineHeight: 1.5,
                }}
              >
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow style={{ marginBottom: 16 }}>How It Works</Eyebrow>
          <h2
            className="serif-it reveal"
            style={{ fontSize: "clamp(30px, 3.8vw, 44px)" }}
          >
            From birth data to a confirmed pattern.
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 60,
              left: "8%",
              right: "8%",
              height: 1,
              background: "var(--gold-light)",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 32,
              position: "relative",
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="reveal"
                style={{ textAlign: "center", padding: "0 14px" }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    margin: "0 auto 22px",
                    borderRadius: "50%",
                    background: "var(--bg)",
                    border: "1px solid var(--gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 64,
                      color: "var(--gold-bright)",
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    color: "var(--text)",
                    marginBottom: 10,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 500,
                  }}
                >
                  {s.t}
                </h3>
                <p style={{ color: "var(--text-soft)", fontSize: 15 }}>
                  {s.s}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="reveal"
          style={{
            marginTop: 80,
            padding: "32px 40px",
            border: "1px solid var(--gold-light)",
            borderRadius: 16,
            maxWidth: 820,
            marginLeft: "auto",
            marginRight: "auto",
            background: "rgba(201, 169, 110, 0.04)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 26,
              color: "var(--gold-bright)",
              lineHeight: 1.4,
            }}
          >
            &ldquo;One lens is signal. Three lenses are a pattern. Eight lenses
            are your receipt.&rdquo;
          </div>
        </div>
      </div>
    </section>
  );
}

function FreeTools() {
  return (
    <section
      className="section"
      style={{ background: "rgba(255, 255, 255, 0.02)" }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow style={{ marginBottom: 16 }}>Start Free</Eyebrow>
          <h2
            className="serif-it reveal"
            style={{ fontSize: "clamp(30px, 3.8vw, 44px)" }}
          >
            Three tools. No card. No catch.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
          }}
        >
          {FREE_TOOLS.map((t) => (
            <Link
              key={t.name}
              href={t.href}
              className="card card-hover reveal"
              style={{
                padding: "28px 26px",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <Orbit
                  size={140}
                  suit={t.suit}
                  centerSize={60}
                  showCardinals={false}
                />
              </div>
              <h3
                className="serif-it"
                style={{
                  fontSize: 24,
                  color: "var(--gold-bright)",
                  marginBottom: 8,
                }}
              >
                {t.name}
              </h3>
              <p
                style={{
                  color: "var(--text-soft)",
                  fontSize: 14.5,
                  marginBottom: 22,
                }}
              >
                {t.sub}
              </p>
              <span className="btn-ghost-gold btn-sm">Try Free</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsPreview() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow style={{ marginBottom: 16 }}>Your Read</Eyebrow>
          <h2
            className="serif-it reveal"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "var(--magenta-hover)",
            }}
          >
            There is a read for where you are right now.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {HOME_PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="card card-hover reveal"
              style={{
                padding: 26,
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 22,
                alignItems: "center",
              }}
            >
              <Orbit
                size={120}
                suit="hearts"
                centerSize={50}
                showCardinals={false}
              />
              <div>
                <h3
                  className="serif-it"
                  style={{
                    fontSize: 26,
                    color: "var(--magenta-hover)",
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </h3>
                <div
                  style={{
                    fontSize: 16,
                    color: "var(--gold-bright)",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                >
                  {p.price}
                </div>
                <p
                  style={{
                    color: "var(--text-soft)",
                    fontSize: 14.5,
                    marginBottom: 16,
                  }}
                >
                  {p.sub}
                </p>
                <Link href="/shop" className="btn-magenta btn-sm">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      className="section"
      style={{ background: "rgba(255, 255, 255, 0.015)" }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow style={{ marginBottom: 16 }}>For the Woman Who</Eyebrow>
          <h2
            className="serif-it reveal"
            style={{ fontSize: "clamp(30px, 3.8vw, 44px)" }}
          >
            Knew. Doubted. Wanted the receipts.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="card card-hover reveal"
              style={{ padding: "32px 28px" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 64,
                  color: "var(--gold-bright)",
                  lineHeight: 0.6,
                  height: 28,
                  marginBottom: 6,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  color: "var(--text)",
                  fontSize: 16,
                  lineHeight: 1.55,
                  marginBottom: 22,
                }}
              >
                {t.quote}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  color: "var(--gold-bright)",
                  marginBottom: 10,
                }}
              >
                {[0, 1, 2, 3, 4].map((s) => (
                  <span key={s}>★</span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--text-faint)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {t.who}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmailCTA() {
  return (
    <section
      className="grain"
      style={{
        position: "relative",
        background: "var(--magenta)",
        padding: "88px 32px",
        overflow: "hidden",
      }}
    >
      <div
        className="container-narrow"
        style={{ textAlign: "center", position: "relative" }}
      >
        <h2
          className="serif-it reveal"
          style={{
            fontSize: "clamp(30px, 4vw, 46px)",
            color: "#fff",
            marginBottom: 18,
          }}
        >
          Start free. See what your birth data reveals.
        </h2>
        <p
          className="reveal"
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: 17,
            maxWidth: 620,
            margin: "0 auto 32px",
          }}
        >
          Get your Birthprint Snapshot at no cost. No card required.
        </p>
        <form
          className="reveal"
          onSubmit={(event) => event.preventDefault()}
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            maxWidth: 540,
            margin: "0 auto",
            flexWrap: "wrap",
          }}
        >
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            style={{
              flex: 1,
              minWidth: 220,
              background: "var(--navy-card)",
              borderColor: "var(--gold-light)",
            }}
          />
          <button className="btn-emerald" type="submit">
            Get My Snapshot
          </button>
        </form>
      </div>
    </section>
  );
}

export default function HomePage() {
  useReveal();

  return (
    <div className="flex-1">
      <Navbar />
      <HomeHero />
      <WhatIsBirthprint />
      <ProblemSection />
      <HowItWorks />
      <FreeTools />
      <ProductsPreview />
      <Testimonials />
      <EmailCTA />
      <Footer />
    </div>
  );
}
