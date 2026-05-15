"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Orbit } from "@/components/Orbit";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export type ProductInput = {
  slug: string;
  name: string;
  engine: number | null;
  pricePence: number;
  sectionCount: number;
  slaDays: number;
  description: string;
  isActive: boolean;
};

export type ProductCard = {
  slug: string;
  name: string;
  engine: number | null;
  pricePence: number | null;
  sectionCount: number;
  slaDays: number;
  isActive: boolean;
  stripeProductId: string | null;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const ENGINE_SUITS: Record<number, "hearts" | "diamonds" | "clubs" | "spades"> = {
  1: "diamonds",
  2: "hearts",
  3: "clubs",
  4: "spades",
  5: "diamonds",
  6: "hearts",
  7: "spades",
};

const ENGINE_LABELS: Record<number, string> = {
  1: "Engine 1 · Passive",
  2: "Engine 2 · Personal",
  3: "Engine 3 · Business",
  4: "Engine 4 · Bond",
  5: "Engine 5 · Subscription",
  6: "Engine 6 · Timing",
  7: "Engine 7 · Journey",
};

function formatPrice(pence: number | null): string {
  if (pence === null) return "—";
  return `£${(pence / 100).toFixed(0)}`;
}

export function ProductsBoard({
  products,
  isSeeded,
  createProduct,
  updateProduct,
  deleteProduct,
}: {
  products: ProductCard[];
  isSeeded: boolean;
  createProduct: (
    input: ProductInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProduct: (
    slug: string,
    input: ProductInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteProduct: (
    slug: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [engineFilter, setEngineFilter] = useState<number | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (engineFilter === "all") return products;
    return products.filter((p) => (p.engine ?? 0) === engineFilter);
  }, [products, engineFilter]);

  const grouped = useMemo(() => {
    const map = new Map<number, ProductCard[]>();
    for (const p of filtered) {
      const eng = typeof p.engine === "number" ? p.engine : 0;
      const arr = map.get(eng) ?? [];
      arr.push(p);
      map.set(eng, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={EYEBROW}>Products</p>
          <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
            The 29 products.
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-magenta text-cream text-xs uppercase tracking-[0.2em] rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          + Add Product
        </button>
      </div>

      {!isSeeded ? (
        <div
          className="rounded-xl"
          style={{
            backgroundColor: "rgba(201,169,110,0.08)",
            border: "1px solid rgba(201,169,110,0.35)",
            padding: "14px 18px",
            fontFamily: "var(--font-sans)",
          }}
        >
          <p
            className="font-sans uppercase tracking-[0.35em] text-gold font-semibold"
            style={{ fontSize: "10.5px" }}
          >
            Heads up
          </p>
          <p
            className="text-cream/80 mt-1.5"
            style={{ fontSize: "14px", lineHeight: 1.55 }}
          >
            Products table is empty. These are the canon products. Seed your
            database to make them live.
          </p>
        </div>
      ) : null}

      {/* Engine filters */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="All Engines"
          active={engineFilter === "all"}
          onClick={() => setEngineFilter("all")}
        />
        {[1, 2, 3, 4, 5, 6, 7].map((e) => (
          <FilterPill
            key={e}
            label={`Engine ${e}`}
            active={engineFilter === e}
            onClick={() => setEngineFilter(e)}
          />
        ))}
      </div>

      {/* Grouped grid */}
      {grouped.length === 0 ? (
        <p
          className="text-cream/40 italic py-6 text-center"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Nothing in this engine yet.
        </p>
      ) : null}

      <div className="flex flex-col gap-8">
        {grouped.map(([engine, items]) => (
          <section key={engine}>
            <p className={EYEBROW}>
              {ENGINE_LABELS[engine] ?? `Engine ${engine}`}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <ProductCardView
                  key={p.slug}
                  product={p}
                  onEdit={() => setEditingSlug(p.slug)}
                  onDelete={() => setDeletingSlug(p.slug)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {addOpen ? (
        <ProductFormModal
          mode="add"
          initial={null}
          onCancel={() => setAddOpen(false)}
          onSave={async (input) => {
            const res = await createProduct(input);
            if (res.ok) setAddOpen(false);
            return res;
          }}
        />
      ) : null}

      {(() => {
        const editing = editingSlug
          ? products.find((p) => p.slug === editingSlug) ?? null
          : null;
        if (!editing) return null;
        return (
          <ProductFormModal
            mode="edit"
            initial={editing}
            onCancel={() => setEditingSlug(null)}
            onSave={async (input) => {
              const res = await updateProduct(editing.slug, input);
              if (res.ok) setEditingSlug(null);
              return res;
            }}
          />
        );
      })()}

      {(() => {
        const deleting = deletingSlug
          ? products.find((p) => p.slug === deletingSlug) ?? null
          : null;
        if (!deleting) return null;
        return (
          <ConfirmModal
            title="Delete product"
            body={`Are you sure you want to delete ${deleting.name}? This cannot be undone.`}
            confirmLabel="Delete"
            onCancel={() => setDeletingSlug(null)}
            onConfirm={async () => {
              await deleteProduct(deleting.slug);
              setDeletingSlug(null);
            }}
          />
        );
      })()}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
        active
          ? "bg-magenta text-cream hover:bg-magenta-bright"
          : "text-gold border border-gold/40 hover:bg-gold/10"
      }`}
      style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
    >
      {label}
    </button>
  );
}

function ProductCardView({
  product: p,
  onEdit,
  onDelete,
}: {
  product: ProductCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const suit = p.engine ? ENGINE_SUITS[p.engine] : "hearts";
  return (
    <div
      className="bg-[#151B33] rounded-2xl flex flex-col gap-3 relative"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "20px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="absolute right-4 top-4">
        <Orbit size={52} suit={suit} compact showCardinals={false} />
      </div>
      <div style={{ paddingRight: "60px" }}>
        <h3
          className="serif-it text-magenta"
          style={{ fontSize: "20px", lineHeight: 1.2 }}
        >
          {p.name}
        </h3>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-gold"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          {formatPrice(p.pricePence)}
        </span>
        <span
          className="text-white/45"
          style={{ fontSize: "12px" }}
        >
          {p.sectionCount} sections · {p.slaDays} day SLA
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {p.isActive ? (
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 uppercase tracking-[0.18em]"
            style={{
              backgroundColor: "rgba(45,155,110,0.15)",
              color: "#2D9B6E",
              fontSize: "10px",
              fontWeight: 500,
            }}
          >
            Active
          </span>
        ) : (
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 uppercase tracking-[0.18em]"
            style={{
              backgroundColor: "rgba(201,169,110,0.15)",
              color: "#C9A96E",
              fontSize: "10px",
              fontWeight: 500,
            }}
          >
            Inactive
          </span>
        )}
        {p.stripeProductId ? (
          <span
            className="text-gold/70 truncate"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "10px",
              maxWidth: "120px",
            }}
            title={p.stripeProductId}
          >
            {p.stripeProductId}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={onEdit}
          className="text-gold border border-gold/40 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-rose border border-rose/40 rounded-full px-3 py-1 hover:bg-rose/10 transition-colors uppercase tracking-[0.18em]"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Delete
        </button>
        <Link
          href="/shop"
          className="text-magenta border border-magenta/40 rounded-full px-3 py-1 hover:bg-magenta/10 transition-colors uppercase tracking-[0.18em]"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          View on Shop
        </Link>
      </div>
    </div>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function ProductFormModal({
  mode,
  initial,
  onCancel,
  onSave,
}: {
  mode: "add" | "edit";
  initial: ProductCard | null;
  onCancel: () => void;
  onSave: (
    input: ProductInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [engine, setEngine] = useState<number | "">(initial?.engine ?? "");
  const [priceGbp, setPriceGbp] = useState(
    initial?.pricePence !== null && initial?.pricePence !== undefined
      ? (initial.pricePence / 100).toFixed(2)
      : "0",
  );
  const [sectionCount, setSectionCount] = useState(
    initial?.sectionCount !== undefined ? `${initial.sectionCount}` : "8",
  );
  const [slaDays, setSlaDays] = useState(
    initial?.slaDays !== undefined ? `${initial.slaDays}` : "14",
  );
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    const priceParsed = Number.parseFloat(priceGbp);
    if (!Number.isFinite(priceParsed) || priceParsed < 0) {
      setError("Price must be a non-negative number.");
      return;
    }
    const sectionsParsed = Number.parseInt(sectionCount, 10);
    if (!Number.isFinite(sectionsParsed) || sectionsParsed < 0) {
      setError("Section count must be 0 or greater.");
      return;
    }
    const slaParsed = Number.parseInt(slaDays, 10);
    if (!Number.isFinite(slaParsed) || slaParsed < 0) {
      setError("SLA must be 0 or greater.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onSave({
        slug: slugify(slug),
        name: name.trim(),
        engine: engine === "" ? null : Number(engine),
        pricePence: Math.round(priceParsed * 100),
        sectionCount: sectionsParsed,
        slaDays: slaParsed,
        description: description.trim(),
        isActive,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#151B33] rounded-2xl w-full max-w-lg flex flex-col gap-4 overflow-y-auto"
        style={{
          padding: "28px",
          border: "1px solid rgba(201,169,110,0.25)",
          fontFamily: "var(--font-sans)",
          maxHeight: "90vh",
        }}
      >
        <p className={EYEBROW}>
          {mode === "add" ? "Add Product" : `Edit · ${initial?.name ?? ""}`}
        </p>

        <FormField label="Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{ fontSize: "16px" }}
          />
        </FormField>

        <FormField label="Slug" required>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            required
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
            style={{
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              fontSize: "14px",
            }}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Engine">
            <select
              value={engine === "" ? "" : `${engine}`}
              onChange={(e) =>
                setEngine(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px" }}
            >
              <option value="">No engine</option>
              {[1, 2, 3, 4, 5, 6, 7].map((e) => (
                <option key={e} value={e}>
                  Engine {e}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Price (£)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceGbp}
              onChange={(e) => setPriceGbp(e.target.value)}
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px" }}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Section count">
            <input
              type="number"
              min="0"
              value={sectionCount}
              onChange={(e) => setSectionCount(e.target.value)}
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px" }}
            />
          </FormField>
          <FormField label="SLA days">
            <input
              type="number"
              min="0"
              value={slaDays}
              onChange={(e) => setSlaDays(e.target.value)}
              className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60"
              style={{ fontSize: "16px" }}
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#0D1220] border border-[rgba(201,169,110,0.25)] rounded-lg px-3 py-2 text-cream outline-none focus:border-gold/60 resize-y"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          />
        </FormField>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-magenta"
          />
          <span
            className="text-cream"
            style={{ fontSize: "13px" }}
          >
            Active
          </span>
        </label>

        {error ? (
          <p
            className="text-magenta"
            style={{ fontSize: "13px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 mt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className={`bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] ${
              pending ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending
              ? "Saving..."
              : mode === "add"
                ? "Create Product"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-gold uppercase tracking-[0.2em] mb-1.5"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        {label}
        {required ? <span className="text-magenta ml-1">*</span> : null}
      </label>
      {children}
    </div>
  );
}
