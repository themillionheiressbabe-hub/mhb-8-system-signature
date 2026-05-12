import Link from "next/link";

type DotColor = "gold" | "magenta" | "cream";

type Props = {
  activeHref?: string;
};

const NAV: Array<
  | { kind: "link"; href: string; label: string; dot?: DotColor }
  | { kind: "group"; label: string }
> = [
  { kind: "group", label: "Overview" },
  { kind: "link", href: "/admin", label: "Dashboard", dot: "gold" },
  { kind: "link", href: "/admin/today", label: "Today" },
  { kind: "link", href: "/admin/calendar", label: "Calendar" },
  { kind: "link", href: "/admin/tasks", label: "Tasks" },
  { kind: "link", href: "/admin/notes", label: "Notes" },

  { kind: "group", label: "Orders" },
  { kind: "link", href: "/admin/orders", label: "All Orders" },
  { kind: "link", href: "/admin/orders/intake", label: "Pending Intake" },
  { kind: "link", href: "/admin/orders/processing", label: "Processing" },

  { kind: "group", label: "Clients" },
  { kind: "link", href: "/admin/clients", label: "All Clients", dot: "cream" },
  { kind: "link", href: "/admin/clients/new", label: "New Client" },

  { kind: "group", label: "Reports" },
  {
    kind: "link",
    href: "/admin/reports/new",
    label: "New Report",
    dot: "magenta",
  },
  { kind: "link", href: "/admin/reports", label: "All Reports" },
  { kind: "link", href: "/admin/reports/qc", label: "QC Queue" },

  { kind: "group", label: "Birthprints" },
  { kind: "link", href: "/admin/birthprints", label: "All Birthprints" },
  { kind: "link", href: "/admin/birthprints/calc", label: "Calculator" },

  { kind: "group", label: "Engines" },
  { kind: "link", href: "/admin/engines/1", label: "Engine 1 · Passive" },
  { kind: "link", href: "/admin/engines/2", label: "Engine 2 · Personal" },
  { kind: "link", href: "/admin/engines/3", label: "Engine 3 · Business" },
  { kind: "link", href: "/admin/engines/4", label: "Engine 4 · Bond" },
  {
    kind: "link",
    href: "/admin/engines/5",
    label: "Engine 5 · Subscription",
  },
  { kind: "link", href: "/admin/engines/6", label: "Engine 6 · Timing" },
  { kind: "link", href: "/admin/engines/7", label: "Engine 7 · Journey" },

  { kind: "group", label: "Content" },
  {
    kind: "link",
    href: "/admin/daily-frequency",
    label: "Daily Frequency",
  },
  {
    kind: "link",
    href: "/admin/content-intelligence",
    label: "Content Intelligence",
  },

  { kind: "group", label: "Admin" },
  { kind: "link", href: "/admin/settings", label: "Settings" },
  { kind: "link", href: "/admin/audit", label: "Audit Log" },
  { kind: "link", href: "/admin/sop", label: "SOP Reference" },
  { kind: "link", href: "/admin/files", label: "Files" },

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
