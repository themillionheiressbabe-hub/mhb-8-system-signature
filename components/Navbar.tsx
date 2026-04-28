import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/70 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className={`${cormorant.className} text-magenta text-lg sm:text-2xl font-semibold`}
        >
          The MillionHeiress BABE&trade;
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-gold text-sm hidden sm:inline-block">
            Home
          </Link>
          <Link
            href="/about"
            className="text-gold text-sm hidden sm:inline-block"
          >
            About
          </Link>
          <Link
            href="/shop"
            className="text-gold text-sm hidden sm:inline-block"
          >
            Shop
          </Link>
          <Link
            href="/signup"
            className="bg-magenta text-bg rounded-full px-4 sm:px-5 py-2 text-sm font-semibold inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
