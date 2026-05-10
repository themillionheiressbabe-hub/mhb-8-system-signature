/* ===== MEDICINE WHEEL + CHAKRA CAPACITY (v2 — interactive) ===== */

const WHEEL = [
  { dir: 'N', name: 'North', meaning: 'Structure and Wisdom', houses: '2, 6, 10', color: '#C9A96E', angle: -90,
    locked:  'You build slowly, on top of what is already true. Your decisions outlive the moment.',
    avoid:   'You skip the foundation and call it speed. The build cracks where it was rushed.' },
  { dir: 'E', name: 'East',  meaning: 'Clarity and Vision',   houses: '1, 5, 9',  color: '#D63F7E', angle: 0,
    locked:  'You see the whole arc before you start. The first move is exact.',
    avoid:   'You move before you can see. Energy spent on direction-finding mid-flight.' },
  { dir: 'S', name: 'South', meaning: 'Connection and Heart', houses: '3, 7, 11', color: '#2D9B6E', angle: 90,
    locked:  'You let people matter to you. The bond is the work, not the obstacle to it.',
    avoid:   'You manage relationships from a distance. Closeness reads as risk.' },
  { dir: 'W', name: 'West',  meaning: 'Rest and Reflection',  houses: '4, 8, 12', color: '#A78BFA', angle: 180,
    locked:  'You let the day settle before you act on it. The pause is part of the plan.',
    avoid:   'You skip the integration. Lessons get repeated until you stop and read them.' },
];

const WHEEL_STATE = { N: 'primary', E: 'secondary', S: 'supporting', W: 'lesson' };
const STATE_OPACITY = { primary: 1, secondary: 0.6, supporting: 0.3, lesson: 0.3 };

function MedicineWheel({ size = 360 }) {
  const cx = size/2, cy = size/2;
  const R = size/2 - 14;
  const innerR = 22;
  const [hover, setHover] = React.useState(null);
  const [selected, setSelected] = React.useState('N');

  const segPath = (centerAngle) => {
    const a1 = (centerAngle - 45) * Math.PI / 180;
    const a2 = (centerAngle + 45) * Math.PI / 180;
    const x1 = cx + R*Math.cos(a1), y1 = cy + R*Math.sin(a1);
    const x2 = cx + R*Math.cos(a2), y2 = cy + R*Math.sin(a2);
    const xi1 = cx + innerR*Math.cos(a1), yi1 = cy + innerR*Math.sin(a1);
    const xi2 = cx + innerR*Math.cos(a2), yi2 = cy + innerR*Math.sin(a2);
    return `M${xi1} ${yi1} L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} L${xi2} ${yi2} A${innerR} ${innerR} 0 0 0 ${xi1} ${yi1} Z`;
  };

  // animated arc highlighting the selected direction
  const arcAngle = WHEEL.find(q => q.dir === selected)?.angle ?? -90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
          <defs>
            {WHEEL.map(q => (
              <filter key={q.dir} id={`wh-glow-${q.dir}-${size}`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="8" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
          </defs>

          {/* outer dashed ring */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbitSpin 360s linear infinite' }}>
            <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke="rgba(201,169,110,0.18)" strokeWidth="1" strokeDasharray="2 4"/>
          </g>

          {/* segments */}
          {WHEEL.map(q => {
            const baseState = WHEEL_STATE[q.dir];
            const baseOpa = STATE_OPACITY[baseState];
            const isHover = hover === q.dir;
            const isSelected = selected === q.dir;
            const isPrimary = baseState === 'primary';
            const fillOpa = isHover || isSelected ? 0.95 : 0.15 * baseOpa;
            return (
              <g key={q.dir}
                onMouseEnter={() => setHover(q.dir)} onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(q.dir)}
                style={{ cursor: 'pointer', transformOrigin: `${cx}px ${cy}px`,
                  animation: isPrimary ? 'wheelBreathe 3s ease-in-out infinite' : 'none' }}>
                <path d={segPath(q.angle)}
                  fill={q.color} fillOpacity={fillOpa}
                  stroke="rgba(201,169,110,0.45)" strokeWidth="0.8"
                  filter={(isHover || isSelected || isPrimary) ? `url(#wh-glow-${q.dir}-${size})` : undefined}
                  style={{ transition: 'fill-opacity 0.3s ease' }}/>
              </g>
            );
          })}

          {/* radial hairlines */}
          {[45, 135, 225, 315].map(a => {
            const r = (a * Math.PI) / 180;
            return (
              <line key={a}
                x1={cx + innerR*Math.cos(r)} y1={cy + innerR*Math.sin(r)}
                x2={cx + R*Math.cos(r)} y2={cy + R*Math.sin(r)}
                stroke="rgba(201,169,110,0.45)" strokeWidth="0.8"/>
            );
          })}

          {/* outer ring */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1"/>

          {/* moving highlight arc on the outside */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${arcAngle + 90}deg)`, transition: 'transform 0.6s cubic-bezier(.5,.1,.2,1)' }}>
            <path
              d={`M ${cx + (R+12)*Math.cos((-135)*Math.PI/180)} ${cy + (R+12)*Math.sin((-135)*Math.PI/180)}
                  A ${R+12} ${R+12} 0 0 1 ${cx + (R+12)*Math.cos((-45)*Math.PI/180)} ${cy + (R+12)*Math.sin((-45)*Math.PI/180)}`}
              fill="none"
              stroke={WHEEL.find(q => q.dir === selected)?.color}
              strokeWidth="2" strokeLinecap="round" opacity="0.9"
              style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}/>
          </g>

          {/* labels */}
          {WHEEL.map(q => {
            const labelR = R - 50;
            const a = (q.angle * Math.PI) / 180;
            const x = cx + labelR*Math.cos(a);
            const y = cy + labelR*Math.sin(a);
            const isHover = hover === q.dir, isSelected = selected === q.dir;
            const opa = (isHover || isSelected || WHEEL_STATE[q.dir] === 'primary') ? 1 : 0.85;
            return (
              <g key={q.dir} style={{ pointerEvents: 'none' }}>
                <text x={x} y={y - 6} textAnchor="middle" fill={q.color} fillOpacity={opa}
                  style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16, letterSpacing: '0.22em' }}>
                  {q.dir}
                </text>
                <text x={x} y={y + 12} textAnchor="middle" fill={q.color} fillOpacity={opa * 0.75}
                  style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13 }}>
                  {q.name}
                </text>
              </g>
            );
          })}

          {/* center dot */}
          <circle cx={cx} cy={cy} r="4" fill="var(--gold-bright)"
            style={{ filter: 'drop-shadow(0 0 8px var(--gold-bright))' }}/>
        </svg>
      </div>

      {/* detail panel below */}
      {(() => {
        const q = WHEEL.find(x => x.dir === selected);
        return (
          <div style={{
            marginTop: 24, width: '100%', maxWidth: 640,
            background: 'var(--navy-elev)', border: `1px solid ${q.color}66`,
            borderRadius: 16, padding: '22px 26px',
            boxShadow: `0 0 24px ${q.color}22`,
          }}>
            <div className="eyebrow" style={{ color: q.color, marginBottom: 8 }}>{q.dir} · {q.houses}</div>
            <h3 style={{ fontSize: 28, color: q.color, marginBottom: 6 }}>{q.name}</h3>
            <p style={{ fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>{q.meaning}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ color: '#6cd7a8', fontSize: 9.5, marginBottom: 4 }}>Resourced</div>
                <div style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.5 }}>{q.locked}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--magenta-hover)', fontSize: 9.5, marginBottom: 4 }}>Avoided</div>
                <div style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.5 }}>{q.avoid}</div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes wheelBreathe {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

/* ===== Chakras ===== */
const CHAKRAS = [
  { key: 'crown',     name: 'Crown',        sub: 'Your Purpose and Meaning', color: '#A78BFA', state: 'Locked In', y: 36,
    locked:  'Direction is clear. The work means something today.',
    checked: 'Going through motions. The day finishes you instead of feeding you.',
    practice:'Let the work mean something today. Not just get done.' },
  { key: 'third-eye', name: 'Third Eye',    sub: 'Your Insight and Clarity', color: '#6366F1', state: 'Locked In', y: 110,
    locked:  'You read the room before words are spoken.',
    checked: 'Second-guessing the read you already had.',
    practice:'Trust the read you got before you talked yourself out of it.' },
  { key: 'throat',    name: 'Throat',       sub: 'Your Voice and Truth',     color: '#5BC0EB', state: 'Checked Out', y: 192,
    locked:  'You say the true thing, gently and on time.',
    checked: 'You soften, edit, or swallow it. The body remembers.',
    practice:'Say the thing you softened last time. Even just to yourself.' },
  { key: 'heart',     name: 'Heart',        sub: 'Your Love and Connection', color: '#2D9B6E', state: 'Locked In', y: 282,
    locked:  'Generous from fullness. Present without performing.',
    checked: 'Giving from proving. Receipt-keeping in love.',
    practice:'Check if you are giving from fullness or from proving.' },
  { key: 'solar',     name: 'Solar Plexus', sub: 'Your Power and Drive',     color: '#C9A96E', state: 'Locked In', y: 372,
    locked:  'Natural authority. People feel safe under your decision.',
    checked: 'Carrying weight that is not yours. Quiet resentment building.',
    practice:'Name one thing you are not carrying for anyone else right now.' },
  { key: 'sacral',    name: 'Sacral',       sub: 'Your Creativity and Flow', color: '#E07B39', state: 'Locked In', y: 446,
    locked:  'Making for the joy of making. Pleasure on the calendar.',
    checked: 'Producing for output. Joy outsourced.',
    practice:'Make something with your hands today. No purpose needed.' },
  { key: 'root',      name: 'Root',         sub: 'Your Body and Safety',     color: '#B51E5A', state: 'Locked In', y: 522,
    locked:  'Body trusted. Floor under you stays the floor.',
    checked: 'Scanning for threat. Restless, even when seated.',
    practice:'Feet on the floor for 2 minutes before you open your phone.' },
];

function BodySilhouette({ width = 280, height = 620 }) {
  const stroke = 'rgba(255,255,255,0.30)';
  const sw = 1.2;
  return (
    <svg viewBox="0 0 280 660" width={width} height={height} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.06))' }}>
      {/* head */}
      <ellipse cx="140" cy="68" rx="36" ry="46" fill="none" stroke={stroke} strokeWidth={sw}/>
      {/* neck */}
      <path d="M124 110 Q124 132 124 150 M156 110 Q156 132 156 150" stroke={stroke} strokeWidth={sw} fill="none"/>
      {/* shoulders + torso */}
      <path d="M70 168 Q78 152 122 148 L158 148 Q202 152 210 168
               L204 270 Q198 312 192 360
               L188 420 Q186 450 180 478
               L170 560 L162 560 L150 460 L130 460 L118 560 L110 560
               L100 478 Q94 450 92 420 L88 360 Q82 312 76 270 Z"
            fill="none" stroke={stroke} strokeWidth={sw}/>
      {/* arms */}
      <path d="M70 174 Q50 240 47 304 Q47 350 60 392" fill="none" stroke={stroke} strokeWidth={sw}/>
      <path d="M210 174 Q230 240 233 304 Q233 350 220 392" fill="none" stroke={stroke} strokeWidth={sw}/>
      {/* connecting energy line through centre */}
      <line x1="140" y1="148" x2="140" y2="540" stroke="rgba(201,169,110,0.20)" strokeWidth="1" strokeDasharray="0"/>
    </svg>
  );
}

function ChakraCapacity() {
  const [open, setOpen] = React.useState(2); // throat default-open to highlight Checked Out
  const W = 280, H = 620;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${W + 30}px 1fr`, gap: 36, alignItems: 'flex-start' }}>
      <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
        <BodySilhouette width={W} height={H}/>
        {CHAKRAS.map((c, i) => {
          const locked = c.state === 'Locked In';
          const r = 16;
          const cx = W/2;
          const cy = c.y;
          const isOpen = open === i;
          return (
            <div key={c.key}
              onClick={() => setOpen(i)}
              style={{
                position: 'absolute', left: cx - r - 6, top: cy - r - 6,
                width: (r+6)*2, height: (r+6)*2, cursor: 'pointer',
              }}>
              {locked && (
                <span style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  background: `radial-gradient(circle, ${c.color}88 0%, transparent 70%)`,
                  animation: `chakraBreathe 2.6s ease-in-out infinite`, animationDelay: `${i*0.22}s`,
                }}/>
              )}
              <span style={{
                position: 'absolute', left: 6, top: 6, width: r*2, height: r*2,
                borderRadius: '50%',
                background: locked ? c.color : 'rgba(160,160,170,0.4)',
                opacity: locked ? 1 : 0.45,
                filter: locked ? 'none' : 'saturate(0.2)',
                boxShadow: locked
                  ? `0 0 ${r*1.0}px ${c.color}, 0 0 ${r*1.8}px ${c.color}55`
                  : 'inset 0 0 6px rgba(0,0,0,0.4)',
                animation: locked ? 'none' : 'chakraFlicker 4s ease-in-out infinite',
                border: isOpen ? '2px solid #fff' : `1px solid ${locked ? c.color : 'rgba(255,255,255,0.25)'}`,
                transition: 'transform 0.2s',
                transform: isOpen ? 'scale(1.18)' : 'scale(1)',
              }}/>
            </div>
          );
        })}
      </div>

      {/* sliding detail card */}
      <div style={{ minHeight: H, paddingTop: 8 }}>
        {(() => {
          const c = CHAKRAS[open];
          const locked = c.state === 'Locked In';
          return (
            <div key={c.key} className="card" style={{
              padding: '26px 28px', background: 'var(--navy-card)',
              border: `1px solid ${c.color}55`,
              boxShadow: `0 0 24px ${c.color}1f`,
              animation: 'cardSlide 0.4s cubic-bezier(.2,.8,.2,1)',
            }}>
              <div className="eyebrow" style={{ color: c.color, marginBottom: 10 }}>{c.sub}</div>
              <h3 style={{ fontSize: 32, color: c.color, marginBottom: 14, lineHeight: 1.1 }}>{c.name}</h3>
              <div style={{ marginBottom: 22 }}>
                <span className={`pill ${locked ? 'pill-emerald' : 'pill-magenta'}`}>{c.state}</span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ color: '#6cd7a8', fontSize: 9.5, marginBottom: 5 }}>Locked In looks like</div>
                <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{c.locked}</div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <div className="eyebrow" style={{ color: 'var(--magenta-hover)', fontSize: 9.5, marginBottom: 5 }}>Checked Out looks like</div>
                <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{c.checked}</div>
              </div>

              <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid var(--gold-faint)', borderRadius: 12, padding: '14px 16px', marginBottom: 22 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Micro-practice (an option)</div>
                <div style={{ fontSize: 16, color: 'var(--text)', fontStyle: 'italic', fontFamily: 'var(--serif)', lineHeight: 1.45 }}>
                  {c.practice}
                </div>
              </div>

              <button className="btn btn-ghost-gold btn-sm">Save to Journal</button>
            </div>
          );
        })()}
      </div>

      <style>{`
        @keyframes chakraBreathe {
          0%,100% { transform: scale(1); opacity: 0.85; }
          50%     { transform: scale(1.18); opacity: 0.55; }
        }
        @keyframes chakraFlicker {
          0%,100% { opacity: 0.42; }
          43%     { opacity: 0.5; }
          47%     { opacity: 0.28; }
          52%     { opacity: 0.46; }
        }
        @keyframes cardSlide {
          from { transform: translateX(14px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

window.MedicineWheel = MedicineWheel;
window.ChakraCapacity = ChakraCapacity;
