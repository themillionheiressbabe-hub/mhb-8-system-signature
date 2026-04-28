import { Outfit } from "next/font/google";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"] });

const STATS = [
  { label: "Total Clients", value: 0 },
  { label: "Total Orders", value: 0 },
  { label: "Total Reports", value: 0 },
  { label: "Pending Reports", value: 0 },
];

const NAV_LINKS = [
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminPage() {
  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-bg text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <h1 className="text-magenta text-4xl font-semibold mb-10">Admin</h1>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-navy border border-gold rounded p-6 flex flex-col gap-2"
            >
              <span className="text-white text-4xl font-semibold">
                {stat.value}
              </span>
              <span className="text-gold text-sm uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <nav className="flex flex-wrap gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-magenta text-bg rounded-full px-6 py-2 text-sm font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
