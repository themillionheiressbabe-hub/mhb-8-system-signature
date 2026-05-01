// The Orbit brand mark — procedurally placed nodes per /handoff/README.md.
// Track + line group + node group all rotate together via CSS animation.
// Node glyphs counter-rotate at the same rate so they stay upright.
// Symbols (clockwise from N): ☀ ☽ ↑ ★ ♥ ◈ ∞ ☯
const NODE_SYMBOLS = ["☀", "☽", "↑", "★", "♥", "◈", "∞", "☯"];
const VIEWBOX = 460;
const CENTER = VIEWBOX / 2;
const SVG_RADIUS = 190;

export function Orbit() {
  return (
    <div className="orbit-wrap">
      {/* Connecting lines (rotates with .orbit-lines animation) */}
      <svg
        className="orbit-lines absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        aria-hidden="true"
      >
        {NODE_SYMBOLS.map((_, i) => {
          const angle = (i / NODE_SYMBOLS.length) * Math.PI * 2 - Math.PI / 2;
          const x = CENTER + Math.cos(angle) * SVG_RADIUS;
          const y = CENTER + Math.sin(angle) * SVG_RADIUS;
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="#C9A96E"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Dashed orbit track */}
      <div className="orbit-track" aria-hidden="true" />

      {/* Centre sphere with stacked hearts */}
      <div className="orbit-center" aria-hidden="true">
        <div className="heart-stack">
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path
              fill="#C9A96E"
              d="M16 28s-11-7.2-11-15.4C5 7.4 8.4 4 12.6 4c2.1 0 3.9 1 5.4 2.7C18.5 5 20.3 4 22.4 4 26.6 4 30 7.4 30 12.6 30 20.8 19 28 19 28h-3z"
            />
          </svg>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <path
              fill="#FFFFFF"
              fillOpacity="0.95"
              d="M16 28s-11-7.2-11-15.4C5 7.4 8.4 4 12.6 4c2.1 0 3.9 1 5.4 2.7C18.5 5 20.3 4 22.4 4 26.6 4 30 7.4 30 12.6 30 20.8 19 28 19 28h-3z"
            />
          </svg>
        </div>
      </div>

      {/* Nodes — same .orbit-lines rotation animation; positions inline-calc'd */}
      <div className="orbit-lines absolute inset-0 pointer-events-none">
        {NODE_SYMBOLS.map((symbol, i) => {
          const angle = (i / NODE_SYMBOLS.length) * Math.PI * 2 - Math.PI / 2;
          const cosA = Math.cos(angle).toFixed(4);
          const sinA = Math.sin(angle).toFixed(4);
          return (
            <div
              key={i}
              className="orbit-node"
              style={{
                left: `calc(50% + ${cosA} * var(--orbit-radius))`,
                top: `calc(50% + ${sinA} * var(--orbit-radius))`,
                marginTop: 0,
                marginLeft: 0,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="orbit-node-counter serif" aria-hidden="true">
                {symbol}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
