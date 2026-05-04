"use client";

type Planet = {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
  colour: string;
};

type Props = {
  planets: Planet[];
  chartLinkHref?: string;
};

const PLANET_TEXT: Record<string, string> = {
  Sun: "text-[#C9A96E]",
  Moon: "text-[#E8D5A3]",
  Mercury: "text-[#A78BFA]",
  Venus: "text-[#C44A6E]",
  Mars: "text-[#B51E5A]",
  Jupiter: "text-[#2D9B6E]",
  Saturn: "text-[#6B7280]",
  Uranus: "text-[#5BC0EB]",
  Neptune: "text-[#818CF8]",
  Pluto: "text-[#8B5CF6]",
  Chiron: "text-[#F59E0B]",
};

const PULSE_CLASSES = [
  "planet-pulse-0",
  "planet-pulse-1",
  "planet-pulse-2",
  "planet-pulse-3",
  "planet-pulse-4",
  "planet-pulse-5",
  "planet-pulse-6",
  "planet-pulse-7",
  "planet-pulse-8",
  "planet-pulse-9",
  "planet-pulse-10",
];

export default function PlanetaryPositions({ planets, chartLinkHref }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {planets.map((p, i) => {
        const pulse = PULSE_CLASSES[i % PULSE_CLASSES.length];
        const symbolColor = PLANET_TEXT[p.name] ?? "text-gold";
        return (
          <div
            key={p.name}
            className={`${pulse} bg-[#0D1220] border border-gold/20 rounded-xl p-4 flex flex-col gap-1`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`${symbolColor} text-2xl leading-none`}
                aria-hidden="true"
              >
                {p.symbol}
              </span>
              {p.isRetrograde ? (
                <span className="text-magenta text-xs font-medium ml-1">
                  ℞
                </span>
              ) : null}
            </div>
            <p className="text-white text-sm font-medium">{p.name}</p>
            <p className="text-gold italic text-sm">{p.sign}</p>
            <p className="text-white/50 text-xs">
              {`${p.degree}°${String(p.minutes).padStart(2, "0")}′`}
            </p>
            {chartLinkHref ? (
              <a
                href={chartLinkHref}
                className="text-gold/40 text-xs mt-1 hover:text-gold transition-colors"
              >
                How this interacts with your chart &rarr;
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
