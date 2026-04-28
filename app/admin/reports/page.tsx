import { Outfit } from "next/font/google";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

const outfit = Outfit({ subsets: ["latin"] });

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const REPORT_STATUSES = ["draft", "in_review", "delivered"] as const;
type ReportStatus = (typeof REPORT_STATUSES)[number];

const STATUS_PILL_CLASSES: Record<ReportStatus, string> = {
  draft: "border border-gold text-gold",
  in_review: "border border-magenta text-magenta",
  delivered: "border border-emerald text-emerald",
};

type ReportRow = {
  id: string;
  product_slug: string;
  status: ReportStatus;
  created_at: string;
  clients: { full_name: string } | null;
};

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminReportsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const statusFilter = (REPORT_STATUSES as readonly string[]).includes(
    status ?? "",
  )
    ? (status as ReportStatus)
    : null;

  let query = supabaseAdmin
    .from("reports")
    .select("id, product_slug, status, created_at, clients(full_name)")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: reports } = await query.returns<ReportRow[]>();

  const selectedPill =
    "bg-magenta text-bg rounded-full px-4 py-1.5 text-xs font-semibold inline-block";
  const unselectedPill =
    "border border-magenta text-magenta rounded-full px-4 py-1.5 text-xs font-semibold inline-block";

  const filters: { label: string; value: ReportStatus | null; href: string }[] = [
    { label: "All", value: null, href: "/admin/reports" },
    { label: "Draft", value: "draft", href: "/admin/reports?status=draft" },
    { label: "In Review", value: "in_review", href: "/admin/reports?status=in_review" },
    { label: "Delivered", value: "delivered", href: "/admin/reports?status=delivered" },
  ];

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-bg text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <h1 className="text-magenta text-4xl font-semibold mb-6">Reports</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className={statusFilter === f.value ? selectedPill : unselectedPill}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {!reports || reports.length === 0 ? (
          <p className="text-gold text-lg">No reports yet</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="bg-navy border border-gold rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  <span className="text-white font-semibold">
                    {report.clients?.full_name ?? "Unknown client"}
                  </span>
                  <span className="text-gold text-sm">
                    {report.product_slug}
                  </span>
                  <span
                    className={`${STATUS_PILL_CLASSES[report.status]} rounded-full px-2 py-0.5 text-xs uppercase tracking-wide`}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                  <span className="text-gold text-sm">
                    {formatCreatedAt(report.created_at)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="border border-gold text-gold rounded-full px-3 py-1 text-xs inline-block"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
