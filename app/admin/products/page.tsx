import { Outfit } from "next/font/google";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const outfit = Outfit({ subsets: ["latin"] });

type ProductRow = {
  id: string;
  name: string;
  engine: number;
  price_pence: number;
  requires_time_of_birth: boolean;
  is_active: boolean;
};

function formatPrice(pence: number) {
  if (pence === 0) return "Free";
  return `£${(pence / 100).toFixed(2)}`;
}

async function deactivateProduct(id: string) {
  "use server";

  await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  revalidatePath("/admin/products");
}

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const activeOnly = filter !== "all";

  let query = supabaseAdmin
    .from("products")
    .select("id, name, engine, price_pence, requires_time_of_birth, is_active")
    .order("engine", { ascending: true })
    .order("price_pence", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data: products } = await query.returns<ProductRow[]>();

  const productsByEngine = new Map<number, ProductRow[]>();
  for (const product of products ?? []) {
    const list = productsByEngine.get(product.engine) ?? [];
    list.push(product);
    productsByEngine.set(product.engine, list);
  }
  const engines = Array.from(productsByEngine.keys()).sort((a, b) => a - b);

  const selectedPill =
    "bg-magenta text-bg rounded-full px-4 py-1.5 text-xs font-semibold inline-block";
  const unselectedPill =
    "border border-magenta text-magenta rounded-full px-4 py-1.5 text-xs font-semibold inline-block";

  return (
    <div
      className={`${outfit.className} flex flex-1 flex-col items-center bg-transparent text-gold px-6 py-16`}
    >
      <div className="w-full max-w-3xl">
        <h1 className="text-magenta text-4xl font-semibold mb-6">Products</h1>

        <div className="flex gap-2 mb-8">
          <Link
            href="/admin/products"
            className={activeOnly ? selectedPill : unselectedPill}
          >
            Active
          </Link>
          <Link
            href="/admin/products?filter=all"
            className={!activeOnly ? selectedPill : unselectedPill}
          >
            All
          </Link>
        </div>

        {engines.length === 0 ? (
          <p className="text-gold text-lg">No products yet</p>
        ) : (
          engines.map((engine) => (
            <section key={engine} className="mb-10">
              <h2 className="text-magenta text-2xl font-semibold mb-3">
                Engine {engine}
              </h2>
              <ul className="flex flex-col gap-3">
                {productsByEngine.get(engine)!.map((product) => (
                  <li
                    key={product.id}
                    className="bg-navy border border-gold rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                      <span className="text-white font-semibold">
                        {product.name}
                      </span>
                      <span className="border border-gold text-gold rounded-full px-2 py-0.5 text-xs">
                        E{product.engine}
                      </span>
                      <span className="text-gold text-sm">
                        {formatPrice(product.price_pence)}
                      </span>
                      {product.requires_time_of_birth ? (
                        <span
                          className="bg-emerald w-2 h-2 rounded-full inline-block"
                          title="Requires time of birth"
                        />
                      ) : null}
                      <span
                        className={`text-xs uppercase tracking-wide ${
                          product.is_active ? "text-emerald" : "text-red-500"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="border border-gold text-gold rounded-full px-3 py-1 text-xs inline-block"
                      >
                        Edit
                      </Link>
                      {product.is_active ? (
                        <form
                          action={deactivateProduct.bind(null, product.id)}
                        >
                          <button
                            type="submit"
                            className="border border-red-500 text-red-500 rounded-full px-3 py-1 text-xs cursor-pointer"
                          >
                            Deactivate
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
