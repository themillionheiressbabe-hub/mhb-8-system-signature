/* ===== ADMIN — BABE HQ dashboard + sidebar shared with Content Intelligence ===== */

const ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'today', label: 'Today', icon: 'star' },
    { id: 'calendar', label: 'Calendar', icon: 'compass' },
    { id: 'tasks', label: 'Tasks', icon: 'chart' },
    { id: 'notes', label: 'Notes', icon: 'book' },
  ]},
  { section: 'Orders', items: [
    { id: 'orders', label: 'All Orders', icon: 'bag' },
    { id: 'intake', label: 'Pending Intake', icon: 'archive' },
    { id: 'processing', label: 'Processing', icon: 'layers' },
  ]},
  { section: 'Clients', items: [
    { id: 'clients', label: 'All Clients', icon: 'user' },
    { id: 'newclient', label: 'New Client', icon: 'user' },
  ]},
  { section: 'Reports', items: [
    { id: 'newreport', label: 'New Report', icon: 'file', pill: true },
    { id: 'allreports', label: 'All Reports', icon: 'file' },
    { id: 'qc', label: 'QC Queue', icon: 'help' },
  ]},
  { section: 'Birthprints', items: [
    { id: 'allbp', label: 'All Birthprints', icon: 'orbit' },
    { id: 'calc', label: 'Calculator', icon: 'chart' },
  ]},
  { section: 'Engines', items: [
    { id: 'e1', label: 'Engine 1 — Passive', icon: 'layers' },
    { id: 'e2', label: 'Engine 2 — Personal', icon: 'layers' },
    { id: 'e3', label: 'Engine 3 — Business', icon: 'layers' },
    { id: 'e4', label: 'Engine 4 — Bond', icon: 'layers' },
    { id: 'e5', label: 'Engine 5 — Subscription', icon: 'layers' },
    { id: 'e6', label: 'Engine 6 — Timing', icon: 'layers' },
    { id: 'e7', label: 'Engine 7 — Journey', icon: 'layers' },
  ]},
  { section: 'Content', items: [
    { id: 'frequency', label: 'Daily Frequency', icon: 'star' },
    { id: 'content', label: 'Content Intelligence', icon: 'chart' },
  ]},
  { section: 'Admin', items: [
    { id: 'settings', label: 'Settings', icon: 'user' },
    { id: 'audit', label: 'Audit Log', icon: 'archive' },
    { id: 'sop', label: 'SOP Reference', icon: 'book' },
    { id: 'files', label: 'Files', icon: 'file' },
  ]},
];

function AdminSidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <OrbitMark size={32} suit="diamonds" />
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 17 }}>BABE HQ</span>
      </div>
      {ADMIN_NAV.map(s => (
        <div key={s.section}>
          <div className="sb-section"><div className="eyebrow">{s.section}</div></div>
          {s.items.map(it => (
            <div key={it.id} className={`sb-item ${active===it.id ? 'active':''}`} onClick={() => setActive(it.id)}>
              <PortalIcon name={it.icon}/>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.pill && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--magenta)', boxShadow: '0 0 8px var(--magenta-glow)' }}/>}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function AdminTopBar({ tab, onTab }) {
  return (
    <div className="top-bar">
      <div className="tb-left">
        <OrbitMark size={32} suit="diamonds" />
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 17 }}>BABE HQ</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 18 }}>
          <button onClick={() => onTab('admin')} className="pill" style={{
            background: tab==='admin' ? 'var(--magenta)' : 'transparent',
            color: tab==='admin' ? '#fff' : 'var(--text-soft)',
            border: `1px solid ${tab==='admin' ? 'var(--magenta)' : 'var(--gold-faint)'}`,
            padding: '6px 14px', cursor: 'pointer'
          }}>Dashboard</button>
          <button onClick={() => onTab('content')} className="pill" style={{
            background: tab==='content' ? 'var(--magenta)' : 'transparent',
            color: tab==='content' ? '#fff' : 'var(--text-soft)',
            border: `1px solid ${tab==='content' ? 'var(--magenta)' : 'var(--gold-faint)'}`,
            padding: '6px 14px', cursor: 'pointer'
          }}>Content Intelligence</button>
        </div>
      </div>
      <div className="tb-right">
        <span>yemi@millionheiress.babe</span>
      </div>
    </div>
  );
}

const KPI_TILES = [
  { label: 'Orders Today', val: '12', color: 'var(--magenta-hover)', sub: '+3 vs yesterday' },
  { label: 'Revenue Today', val: '£1,847', color: 'var(--gold-bright)', sub: '£32,940 MTD' },
  { label: 'Reports Pending', val: '7', color: 'var(--gold-bright)', sub: '2 due today' },
  { label: 'Active Clients', val: '184', color: '#6cd7a8', sub: '+12 this week' },
];

const ORDERS = [
  { id: 'MHB-0184', product: 'BABE Signature', price: '£127', status: ['gold','In Progress'] },
  { id: 'MHB-0183', product: 'BABE Lens',      price: '£37',  status: ['emerald','Delivered'] },
  { id: 'MHB-0182', product: 'BABE 90',        price: '£77',  status: ['magenta','Queued'] },
  { id: 'MHB-0181', product: 'BABE Mirror',    price: '£24',  status: ['emerald','Delivered'] },
  { id: 'MHB-0180', product: 'Bond Signature', price: '£177', status: ['gold','In Progress'] },
  { id: 'MHB-0179', product: 'Founder Read',   price: '£57',  status: ['emerald','Delivered'] },
  { id: 'MHB-0178', product: 'BABE Crossing',  price: '£37',  status: ['magenta','Queued'] },
];

const KANBAN = {
  Queued: [
    { who: 'A. Reyes',     what: 'BABE Signature' },
    { who: 'M. Okafor',    what: 'BABE 90' },
    { who: 'L. Sandoval',  what: 'BABE Mirror' },
  ],
  Drafting: [
    { who: 'C. Mensah',    what: 'BABE Lens' },
    { who: 'P. Williams',  what: 'Founder Read' },
  ],
  Review: [
    { who: 'J. Okorie',    what: 'Bond Signature' },
  ],
  Sent: [
    { who: 'D. Hartley',   what: 'BABE Reckoning' },
    { who: 'R. Khan',      what: 'BABE Pulse' },
  ],
};

function StatusPill({ kind, text }) {
  return <span className={`pill pill-${kind}`}>{text}</span>;
}

function AdminDashboard({ onTab }) {
  const [active, setActive] = React.useState('today');
  return (
    <div className="app-shell">
      <AdminSidebar active={active} setActive={setActive}/>
      <div className="main-area">
        <AdminTopBar tab="admin" onTab={onTab}/>

        <div style={{ marginBottom: 22 }}>
          <Eyebrow>Today · Sunday 10 May 2026</Eyebrow>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {KPI_TILES.map(k => (
            <div key={k.label} className="card kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-num" style={{ color: k.color }}>{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.4fr', gap: 16 }}>
          {/* Orders */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Recent Orders</Eyebrow>
            <table className="table">
              <thead>
                <tr><th>Client ID</th><th>Product</th><th>Price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--gold-bright)', fontFamily: 'monospace, var(--sans)', fontSize: 12.5 }}>{o.id}</td>
                    <td style={{ color: 'var(--text)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15 }}>{o.product}</td>
                    <td style={{ color: 'var(--text-soft)' }}>{o.price}</td>
                    <td><StatusPill kind={o.status[0]} text={o.status[1]}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kanban */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Report Pipeline</Eyebrow>
            <div className="kanban">
              {Object.entries(KANBAN).map(([col, cards]) => (
                <div key={col} className="col">
                  <h4>{col} <span className="count">{cards.length}</span></h4>
                  {cards.map((c,i) => (
                    <div key={i} className="kc">
                      <div className="who">{c.who}</div>
                      <div className="what">{c.what}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Frequency */}
        <div className="card" style={{ padding: 26, marginTop: 18, display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 22, alignItems: 'center' }}>
          <Orbit size={120} suit="hearts" centerSize={50} showCardinals={false}/>
          <div>
            <Eyebrow style={{ marginBottom: 10 }}>Today's Collective Frequency</Eyebrow>
            <h3 style={{ fontSize: 26, color: 'var(--gold-bright)', marginBottom: 8 }}>Six of Hearts · Lessons in connection.</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: 14.5, maxWidth: 720 }}>
              Today's collective card asks how you are showing up in the room. Where are you generous and where are you guarded. The frequency is honest, not harsh.
            </p>
          </div>
          <button className="btn btn-ghost-gold btn-sm">Copy</button>
        </div>

        <button className="btn btn-magenta" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 30, boxShadow: '0 0 24px var(--magenta-glow)' }}>
          Preview as Client
        </button>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
window.AdminSidebar = AdminSidebar;
window.AdminTopBar = AdminTopBar;
