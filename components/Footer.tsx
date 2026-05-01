import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SHOP_LINKS = [
  { href: "/shop?section=signatures", label: "The Signatures" },
  { href: "/shop?section=start-here", label: "Start Here" },
  { href: "/shop?section=try-first", label: "Try First" },
  { href: "/shop?section=daily", label: "Daily" },
  { href: "/shop", label: "All Products" },
];

const FREE_LINKS = [
  { href: "/tools/daily-frequency", label: "Card of the Day" },
  { href: "/tools/birthprint-snapshot", label: "Birthprint Snapshot" },
  { href: "/tools/your-babe-year", label: "Your BABE Year" },
];

const MORE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/login", label: "Sign In" },
  { href: "/signup", label: "Create Account" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="bg-transparent pt-16 pb-12 border-t border-[rgba(201,169,110,0.15)] mt-24">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className={`${cormorant.className} italic text-xl flex items-baseline mb-4 hover:opacity-90 transition-opacity`}
            >
              <span className="text-magenta">The Million</span>
              <span className="text-cream">Heiress&nbsp;</span>
              <span className="text-gold">BABE</span>
              <span className="text-gold text-[10px] ml-0.5 align-super">
                &trade;
              </span>
            </Link>
            <p className="muted text-xs leading-relaxed max-w-xs">
              Seven Lenses. One Truth. Yours. Pattern recognition for women
              who are done being explained to.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4">Shop</p>
            <ul className="flex flex-col gap-2 text-sm">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream hover:text-magenta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Free</p>
            <ul className="flex flex-col gap-2 text-sm">
              {FREE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream hover:text-magenta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">More</p>
            <ul className="flex flex-col gap-2 text-sm">
              {MORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream hover:text-magenta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="rule-gold mb-8" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <p className="muted text-[11px] leading-relaxed max-w-2xl">
            Pattern recognition for personal development. Non-predictive.
            Non-diagnostic. Non-prescriptive. If your lived experience
            disagrees with anything here, trust your lived experience.
          </p>
          <p className="muted text-[11px] whitespace-nowrap">
            &copy; {new Date().getFullYear()} The MillionHeiress BABE
          </p>
        </div>
      </div>
    </footer>
  );
}
