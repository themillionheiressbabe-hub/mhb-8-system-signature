import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,14,26,0.72)] backdrop-blur-[20px] border-b border-[rgba(201,169,110,0.15)]">
      <div className="container py-4 flex items-center justify-between gap-6">
        <Link
          href="/"
          className={`${cormorant.className} italic text-xl sm:text-2xl leading-none flex items-baseline transition-opacity hover:opacity-90`}
        >
          <span className="text-magenta">The Million</span>
          <span className="text-cream">Heiress&nbsp;</span>
          <span className="text-gold">BABE</span>
          <span className="text-gold text-[10px] sm:text-xs ml-0.5 align-super">
            &trade;
          </span>
        </Link>
        <div className="flex items-center gap-5 sm:gap-7">
          <Link
            href="/"
            className="text-cream text-sm hover:text-magenta transition-colors hidden md:inline-block"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-cream text-sm hover:text-magenta transition-colors hidden md:inline-block"
          >
            Shop
          </Link>
          <Link
            href="/tools/daily-frequency"
            className="text-cream text-sm hover:text-magenta transition-colors hidden md:inline-block"
          >
            Tools
          </Link>
          <Link
            href="/about"
            className="text-cream text-sm hover:text-magenta transition-colors hidden md:inline-block"
          >
            About
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
