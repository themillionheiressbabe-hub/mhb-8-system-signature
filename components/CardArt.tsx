interface CardArtProps {
  value: string;
  suit: string;
  size?: "sm" | "md" | "lg";
}

export default function CardArt({ value, suit, size = "md" }: CardArtProps) {
  const suitSymbols: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  const suitColours: Record<string, string> = {
    hearts: "text-rose-400",
    diamonds: "text-yellow-400",
    clubs: "text-emerald-400",
    spades: "text-violet-400",
  };

  const sizes = {
    sm: { card: "w-24 h-36", corner: "text-lg", centre: "text-5xl", pip: "text-lg" },
    md: { card: "w-36 h-52", corner: "text-2xl", centre: "text-7xl", pip: "text-2xl" },
    lg: { card: "w-48 h-72", corner: "text-3xl", centre: "text-9xl", pip: "text-3xl" },
  };

  const s = sizes[size];
  const symbol = suitSymbols[suit] || "♠";
  const colour = suitColours[suit] || "text-violet-400";

  return (
    <div
      className={`${s.card} relative bg-[#0D1220] border border-yellow-600/40 rounded-xl flex-shrink-0`}
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      <span
        className={`absolute top-3 left-3 leading-none font-serif italic text-yellow-500 ${s.corner}`}
      >
        {value}
      </span>

      <span
        className={`absolute top-3 right-3 leading-none ${colour} ${s.corner}`}
        aria-hidden="true"
      >
        {symbol}
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${colour} ${s.centre} opacity-80`} aria-hidden="true">
          {symbol}
        </span>
      </div>

      <span
        className={`absolute bottom-3 left-3 leading-none rotate-180 ${colour} ${s.corner}`}
        aria-hidden="true"
      >
        {symbol}
      </span>

      <span
        className={`absolute bottom-3 right-3 leading-none rotate-180 font-serif italic text-yellow-500 ${s.corner}`}
      >
        {value}
      </span>
    </div>
  );
}
