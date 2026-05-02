import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { CosmicBackground } from "@/components/CosmicBackground";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The MillionHeiress BABE™ — Eight Lenses. One Truth. Yours.",
  description:
    "Pattern recognition for women who are done being explained to. Eight independent systems, cross-referenced. Receipts, not vibes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CosmicBackground />
        <div className="relative z-[1] flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
