/* ===== Orbit SVG component =====
   Props:
     size: total svg size (default 220)
     suit: 'hearts' | 'diamonds' | 'clubs' | 'spades' (drives center disc symbol color)
     symbol: which suit glyph to render in center (♥ ♦ ♣ ♠)
     label: optional center text (overrides symbol)
     subLabel: optional second line
     centerSize: diameter of center disc (default scales with size)
     compact: hide cardinals + traveller for navbar use
     showCardinals: bool
*/
const SUIT_COLOR = {
  hearts: '#C44A6E',
  diamonds: '#C9A96E',
  clubs: '#2D9B6E',
  spades: '#A78BFA',
};
const SUIT_SYMBOL = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

function Orbit({
  size = 220,
  suit = 'hearts',
  symbol,
  label,
  subLabel,
  centerSize,
  compact = false,
  showCardinals = true,
  symbolSize,
}) {
  const cx = size / 2, cy = size / 2;
  const ringR = size / 2 - 6;
  const dashR = ringR - 8;
  const centerR = (centerSize ?? Math.max(54, size * 0.42)) / 2;
  const suitColor = SUIT_COLOR[suit] || SUIT_COLOR.hearts;
  const sym = symbol || SUIT_SYMBOL[suit];
  const symSize = symbolSize ?? Math.round(centerR * 0.85);

  // Star field — 8 dots at random-ish positions inside ring
  const stars = React.useMemo(() => {
    const arr = [];
    const seed = [
      [0.32,0.28],[0.74,0.22],[0.22,0.6],[0.78,0.65],
      [0.5,0.18],[0.55,0.78],[0.18,0.42],[0.82,0.45],
    ];
    seed.forEach(([px,py],i) => {
      const x = px*size, y = py*size;
      const dx = x-cx, dy = y-cy;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d < centerR + 8 || d > ringR - 6) return;
      arr.push({ x, y, delay: (i*0.7)%4, dur: 2.4 + (i%3)*0.6 });
    });
    return arr;
  }, [size, centerR, ringR]);

  // cardinals at 12, 3, 6, 9
  const cardPos = [
    { t: 'N', x: cx, y: 14, color: 'var(--gold-bright)' },
    { t: 'E', x: size - 14, y: cy + 4, color: 'var(--gold-bright)' },
    { t: 'S', x: cx, y: size - 8, color: '#E54479' },
    { t: 'W', x: 14, y: cy + 4, color: 'var(--gold-bright)' },
  ];

  return (
    <div className="orbit-wrap" style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`disc-${size}`} cx="40%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#D63F7E" />
            <stop offset="100%" stopColor="#7E1340" />
          </radialGradient>
          <filter id={`gold-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`mag-glow-${size}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* outer ring */}
        <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="rgba(201,169,110,0.3)" strokeWidth="1" filter={`url(#gold-glow-${size})`} />

        {/* star field */}
        {stars.map((s,i) => (
          <circle key={i} cx={s.x} cy={s.y} r="1.3" fill="#E8C988">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite"/>
          </circle>
        ))}

        {/* rotating dashed ring + traveller */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbitSpin 240s linear infinite' }}>
          <circle cx={cx} cy={cy} r={dashR} fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy - dashR} r="3" fill="#E8C988" filter={`url(#gold-glow-${size})`} />
        </g>

        {/* center disc */}
        <circle cx={cx} cy={cy} r={centerR} fill={`url(#disc-${size})`} stroke="var(--gold)" strokeWidth="1" />

        {/* center content: label OR symbol */}
        {label ? (
          <g>
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff"
              style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: Math.max(14, centerR * 0.22) }}>
              {label}
            </text>
            {subLabel && (
              <text x={cx} y={cy + Math.max(centerR*0.32, 18)} textAnchor="middle" fill={suitColor}
                style={{ fontFamily: 'serif', fontSize: Math.max(28, centerR*0.42), filter: `url(#mag-glow-${size})` }}>
                {subLabel}
              </text>
            )}
          </g>
        ) : (
          <text x={cx} y={cy + symSize*0.36} textAnchor="middle" fill={suitColor}
            style={{ fontFamily: 'serif', fontSize: symSize, filter: `url(#mag-glow-${size})` }}>
            {sym}
          </text>
        )}

        {/* cardinals */}
        {showCardinals && !compact && cardPos.map((c) => (
          <text key={c.t} x={c.x} y={c.y} textAnchor="middle" fill={c.color}
            style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: Math.max(9, size*0.045), letterSpacing: '0.15em', filter: c.t === 'S' ? `url(#mag-glow-${size})` : `url(#gold-glow-${size})` }}>
            {c.t}
          </text>
        ))}
      </svg>
    </div>
  );
}

// Compact mark for navbar
function OrbitMark({ size = 36, suit = 'hearts' }) {
  const cx = size/2, cy = size/2;
  const ringR = size/2 - 2;
  const centerR = size * 0.34;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={`mark-disc-${size}`} cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#D63F7E"/>
          <stop offset="100%" stopColor="#7E1340"/>
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="1"/>
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbitSpin 240s linear infinite' }}>
        <circle cx={cx} cy={cy} r={ringR-3} fill="none" stroke="rgba(201,169,110,0.45)" strokeWidth="0.8" strokeDasharray="3 3"/>
        <circle cx={cx} cy={cy-(ringR-3)} r="1.6" fill="#E8C988"/>
      </g>
      <circle cx={cx} cy={cy} r={centerR} fill={`url(#mark-disc-${size})`} stroke="rgba(201,169,110,0.7)" strokeWidth="0.7"/>
      <text x={cx} y={cy + centerR*0.4} textAnchor="middle"
        style={{ fontFamily:'serif', fontSize: centerR*1.05, fill: SUIT_COLOR[suit] }}>
        {SUIT_SYMBOL[suit]}
      </text>
    </svg>
  );
}

// Inject keyframes once
(function injectOrbitKeyframes(){
  if (document.getElementById('orbit-kf')) return;
  const s = document.createElement('style');
  s.id = 'orbit-kf';
  s.textContent = `@keyframes orbitSpin { from {transform: rotate(0)} to {transform: rotate(360deg)} }`;
  document.head.appendChild(s);
})();

window.Orbit = Orbit;
window.OrbitMark = OrbitMark;
window.SUIT_COLOR = SUIT_COLOR;
window.SUIT_SYMBOL = SUIT_SYMBOL;
