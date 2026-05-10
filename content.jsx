/* ===== CONTENT INTELLIGENCE (admin sub-page) ===== */

function MiniLineChart() {
  // Decorative SVG chart, two lines (magenta TikTok, gold Instagram), 4 weeks
  const W = 560, H = 220, padL = 40, padR = 16, padT = 18, padB = 28;
  const tiktok = [12, 26, 18, 38, 32, 48, 42, 60];
  const ig     = [18, 22, 26, 24, 30, 32, 36, 40];
  const max = 70;
  const pts = (arr) => arr.map((v,i) => {
    const x = padL + (i / (arr.length-1)) * (W - padL - padR);
    const y = H - padB - (v/max) * (H - padT - padB);
    return [x,y];
  });
  const path = (arr) => {
    const p = pts(arr);
    return p.map((pt,i) => (i===0 ? 'M' : 'L') + pt[0].toFixed(1) + ',' + pt[1].toFixed(1)).join(' ');
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220 }}>
      {/* y gridlines */}
      {[0, 17.5, 35, 52.5, 70].map((v,i) => {
        const y = H - padB - (v/max)*(H-padT-padB);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="rgba(201,169,110,0.08)" strokeWidth="1"/>
            <text x={padL-8} y={y+3} textAnchor="end" fontSize="9.5" fill="rgba(255,255,255,0.45)">{v ? v+'k' : '0'}</text>
          </g>
        );
      })}
      {/* x labels */}
      {['W1','W2','W3','W4'].map((l,i) => {
        const x = padL + (i/3)*(W-padL-padR);
        return <text key={l} x={x} y={H-8} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)" letterSpacing="2">{l}</text>;
      })}
      {/* lines */}
      <path d={path(tiktok)} fill="none" stroke="var(--magenta-hover)" strokeWidth="2" />
      <path d={path(ig)} fill="none" stroke="var(--gold-bright)" strokeWidth="2" />
      {pts(tiktok).map((p,i)=> <circle key={'t'+i} cx={p[0]} cy={p[1]} r="3" fill="var(--magenta-hover)"/>)}
      {pts(ig).map((p,i)=> <circle key={'i'+i} cx={p[0]} cy={p[1]} r="3" fill="var(--gold-bright)"/>)}
      {/* legend */}
      <g transform={`translate(${padL},10)`}>
        <circle cx="4" cy="4" r="4" fill="var(--magenta-hover)"/>
        <text x="14" y="7" fontSize="10.5" fill="rgba(255,255,255,0.7)">TikTok</text>
        <circle cx="78" cy="4" r="4" fill="var(--gold-bright)"/>
        <text x="88" y="7" fontSize="10.5" fill="rgba(255,255,255,0.7)">Instagram</text>
      </g>
    </svg>
  );
}

function MiniBarChart() {
  const W = 560, H = 240, padL = 16, padR = 16, padT = 12, padB = 12;
  const rows = [
    { caption: 'Three lenses confirmed it before I…', v: 480 },
    { caption: 'Pattern recognition for the woman…',  v: 360 },
    { caption: 'You already know who you are. Your…',  v: 290 },
    { caption: 'When eight independent systems…',     v: 220 },
    { caption: 'Locked in versus checked out…',       v: 160 },
  ];
  const max = 500;
  const rowH = (H - padT - padB) / rows.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }}>
      {rows.map((r,i) => {
        const y = padT + i*rowH + 6;
        const w = (r.v/max) * (W - padL - 200);
        return (
          <g key={i}>
            <text x={padL} y={y+12} fontSize="10.5" fill="rgba(255,255,255,0.7)">{r.caption}</text>
            <rect x={padL} y={y+18} width={w} height={10} rx="5" fill="var(--magenta)" opacity="0.85"/>
            <text x={padL + w + 8} y={y+27} fontSize="10" fill="var(--gold-bright)">{r.v}k</text>
          </g>
        );
      })}
    </svg>
  );
}

function ContentIntelPage({ onTab }) {
  const [active, setActive] = React.useState('content');
  const [prompt, setPrompt] = React.useState('');
  return (
    <div className="app-shell">
      <AdminSidebar active={active} setActive={setActive}/>
      <div className="main-area">
        <AdminTopBar tab="content" onTab={onTab}/>

        <div style={{ marginBottom: 22 }}>
          <Eyebrow>Content Intelligence</Eyebrow>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginTop: 10 }}>What is working right now.</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
          {[
            { l: 'TikTok Views (28d)', v: '1.42M', c: 'var(--magenta-hover)' },
            { l: 'Instagram Reach',    v: '486k',  c: 'var(--gold-bright)' },
            { l: 'Skool Members',      v: '187',   c: '#6cd7a8' },
            { l: 'Site Conversions',   v: '3.6%',  c: 'var(--magenta-hover)' },
          ].map(k => (
            <div key={k.l} className="card kpi">
              <div className="kpi-label">{k.l}</div>
              <div className="kpi-num" style={{ color: k.c }}>{k.v}</div>
              <div className="kpi-sub">Sync to see live data</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>28-Day Performance</Eyebrow>
            <MiniLineChart/>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Top 5 Posts by Views</Eyebrow>
            <MiniBarChart/>
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Top Performing Content</Eyebrow>
          <table className="table">
            <thead>
              <tr><th>Platform</th><th>Date</th><th>Caption</th><th>Views</th><th>Engagement</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="pill pill-magenta">TikTok</span></td>
                <td style={{ color: 'var(--text-soft)' }}>3 May 2026</td>
                <td style={{ color: 'var(--text)' }}>Three lenses confirmed it before I even said a word…</td>
                <td style={{ color: 'var(--gold-bright)' }}>482,140</td>
                <td style={{ color: 'var(--text-soft)' }}>11.4%</td>
              </tr>
              <tr>
                <td><span className="pill pill-gold">Instagram</span></td>
                <td style={{ color: 'var(--text-soft)' }}>1 May 2026</td>
                <td style={{ color: 'var(--text)' }}>Pattern recognition for the woman who has done…</td>
                <td style={{ color: 'var(--gold-bright)' }}>361,890</td>
                <td style={{ color: 'var(--text-soft)' }}>8.7%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, marginBottom: 22 }}>
          {/* Skool sync */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Skool Sync</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              <input className="input" placeholder="Member Count" defaultValue="187"/>
              <input className="input" placeholder="New This Week" defaultValue="12"/>
              <input className="input" placeholder="Active This Week" defaultValue="94"/>
            </div>
            <button className="btn btn-magenta btn-sm" style={{ marginBottom: 18 }}>Save This Week</button>
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Week</th><th>Members</th><th>New</th><th>Active</th></tr></thead>
              <tbody>
                {[
                  ['10 May','187','12','94'],
                  ['03 May','175','9','88'],
                  ['26 Apr','166','11','81'],
                  ['19 Apr','155','8','77'],
                  ['12 Apr','147','7','72'],
                  ['05 Apr','140','6','69'],
                  ['29 Mar','134','5','64'],
                  ['22 Mar','129','4','61'],
                ].map(r => <tr key={r[0]}>{r.map((c,i)=> <td key={i} style={{ padding: '8px 14px', color: i===0?'var(--text-soft)':'var(--text)' }}>{c}</td>)}</tr>)}
              </tbody>
            </table>
          </div>

          {/* AI assistant */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Your BABE Content Assistant</Eyebrow>
            <h3 style={{ fontSize: 26, color: 'var(--magenta-hover)', marginBottom: 16 }}>What do you want to create today?</h3>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {['What is working this week', 'Give me 5 hooks', 'Plan my content'].map(q => (
                <button key={q} className="btn btn-ghost-gold btn-sm" onClick={() => setPrompt(q)}>{q}</button>
              ))}
            </div>

            <textarea className="input" value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Ask what is working, request content ideas, or tell me what you want to post about..."
              style={{ width: '100%', minHeight: 110, resize: 'vertical', display: 'block', marginBottom: 12 }}/>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button className="btn btn-magenta btn-sm">Generate</button>
            </div>

            <div style={{ background: 'var(--navy-elev)', border: '1px solid var(--gold-faint)', borderRadius: 12, padding: 18, color: 'var(--text-faint)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--magenta)', boxShadow: '0 0 12px var(--magenta-glow)', animation: 'pulseDot 1.5s ease-in-out infinite' }}/>
              <span>Waiting for your prompt. Your assistant has read the last 28 days of data.</span>
            </div>
          </div>
        </div>

        <button className="btn btn-magenta" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 30, boxShadow: '0 0 24px var(--magenta-glow)' }}>
          Preview as Client
        </button>
      </div>

      <style>{`@keyframes pulseDot {
        0%,100% { opacity: 1; transform: scale(1); }
        50%     { opacity: 0.4; transform: scale(0.7); }
      }`}</style>
    </div>
  );
}

window.ContentIntelPage = ContentIntelPage;
