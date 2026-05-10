/* ===== APP SHELL ===== */

const TABS = [
  { id: 'home',    label: 'Homepage' },
  { id: 'shop',    label: 'Shop' },
  { id: 'portal',  label: 'Client Portal' },
  { id: 'admin',   label: 'Admin · BABE HQ' },
  { id: 'content', label: 'Content Intelligence' },
  { id: 'report',  label: 'Report Preview' },
];

function App() {
  const [tab, setTab] = React.useState(() => {
    if (typeof location !== 'undefined' && location.hash) {
      const id = location.hash.replace('#','');
      if (TABS.find(t => t.id === id)) return id;
    }
    return 'home';
  });

  React.useEffect(() => {
    if (typeof location !== 'undefined') location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [tab]);

  return (
    <div data-screen-label={tab}>
      <div className="tabbar">
        <span className="label">Preview</span>
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab===t.id ? 'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'home'    && <HomePage onTab={setTab}/>}
      {tab === 'shop'    && <ShopPage onTab={setTab}/>}
      {tab === 'portal'  && <PortalPage onTab={setTab}/>}
      {tab === 'admin'   && <AdminDashboard onTab={setTab}/>}
      {tab === 'content' && <ContentIntelPage onTab={setTab}/>}
      {tab === 'report'  && <ReportPage onTab={setTab}/>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
