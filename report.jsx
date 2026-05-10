/* ===== REPORT PREVIEW (Engine 2 long-form) ===== */

const REPORT_SECTIONS = [
  { id: 'identity', eyebrow: 'Identity', title: 'Who You Actually Are.' },
  { id: 'power',    eyebrow: 'Power Pattern', title: 'Where Your Strength Lives.' },
  { id: 'shadow',   eyebrow: 'Shadow Pattern', title: 'What Keeps Pulling You Back.' },
];

function Receipts({ items }) {
  return (
    <div style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid var(--gold-light)', borderRadius: 12, padding: '20px 22px', margin: '24px 0' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold-bright)', fontWeight: 600, marginBottom: 14 }}>The Receipts</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((it,i) => (
          <li key={i} style={{ display: 'flex', gap: 14, padding: '8px 0', borderBottom: i < items.length-1 ? '1px solid rgba(201,169,110,0.08)' : 'none' }}>
            <span style={{ flex: '0 0 160px', color: 'var(--gold-bright)', fontSize: 12.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{it.lens}</span>
            <span style={{ color: 'var(--text-soft)', fontSize: 14.5, flex: 1 }}>{it.finding}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StateBox({ kind, body }) {
  const isLocked = kind === 'Locked In';
  const color = isLocked ? '#2D9B6E' : '#B51E5A';
  return (
    <div style={{
      background: isLocked ? 'rgba(45,155,110,0.08)' : 'rgba(181,30,90,0.06)',
      border: `1px solid ${isLocked ? 'rgba(45,155,110,0.30)' : 'rgba(181,30,90,0.25)'}`,
      borderRadius: 12, padding: 20, marginBottom: 14,
    }}>
      <div style={{ fontSize: 10.5, letterSpacing: '0.32em', textTransform: 'uppercase', fontWeight: 600, color, marginBottom: 8 }}>{kind}</div>
      <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.65 }}>{body}</p>
    </div>
  );
}

function ReportPage({ onTab }) {
  const [active, setActive] = React.useState('identity');
  const [progress, setProgress] = React.useState(0);
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      setProgress(Math.min(1, Math.max(0, p)));

      // active section
      const ids = REPORT_SECTIONS.map(s => s.id);
      let cur = ids[0];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 200) cur = id;
      });
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* Reading progress bar */}
      <div style={{ position: 'fixed', top: 42, left: 0, right: 0, height: 2, background: 'rgba(201,169,110,0.08)', zIndex: 60 }}>
        <div style={{ height: '100%', width: `${progress*100}%`, background: 'var(--magenta)', boxShadow: '0 0 10px var(--magenta-glow)', transition: 'width 0.05s linear' }}/>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px 80px' }}>
        {/* Top portal bar */}
        <div className="top-bar">
          <div className="tb-left">
            <OrbitMark size={32} suit="hearts"/>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 17 }}>The MillionHeiress BABE</span>
          </div>
          <div className="tb-right">
            <span>Welcome back, Yemi</span>
            <button className="btn btn-magenta btn-sm" onClick={() => onTab('portal')}>My Birthprint</button>
          </div>
        </div>

        {/* Report header */}
        <div className="card" style={{ padding: 28, marginBottom: 28, display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 24, alignItems: 'center' }}>
          <Orbit size={120} suit="hearts" centerSize={50} showCardinals={false}/>
          <div>
            <Eyebrow style={{ marginBottom: 10 }}>The BABE Signature</Eyebrow>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--magenta-hover)', marginBottom: 6 }}>Your Pattern Read.</h1>
            <div style={{ color: 'var(--text-soft)', fontSize: 15 }}>For Yemi Truth</div>
            <div style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 4 }}>Delivered 10 May 2026 · 22 sections</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-magenta btn-sm">Download PDF</button>
            <button className="btn btn-emerald btn-sm">Save to Journal</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
          {/* Main */}
          <div ref={mainRef} style={{ maxWidth: 720 }}>
            {/* Section 1 — Identity */}
            <section id="identity" style={{ marginBottom: 56 }}>
              <Eyebrow style={{ marginBottom: 14 }}>Identity</Eyebrow>
              <h2 style={{ fontSize: 32, color: 'var(--magenta-hover)', borderLeft: '4px solid var(--magenta)', paddingLeft: 18, marginBottom: 22 }}>
                Who You Actually Are.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text)', marginBottom: 18 }}>
                Five lenses agree on the same shape. You are an air sun in a service house, sitting on top of an earth moon that wants slowness. The body wants stillness while the identity wants the room. That tension is not a flaw. It is the engine.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-soft)', marginBottom: 22 }}>
                The Aries rising means the introduction is direct. People meet the edge of you first. The Capricorn MC means the public version of you is older than your years and has been since you were small. None of this is performance. It is wiring.
              </p>
              <Receipts items={[
                { lens: 'Tropical', finding: 'Sun Libra 6th confirms identity through service and relational fairness.' },
                { lens: 'Cardology', finding: 'King of Hearts as birth card reads as the leadership of love.' },
                { lens: 'Numerology', finding: 'Life Path 9 reads as completion patterns and elder energy from young.' },
              ]}/>
              <hr style={{ border: 0, borderTop: '1px solid var(--gold-faint)' }}/>
            </section>

            {/* Section 2 — Power */}
            <section id="power" style={{ marginBottom: 56 }}>
              <Eyebrow style={{ marginBottom: 14 }}>Power Pattern</Eyebrow>
              <h2 style={{ fontSize: 32, color: 'var(--magenta-hover)', borderLeft: '4px solid var(--magenta)', paddingLeft: 18, marginBottom: 22 }}>
                Where Your Strength Lives.
              </h2>
              <StateBox kind="Locked In" body="When you are working from a clean morning, with one room of your own and one slow cup of something hot, you can name the thing in the room before anyone else does. That is the gift. People feel seen by you because you are actually looking."/>
              <StateBox kind="Checked Out" body="When the morning is hijacked, the gift goes the other way. You over-read the room, take responsibility for moods that are not yours, and end the day cooked. Same instrument. Different setting."/>
              <Receipts items={[
                { lens: 'Tropical', finding: 'Mercury Libra reads conditions before content. Boundary aware when rested.' },
                { lens: 'Chinese',  finding: 'Water Pig reads other people fluently. Without container, it floods.' },
                { lens: 'Chakras',  finding: 'Heart open, throat cooperative. Both shut when over-extended.' },
              ]}/>
              <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--gold-faint)', borderBottom: '1px solid var(--gold-faint)', margin: '32px 0' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, color: 'var(--gold-bright)', lineHeight: 1.4, maxWidth: 560, margin: '0 auto' }}>
                  "Your gift is not what you do. It is what you notice before you do anything."
                </div>
              </div>
            </section>

            {/* Section 3 — Shadow */}
            <section id="shadow" style={{ marginBottom: 56 }}>
              <Eyebrow style={{ marginBottom: 14 }}>Shadow Pattern</Eyebrow>
              <h2 style={{ fontSize: 32, color: 'var(--magenta-hover)', borderLeft: '4px solid var(--magenta)', paddingLeft: 18, marginBottom: 22 }}>
                What Keeps Pulling You Back.
              </h2>
              <StateBox kind="Locked In" body="The shadow has a job. Yours is the one that keeps you small in rooms where you should be big, in service of an old peace that you outgrew. When you see it for what it is, it loses its grip. Not forever. Today."/>
              <StateBox kind="Checked Out" body="When the shadow runs the show, you make yourself useful instead of present. You apologise for taking up the space you were born to take. The body knows. The body always knows."/>
              <Receipts items={[
                { lens: 'Cardology', finding: '6 of Hearts PRC asks where you are over-functioning in love.' },
                { lens: 'Numerology', finding: 'Personal Year 7 reads as withdrawal that, refused, becomes burnout.' },
                { lens: 'Medicine Wheel', finding: 'North direction asks what wisdom you have stopped listening to.' },
              ]}/>
              <hr style={{ border: 0, borderTop: '1px solid var(--gold-faint)' }}/>
            </section>

            {/* Compliance */}
            <div style={{ marginTop: 60, padding: '24px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, lineHeight: 1.7, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              If your lived experience disagrees with anything in this document, trust your lived experience. This report is for personal development and entertainment purposes only. Not a substitute for professional medical, psychological, or legal advice.
            </div>
            <div style={{ textAlign: 'center', marginTop: 28, fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 18 }}>
              With love, The MillionHeiress BABE x
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside style={{ position: 'sticky', top: 80, alignSelf: 'start', height: 'fit-content' }}>
            <div className="card" style={{ padding: 22 }}>
              <Eyebrow style={{ marginBottom: 14 }}>In This Report</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {REPORT_SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`} style={{
                    fontSize: 13.5, color: active===s.id ? 'var(--magenta-hover)' : 'var(--text-soft)',
                    paddingLeft: 12, borderLeft: `2px solid ${active===s.id ? 'var(--magenta)' : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}>
                    {s.title}
                  </a>
                ))}
                <a style={{ fontSize: 13.5, color: 'var(--text-faint)', paddingLeft: 12 }}>+ 19 more sections</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-ghost-gold btn-sm">Save to Journal</button>
                <button className="btn btn-ghost-gold btn-sm">Ask BABE Companion</button>
                <button className="btn btn-emerald btn-sm">Mark as Integrated</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

window.ReportPage = ReportPage;
