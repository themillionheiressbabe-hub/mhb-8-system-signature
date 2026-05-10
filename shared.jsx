/* ===== Shared: Nav, Footer, Particles, hooks ===== */

function useReveal() {
  React.useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll('.reveal:not(.in)');
      if (!els.length) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('in'), i * 60);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
      els.forEach(el => obs.observe(el));
      // Catch elements already in viewport on mount (observer fires async; force-check)
      requestAnimationFrame(() => {
        els.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
        });
      });
    };
    run();
  }, []);
}

function Particles({ count = 40 }) {
  const dots = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: -Math.random() * 22,
      dur: 18 + Math.random() * 16,
      size: 2 + Math.random() * 2.5,
    }));
  }, [count]);
  return (
    <div className="particles" aria-hidden="true">
      {dots.map((d, i) => (
        <span key={i} className="particle" style={{
          left: `${d.left}%`, top: `${d.top}%`,
          width: `${d.size}px`, height: `${d.size}px`,
          animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`,
        }}/>
      ))}
    </div>
  );
}

function Navbar({ onTab }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <OrbitMark size={36} suit="hearts" />
        <span className="brand-name">The MillionHeiress BABE</span>
      </div>
      <div className="nav-center">
        <a onClick={() => onTab && onTab('home')}>Home</a>
        <a onClick={() => onTab && onTab('home')}>About</a>
        <a onClick={() => onTab && onTab('shop')}>Shop</a>
      </div>
      <div className="nav-right">
        <button className="btn btn-magenta btn-sm" onClick={() => onTab && onTab('portal')}>Get Your Birthprint</button>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OrbitMark size={28} suit="hearts" />
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)', fontSize: 16 }}>The MillionHeiress BABE</span>
        </div>
        <div className="links">
          <a>Home</a><a>About</a><a>Shop</a>
        </div>
        <div style={{ color: 'var(--text-soft)', fontSize: 13 }}>@themillionheiressbabe</div>
      </div>
      <div className="compliance">
        <span>For personal development and entertainment purposes only. Not a substitute for professional advice.</span>
        <span>© 2026 The MillionHeiress BABE</span>
      </div>
    </footer>
  );
}

// Receipt chip (emerald)
function ReceiptChip({ count }) {
  return (
    <span className="pill pill-emerald" style={{ fontWeight: 600 }}>
      ✓ {count} patterns confirmed
    </span>
  );
}

window.useReveal = useReveal;
window.Particles = Particles;
window.Navbar = Navbar;
window.Footer = Footer;
window.ReceiptChip = ReceiptChip;
