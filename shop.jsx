/* ===== SHOP PAGE ===== */

const ENGINES = [
  {
    key: 'e1', name: 'Engine 1 — Passive', suit: 'diamonds',
    products: [
      { name: 'The Daily Frequency', price: 'FREE' },
      { name: 'The Birthprint Snapshot', price: 'FREE' },
      { name: 'Your BABE Year', price: 'FREE' },
      { name: 'The BABE Life Spread', price: '£14' },
      { name: 'Daily Frequency Personal', price: '£4.99/mo' },
    ],
  },
  {
    key: 'e2', name: 'Engine 2 — Personal', suit: 'hearts',
    products: [
      { name: 'The BABE Mirror', price: '£24', meta: '12 sections · 5 day SLA' },
      { name: 'The BABE Lens', price: '£37', meta: '14 sections · 5–7 day SLA' },
      { name: 'The BABE Crossing', price: '£37', meta: '14 sections · 5–7 day SLA' },
      { name: 'The BABE Reckoning', price: '£37', meta: '14 sections · 7 day SLA' },
      { name: 'The BABE Rebuild', price: '£57', meta: '16 sections · 7 day SLA' },
      { name: 'The BABE 90', price: '£77', meta: '18 sections · 10 day SLA' },
      { name: 'The BABE Signature', price: '£127', meta: '22 sections · 10–14 day SLA' },
      { name: 'The BABE Debrief', price: '£55', meta: 'Add-on only' },
    ],
  },
  {
    key: 'e3', name: 'Engine 3 — Business', suit: 'clubs',
    products: [
      { name: 'The BABE Business Lens', price: '£37' },
      { name: 'The BABE Brand Frequency', price: '£37' },
      { name: 'The BABE Founder Read', price: '£57' },
      { name: 'The BABE Business Signature', price: '£147' },
    ],
  },
  {
    key: 'e4', name: 'Engine 4 — Bond', suit: 'spades',
    products: [
      { name: 'The BABE Bond Mother + Daughter', price: '£27' },
      { name: 'The BABE Bond Co-Parenting', price: '£37' },
      { name: 'The BABE Bond Lens', price: '£47' },
      { name: 'The BABE Bond Signature', price: '£177' },
    ],
  },
  {
    key: 'e5', name: 'Engine 5 — Subscription', suit: 'diamonds',
    products: [{ name: 'Daily Frequency Personal', price: '£4.99/mo', meta: 'Daily card pull, your name only.' }],
  },
  {
    key: 'e6', name: 'Engine 6 — Timing', suit: 'hearts',
    products: [
      { name: 'The BABE Pulse', price: '£27', meta: '3 months' },
      { name: 'The BABE Business Pulse', price: '£27', meta: '3 months' },
      { name: 'The BABE Bond Pulse', price: '£47', meta: '3 months' },
      { name: 'Your BABE Year Map', price: '£57', meta: '12 months' },
      { name: 'Your BABE Business Year', price: '£57', meta: '12 months' },
      { name: 'Your BABE Bond Year', price: '£77', meta: '12 months' },
    ],
  },
  {
    key: 'e7', name: 'Engine 7 — Journey', suit: 'spades',
    products: [{ name: 'The BABE 52-Week Journey', price: '£147 one-time / £14.99/mo × 12', meta: 'Year-long companion.' }],
  },
];

function FilterPill({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`pill-filter${active ? ' active' : ''}`} style={{
      padding: '9px 18px', borderRadius: 999, fontSize: 12.5, letterSpacing: '0.06em',
      cursor: 'pointer', transition: 'all 0.2s',
      background: active ? 'var(--magenta)' : 'transparent',
      color: active ? '#fff' : 'var(--text-soft)',
      border: `1px solid ${active ? 'var(--magenta)' : 'var(--gold-light)'}`,
      fontFamily: 'var(--sans)',
    }}>
      {children}
    </button>
  );
}

function ProductCard({ p, engineName, suit }) {
  return (
    <div className="card card-hover" style={{ padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 18, right: 18 }}>
        <Orbit size={62} suit={suit} centerSize={26} showCardinals={false} />
      </div>
      <div style={{ paddingRight: 70 }}>
        <div className="eyebrow" style={{ marginBottom: 12, fontSize: 9.5 }}>{engineName}</div>
        <h3 style={{ fontSize: 22, color: 'var(--magenta-hover)', marginBottom: 8, lineHeight: 1.2 }}>{p.name}</h3>
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, color: 'var(--gold-bright)', fontSize: 15, marginBottom: p.meta ? 6 : 18 }}>
          {p.price}
        </div>
        {p.meta && <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 18 }}>{p.meta}</div>}
        <button className="btn btn-magenta btn-sm">View Report</button>
      </div>
    </div>
  );
}

function ShopPage({ onTab }) {
  const [filter, setFilter] = React.useState('all');

  const visible = filter === 'all' ? ENGINES : ENGINES.filter(e => e.key === filter);

  return (
    <div>
      <Navbar onTab={onTab} />
      <div style={{ padding: '72px 32px 28px', textAlign: 'center' }}>
        <div className="container">
          <Eyebrow style={{ marginBottom: 18 }}>The BABE Signature System</Eyebrow>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', marginBottom: 18 }}>Find your read.</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 17, maxWidth: 600, margin: '0 auto' }}>
            29 products across 7 engines. £14 to £177.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 32px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <FilterPill active={filter==='all'} onClick={() => setFilter('all')}>All</FilterPill>
          {ENGINES.map(e => (
            <FilterPill key={e.key} active={filter===e.key} onClick={() => setFilter(e.key)}>{e.name}</FilterPill>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {visible.map(eng => (
          <div key={eng.key} style={{ marginTop: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 18, color: 'var(--gold-bright)' }}>{eng.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {eng.products.map(p => (
                <ProductCard key={p.name} p={p} engineName={eng.name} suit={eng.suit}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

window.ShopPage = ShopPage;
