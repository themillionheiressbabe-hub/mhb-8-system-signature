import Link from "next/link";

type DotColor = "gold" | "magenta" | "cream";

type Props = {
  activeHref?: string;
};

const NAV: Array<
  | { kind: "link"; href: string; label: string; dot?: DotColor }
  | { kind: "group"; label: string }
> = [
  { kind: "link", href: "/admin", label: "Overview", dot: "gold" },
  { kind: "link", href: "/admin/clients", label: "Clients", dot: "cream" },
  { kind: "group", label: "Catalog" },
  { kind: "link", href: "/admin/products", label: "Products" },
  { kind: "group", label: "Activity" },
  { kind: "link", href: "/admin/orders", label: "Orders" },
  { kind: "link", href: "/admin/reports", label: "Reports" },
  { kind: "group", label: "Reads" },
  { kind: "link", href: "/admin/cosmic-weather", label: "Cosmic Weather" },
  { kind: "link", href: "/tools/daily-frequency", label: "Card of the Day" },
  { kind: "group", label: "System" },
  { kind: "link", href: "/", label: "Public site" },
];

export function AdminSidebar({ activeHref }: Props) {
  return (
    <aside className="bg-[#0D1220] border-r border-[rgba(201,169,110,0.15)] py-7 px-[18px] md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="serif italic text-cream text-lg mb-6 px-3">
        BABE <span className="text-magenta">HQ</span>
      </div>

      <nav className="flex flex-col">
        {NAV.map((item, i) =>
          item.kind === "group" ? (
            <SidebarGroup key={`g-${i}`}>{item.label}</SidebarGroup>
          ) : (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              dot={item.dot}
              active={item.href === activeHref}
            />
          ),
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  dot,
  active = false,
}: {
  href: string;
  label: string;
  dot?: DotColor;
  active?: boolean;
}) {
  const baseClasses =
    "flex items-center gap-2.5 px-3 py-2.5 text-[13px] no-underline rounded-lg mb-0.5 transition-colors";
  const stateClasses = active
    ? "bg-[rgba(201,169,110,0.08)] text-gold"
    : "text-cream/70 hover:bg-[rgba(201,169,110,0.08)] hover:text-gold";
  const dotColor =
    dot === "gold"
      ? "bg-gold"
      : dot === "magenta"
        ? "bg-magenta"
        : dot === "cream"
          ? "bg-cream/40"
          : "";
  return (
    <Link href={href} className={`${baseClasses} ${stateClasses}`}>
      {dot ? (
        <span
          className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </Link>
  );
}

function SidebarGroup({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.25em] uppercase text-cream/40 px-3 pt-4 pb-2">
      {children}
    </p>
  );
}
