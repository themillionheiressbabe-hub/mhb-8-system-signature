import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function Footer() {
  return (
    <footer className="bg-transparent py-16 px-6 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <p
          className={`${cormorant.className} text-magenta text-2xl font-semibold`}
        >
          The MillionHeiress BABE&trade;
        </p>
        <p className="text-gray-500 text-xs leading-relaxed max-w-2xl">
          This platform is for personal development and pattern recognition
          only. It is not therapy, medical advice, or diagnosis. If your lived
          experience disagrees with anything here, trust your lived experience.
        </p>
        <div className="flex flex-wrap gap-6 justify-center text-sm">
          <Link href="/privacy" className="text-gold">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gold">
            Terms
          </Link>
          <Link href="/contact" className="text-gold">
            Contact
          </Link>
        </div>
        <p className="text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} The MillionHeiress BABE. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
