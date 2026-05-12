"use client";

import { useId, useMemo } from "react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";

const SUIT_COLOR: Record<Suit, string> = {
  hearts: "#C44A6E",
  diamonds: "#C9A96E",
  clubs: "#2D9B6E",
  spades: "#A78BFA",
};

const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

interface OrbitProps {
  size?: number;
  suit?: Suit;
  symbol?: string;
  label?: string;
  subLabel?: string;
  centerSize?: number;
  compact?: boolean;
  showCardinals?: boolean;
  symbolSize?: number;
}

export function Orbit({
  size = 220,
  suit = "hearts",
  symbol,
  label,
  subLabel,
  centerSize,
  compact = false,
  showCardinals = true,
  symbolSize,
}: OrbitProps) {
  const reactId = useId();
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size / 2 - 6;
  const dashR = ringR - 8;
  const centerR = (centerSize ?? Math.max(54, size * 0.42)) / 2;
  const suitColor = SUIT_COLOR[suit];
  const sym = symbol ?? SUIT_SYMBOL[suit];
  const symSize = symbolSize ?? Math.round(centerR * 0.85);

  const stars = useMemo(() => {
    const arr: Array<{
      x: number;
      y: number;
      delay: number;
      dur: number;
    }> = [];
    const seed: Array<[number, number]> = [
      [0.32, 0.28],
      [0.74, 0.22],
      [0.22, 0.6],
      [0.78, 0.65],
      [0.5, 0.18],
      [0.55, 0.78],
      [0.18, 0.42],
      [0.82, 0.45],
    ];
    seed.forEach(([px, py], i) => {
      const x = px * size;
      const y = py * size;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < centerR + 8 || d > ringR - 6) return;
      arr.push({ x, y, delay: (i * 0.7) % 4, dur: 2.4 + (i % 3) * 0.6 });
    });
    return arr;
  }, [size, centerR, ringR, cx, cy]);

  const cardPos: Array<{ t: string; x: number; y: number; color: string }> = [
    { t: "N", x: cx, y: 14, color: "var(--gold-bright)" },
    { t: "E", x: size - 14, y: cy + 4, color: "var(--gold-bright)" },
    { t: "S", x: cx, y: size - 8, color: "#E54479" },
    { t: "W", x: 14, y: cy + 4, color: "var(--gold-bright)" },
  ];

  const discId = `disc-${reactId}`;
  const goldGlowId = `gold-glow-${reactId}`;
  const magGlowId = `mag-glow-${reactId}`;

  return (
    <div
      className="orbit-wrap"
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-block",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={discId} cx="40%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#D63F7E" />
            <stop offset="100%" stopColor="#7E1340" />
          </radialGradient>
          <filter
            id={goldGlowId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={magGlowId}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ringR}
          fill="none"
          stroke="rgba(201,169,110,0.3)"
          strokeWidth={1}
          filter={`url(#${goldGlowId})`}
        />

        {/* Star field */}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={1.3} fill="#E8C988">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Rotating dashed ring + traveller */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: "orbitSpin 240s linear infinite",
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={dashR}
            fill="none"
            stroke="rgba(201,169,110,0.4)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <circle
            cx={cx}
            cy={cy - dashR}
            r={3}
            fill="#E8C988"
            filter={`url(#${goldGlowId})`}
          />
        </g>

        {/* Center disc */}
        <circle
          cx={cx}
          cy={cy}
          r={centerR}
          fill={`url(#${discId})`}
          stroke="var(--gold)"
          strokeWidth={1}
        />

        {/* Center content: label or suit symbol */}
        {label ? (
          <g>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#fff"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: Math.max(14, centerR * 0.22),
              }}
            >
              {label}
            </text>
            {subLabel ? (
              <text
                x={cx}
                y={cy + Math.max(centerR * 0.32, 18)}
                textAnchor="middle"
                fill={suitColor}
                style={{
                  fontFamily: "serif",
                  fontSize: Math.max(28, centerR * 0.42),
                  filter: `url(#${magGlowId})`,
                }}
              >
                {subLabel}
              </text>
            ) : null}
          </g>
        ) : (
          <text
            x={cx}
            y={cy + symSize * 0.36}
            textAnchor="middle"
            fill={suitColor}
            style={{
              fontFamily: "serif",
              fontSize: symSize,
              filter: `url(#${magGlowId})`,
            }}
          >
            {sym}
          </text>
        )}

        {/* Compass cardinals */}
        {showCardinals && !compact
          ? cardPos.map((c) => (
              <text
                key={c.t}
                x={c.x}
                y={c.y}
                textAnchor="middle"
                fill={c.color}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: Math.max(9, size * 0.045),
                  letterSpacing: "0.15em",
                  filter:
                    c.t === "S"
                      ? `url(#${magGlowId})`
                      : `url(#${goldGlowId})`,
                }}
              >
                {c.t}
              </text>
            ))
          : null}
      </svg>
    </div>
  );
}

interface OrbitMarkProps {
  size?: number;
  suit?: Suit;
}

export function OrbitMark({ size = 36, suit = "hearts" }: OrbitMarkProps) {
  const reactId = useId();
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size / 2 - 2;
  const centerR = size * 0.34;
  const discId = `mark-disc-${reactId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={discId} cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#D63F7E" />
          <stop offset="100%" stopColor="#7E1340" />
        </radialGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke="rgba(201,169,110,0.6)"
        strokeWidth={1}
      />
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: "orbitSpin 240s linear infinite",
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={ringR - 3}
          fill="none"
          stroke="rgba(201,169,110,0.45)"
          strokeWidth={0.8}
          strokeDasharray="3 3"
        />
        <circle cx={cx} cy={cy - (ringR - 3)} r={1.6} fill="#E8C988" />
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={centerR}
        fill={`url(#${discId})`}
        stroke="rgba(201,169,110,0.7)"
        strokeWidth={0.7}
      />
      <text
        x={cx}
        y={cy + centerR * 0.4}
        textAnchor="middle"
        style={{
          fontFamily: "serif",
          fontSize: centerR * 1.05,
          fill: SUIT_COLOR[suit],
        }}
      >
        {SUIT_SYMBOL[suit]}
      </text>
    </svg>
  );
}
