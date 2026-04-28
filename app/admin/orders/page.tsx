import { Outfit } from "next/font/google";
import Link from "next/link";
import { revalidatePath } from "next/cache";
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

const ORDER_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_PILL_CLASSES: Record<OrderStatus, string> = {
  pending: "border border-gold text-gold",
  paid: "border border-emerald text-emerald",
  failed: "border border-red-500 text-red-500",
  refunded: "border border-gray-500 text-gray-500",
};

type OrderRow = {
  id: string;
  product_name: string;
  amount_pence: number;
  status: OrderStatus;
  engine: number | null;
  created_at: string;
};

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

async function deleteOrder(id: string) {
  "use server";

  await supabaseAdmin.from("orders").delete().eq("id", id);
  revalidatePath("/admin/orders");
}

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const statusFilter = (ORDER_STATUSES as readonly string[]).includes(
    status ?? "",
  )
    ? (status as OrderStatus)
    : null;

  let query = supabaseAdmin
    .from("orders")
    .select("id, product_name, amount_pence, status, engine, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: orders } = await query.returns<OrderRow[]>();

  const selectedPill =
    "bg-magenta text-bg rounded-full px-4 py-1.5 text-xs font-semibold inline-block";
  const unselectedPill =
    "border border-magenta text-magenta rounded-full px-4 py-1.5 text-xs font-semibold inline-block";

  const filters: { label: string; value: OrderStatus | null; href: string }[] = [
    { label: "All", value: null, href: "/admin/orders" },
    { label: "Pending", value: "pending", href: "/admin/orders?status=pending" },
    { label: "Paid", value: "paid", href: "/admin/orders?status=paid" },
    { label: "Failed", value: "failed", href: "/admin/orders?status=failed" },
    { label: "Refunded", value: "refunded", href: "/admin/orders?status=refunded" },
  ];

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-transparent text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <h1 className="text-magenta text-4xl font-semibold mb-6">Orders</h1>

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

        {!orders || orders.length === 0 ? (
          <p className="text-gold text-lg">No orders yet</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-navy border border-gold rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  <span className="text-white font-semibold">
                    {order.product_name}
                  </span>
                  {order.engine !== null ? (
                    <span className="border border-gold text-gold rounded-full px-2 py-0.5 text-xs">
                      E{order.engine}
                    </span>
                  ) : null}
                  <span className="text-gold text-sm">
                    {formatPrice(order.amount_pence)}
                  </span>
                  <span
                    className={`${STATUS_PILL_CLASSES[order.status]} rounded-full px-2 py-0.5 text-xs uppercase tracking-wide`}
                  >
                    {order.status}
                  </span>
                  <span className="text-gold text-sm">
                    {formatCreatedAt(order.created_at)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <form action={deleteOrder.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="border border-red-500 text-red-500 rounded-full px-3 py-1 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
