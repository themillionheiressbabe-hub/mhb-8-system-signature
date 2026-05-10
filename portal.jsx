/* ===== CLIENT PORTAL — My Birthprint ===== */

const PORTAL_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'birthprint', label: 'My Birthprint', icon: 'orbit' },
  { id: 'tracker', label: 'Pattern Tracker', icon: 'chart' },
  { id: 'journey', label: 'My Journey', icon: 'compass' },
  { id: 'companion', label: 'BABE Companion', icon: 'chat' },
  { id: 'vault', label: 'Pattern Resets Vault', icon: 'archive' },
  { id: 'integration', label: 'Integration Journal', icon: 'book' },
  { id: 'lens', label: 'Lens Guides', icon: 'layers' },
  { id: 'affirm', label: 'Affirmation Cards', icon: 'star' },
  { id: 'reports', label: 'My Reports', icon: 'file' },
  { id: 'orders', label: 'My Orders', icon: 'bag' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'support', label: 'Support', icon: 'help' },
];

function I({ name }) {
  const s = { width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':    return <svg viewBox="0 0 24 24" style={s}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case 'orbit':   return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
    case 'chart':   return <svg viewBox="0 0 24 24" style={s}><path d="M4 20V8M10 20V4M16 20v-9M22 20H2"/></svg>;
    case 'compass': return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/></svg>;
    case 'chat':    return <svg viewBox="0 0 24 24" style={s}><path d="M21 12a8 8 0 1 1-3-6.2L21 4l-1.2 3.2A8 8 0 0 1 21 12z"/></svg>;
    case 'archive': return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="18" height="5"/><path d="M5 8v13h14V8M10 12h4"/></svg>;
    case 'book':    return <svg viewBox="0 0 24 24" style={s}><path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 0-4 4V4z"/></svg>;
    case 'layers':  return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l9 5-9 5-9-5 9-5zM3 14l9 5 9-5"/></svg>;
    case 'star':    return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l3 6 6 .8-4.5 4.4 1 6.3L12 17l-5.5 3.5 1-6.3L3 9.8 9 9z"/></svg>;
    case 'file':    return <svg viewBox="0 0 24 24" style={s}><path d="M14 3H6v18h12V7l-4-4z"/><path d="M14 3v4h4"/></svg>;
    case 'bag':     return <svg viewBox="0 0 24 24" style={s}><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>;
    case 'user':    return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/></svg>;
    case 'help':    return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>;
    default: return null;
  }
}

function PortalSidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <OrbitMark size={36} suit="hearts" />
      </div>
      {PORTAL_NAV.map(n => (
        <div key={n.id} className={`sb-item ${active===n.id ? 'active':''}`} onClick={() => setActive(n.id)}>
          <I name={n.icon}/>
          <span>{n.label}</span>
        </div>
      ))}
    </aside>
  );
}

// 8 lens detail cards
const LENSES = [
  { eyebrow: 'Tropical Astrology', title: 'Sun Libra · 6th House', body: 'Identity oriented to relationship, fairness, daily ritual. Moon Taurus 1st, Aries Rising, Capricorn MC, Chiron Rx Gemini 2nd.', count: 6 },
  { eyebrow: 'Sidereal Astrology', title: 'Sun Virgo · Service register', body: 'A quieter Sun signature than tropical reads. Confirms the precision and labour pattern.', count: 4 },
  { eyebrow: 'Destiny Cards', title: 'King of Hearts · 6 of Hearts PRC', body: 'Birth card carries the leadership of love. PRC reads the year long lesson in connection.', count: 5 },
  { eyebrow: 'Name Frequency', title: 'Yemi Truth · 7/9', body: 'Name resonance reads as the seeker who calls things by their actual name.', count: 3 },
  { eyebrow: 'Numerology', title: 'Life Path 9 · Personal Year 7', body: 'Lifetime of completion patterns. Current year is study, withdrawal, refinement.', count: 5 },
  { eyebrow: 'Chinese Zodiac', title: 'Water Pig', body: 'Generous, intuitive, pulled to ease yet built for depth. Water sharpens the read.', count: 4 },
  { eyebrow: 'Chakras', title: 'Heart + Throat dominant', body: 'Natal aspects load the upper register. Locked In when expressing, Checked Out when silent.', count: 4 },
  { eyebrow: 'Medicine Wheel', title: 'North · Wisdom direction', body: 'Looks back to look forward. Ancestral memory carries weight in the read.', count: 3 },
];

const NODES = [
  { dir: 'N',  label: 'Sun Libra',         angle: 270 },
  { dir: 'NE', label: 'Moon Taurus',       angle: 315 },
  { dir: 'E',  label: 'Rising Aries',      angle: 0   },
  { dir: 'SE', label: 'MC Capricorn',      angle: 45  },
  { dir: 'S',  label: 'PRC 6 of Hearts',   angle: 90  },
  { dir: 'SW', label: 'Personal Year 7',   angle: 135 },
  { dir: 'W',  label: 'Life Path 9',       angle: 180 },
  { dir: 'NW', label: 'Element Water Pig', angle: 225 },
];

function BirthprintViz() {
  const SIZE = 540;
  const cx = SIZE/2, cy = SIZE/2;
  const rNode = SIZE * 0.42;
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
      <svg width={SIZE} height={SIZE} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {NODES.map((n, i) => {
          const a = (n.angle * Math.PI) / 180;
          const x = cx + rNode * Math.cos(a);
          const y = cy + rNode * Math.sin(a);
          return (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(201,169,110,0.18)" strokeWidth="0.8"/>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Orbit size={400} suit="hearts" centerSize={220} symbol="♥" symbolSize={64} />
      </div>

      {NODES.map((n, i) => {
        const a = (n.angle * Math.PI) / 180;
        const x = cx + rNode * Math.cos(a);
        const y = cy + rNode * Math.sin(a);
        return (
          <div key={i}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28,
              borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.2s',
              transform: hovered===i ? 'scale(1.08)' : 'scale(1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold-bright)', boxShadow: '0 0 12px rgba(201,169,110,0.7)' }}/>
            <div style={{
              position: 'absolute',
              left: x > cx ? '120%' : 'auto',
              right: x < cx ? '120%' : 'auto',
              top: '50%', transform: 'translateY(-50%)',
              padding: '6px 12px', whiteSpace: 'nowrap',
              background: 'var(--navy-elev)', border: `1px solid ${hovered===i ? 'var(--gold)' : 'var(--gold-faint)'}`,
              borderRadius: 999, fontSize: 11.5, color: hovered===i ? 'var(--gold-bright)' : 'var(--text-soft)',
              letterSpacing: '0.06em',
            }}>
              <span className="eyebrow" style={{ fontSize: 9, marginRight: 6, opacity: 0.7 }}>{n.dir}</span>{n.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PatternTrackerTabs() {
  const [tab, setTab] = React.useState('Radar');
  const tabs = ['Radar','Timeline','Journal','Check In','Daily Pull','Body Signals','Spiral Alerts'];
  return (
    <div className="card" style={{ padding: 22, marginTop: 28 }}>
      <Eyebrow style={{ marginBottom: 14 }}>Pattern Tracker</Eyebrow>
      <div style={{ display: 'flex', gap: 22, borderBottom: '1px solid var(--gold-faint)', marginBottom: 22, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'transparent', border: 'none', padding: '10px 0',
            color: tab===t ? 'var(--magenta-hover)' : 'var(--text-soft)',
            fontSize: 13.5, letterSpacing: '0.04em', cursor: 'pointer',
            borderBottom: `2px solid ${tab===t ? 'var(--magenta)' : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ minHeight: 180, color: 'var(--text-soft)', fontSize: 14, padding: '12px 4px' }}>
        <span style={{ color: 'var(--gold-bright)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, display: 'block', marginBottom: 8 }}>{tab}</span>
        Placeholder: this is where your {tab.toLowerCase()} view would live. Filtered by date range, lens, and pattern type.
      </div>
    </div>
  );
}

function PortalPage({ onTab }) {
  const [active, setActive] = React.useState('birthprint');

  return (
    <div className="app-shell">
      <PortalSidebar active={active} setActive={setActive} />
      <div className="main-area">
        <div className="top-bar">
          <div className="tb-left">
            <OrbitMark size={32} suit="hearts" />
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 17 }}>The MillionHeiress BABE</span>
          </div>
          <div className="tb-right">
            <span>Welcome back, Yemi</span>
            <button className="btn btn-magenta btn-sm">My Birthprint</button>
          </div>
        </div>

        <div style={{ marginBottom: 26 }}>
          <Eyebrow>Your Birthprint</Eyebrow>
          <h1 style={{ fontSize: 'clamp(36px, 4.4vw, 56px)', color: 'var(--magenta-hover)', margin: '12px 0 8px' }}>Yemi Truth.</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 16 }}>King of Hearts · Life Path 9 · Water Pig · Aries Rising</p>
        </div>

        <div className="card" style={{ padding: '40px 24px', marginBottom: 32 }}>
          <BirthprintViz />
        </div>

        <Eyebrow style={{ marginBottom: 14 }}>Eight Lens Detail</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {LENSES.map(l => (
            <div key={l.eyebrow} className="card card-hover" style={{ padding: 22 }}>
              <Eyebrow style={{ marginBottom: 10 }}>{l.eyebrow}</Eyebrow>
              <h3 style={{ fontSize: 22, color: 'var(--gold-bright)', marginBottom: 10 }}>{l.title}</h3>
              <p style={{ color: 'var(--text-soft)', fontSize: 14.5, marginBottom: 14 }}>{l.body}</p>
              <ReceiptChip count={l.count} />
            </div>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 14, marginTop: 36 }}>Medicine Wheel</Eyebrow>
        <div className="card" style={{ padding: 28, marginBottom: 18 }}>
          <MedicineWheel size={360}/>
        </div>

        <Eyebrow style={{ marginBottom: 14, marginTop: 8 }}>Chakra Capacity</Eyebrow>
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <ChakraCapacity/>
        </div>

        <Eyebrow style={{ marginBottom: 14, marginTop: 8 }}>Dashboard</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { t: 'Order Status', v: '2 reports in flight' },
            { t: 'BABE Companion', v: 'Ask anything' },
            { t: 'Integration Space', v: '3 entries this week' },
            { t: 'Community (Skool)', v: '187 BABEs in circle' },
            { t: 'Daily Frequency', v: 'Six of Hearts' },
            { t: 'My Reports', v: '4 delivered' },
            { t: 'My Journey', v: 'Personal Year 7' },
            { t: 'Support', v: 'We answer in 24h' },
          ].map(c => (
            <div key={c.t} className="card card-hover" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>{c.t}</div>
              <div style={{ fontSize: 16, color: 'var(--text)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>{c.v}</div>
            </div>
          ))}
        </div>

        <PatternTrackerTabs />
      </div>
    </div>
  );
}

window.PortalPage = PortalPage;
window.PortalIcon = I;
