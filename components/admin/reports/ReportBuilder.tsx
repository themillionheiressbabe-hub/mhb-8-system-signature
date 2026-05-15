"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

export type ClientOption = {
  id: string;
  mhbNumber: string;
  fullName: string;
  dateOfBirth: string;
  birthCardName: string | null;
  personalYear: number;
};

export type ProductOption = {
  slug: string;
  name: string;
  engine: number | null;
  sectionCount: number;
  slaDays: number;
};

type LensKey =
  | ""
  | "tropical_astrology"
  | "sidereal_astrology"
  | "destiny_cards"
  | "name_frequency"
  | "numerology"
  | "chinese_zodiac"
  | "chakras"
  | "medicine_wheel";

const LENS_OPTIONS: { value: LensKey; label: string }[] = [
  { value: "tropical_astrology", label: "Tropical Astrology" },
  { value: "sidereal_astrology", label: "Sidereal Astrology" },
  { value: "destiny_cards", label: "Destiny Cards" },
  { value: "name_frequency", label: "Name Frequency" },
  { value: "numerology", label: "Numerology" },
  { value: "chinese_zodiac", label: "Chinese Zodiac" },
  { value: "chakras", label: "Chakras" },
  { value: "medicine_wheel", label: "Medicine Wheel" },
];

type NlpFlags = {
  pacing: boolean;
  validation: boolean;
  reframing: boolean;
  pattern_interrupt: boolean;
  future_pacing: boolean;
  anchoring: boolean;
  implementation_intention: boolean;
  embedded_commands: boolean;
};

const NLP_KEYS: { key: keyof NlpFlags; label: string }[] = [
  { key: "pacing", label: "Pacing" },
  { key: "validation", label: "Validation" },
  { key: "reframing", label: "Reframing" },
  { key: "pattern_interrupt", label: "Pattern Interrupt" },
  { key: "future_pacing", label: "Future Pacing" },
  { key: "anchoring", label: "Anchoring" },
  { key: "implementation_intention", label: "Implementation Intention" },
  { key: "embedded_commands", label: "Embedded Commands" },
];

function emptyNlp(): NlpFlags {
  return {
    pacing: false,
    validation: false,
    reframing: false,
    pattern_interrupt: false,
    future_pacing: false,
    anchoring: false,
    implementation_intention: false,
    embedded_commands: false,
  };
}

type Receipt = { lens: LensKey; finding: string };

type SectionState = {
  title: string;
  lockedIn: string;
  checkedOut: string;
  receipts: Receipt[];
  body: string;
  goldQuote: string;
  nlp: NlpFlags;
  complete: boolean;
};

type DraftPayload = {
  clientId: string;
  productSlug: string;
  orderId: string | null;
  sections: SectionState[];
  updatedAt: string;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const TEXTAREA_BASE =
  "w-full bg-[#151B33] rounded-lg outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]";

const TEXTAREA_STYLE: React.CSSProperties = {
  border: "1px solid rgba(201,169,110,0.3)",
  padding: "14px",
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  color: "#F4F1ED",
  lineHeight: 1.55,
};

const INPUT_STYLE: React.CSSProperties = {
  ...TEXTAREA_STYLE,
  padding: "12px 14px",
};

const BABE_SIGNATURE_TITLES = [
  "Identity",
  "Power Pattern",
  "Shadow Pattern",
  "Voice and Worth",
  "Love and Connection",
  "Work and Purpose",
  "Money and Value",
  "Body and Safety",
  "Creative Current",
  "Insight and Clarity",
  "Boundaries and Capacity",
  "Inherited Patterns",
  "Relationship to Authority",
  "The Wound and the Gift",
  "Current Activation",
  "What is Ending",
  "What is Beginning",
  "The 90-Day Window",
  "Integration Practice",
  "Your Pattern in One Page",
  "Compliance and Close",
  "Personalised Affirmations",
];

function sectionTitlesFor(product: ProductOption): string[] {
  if (product.slug === "babe-signature" || product.sectionCount === 22) {
    return BABE_SIGNATURE_TITLES.slice(0, product.sectionCount);
  }
  return Array.from(
    { length: product.sectionCount },
    (_, i) => `Section ${i + 1}`,
  );
}

function buildEmptySections(product: ProductOption): SectionState[] {
  const titles = sectionTitlesFor(product);
  return titles.map((title) => ({
    title,
    lockedIn: "",
    checkedOut: "",
    receipts: [
      { lens: "", finding: "" },
      { lens: "", finding: "" },
      { lens: "", finding: "" },
    ],
    body: "",
    goldQuote: "",
    nlp: emptyNlp(),
    complete: false,
  }));
}

function draftStorageKey(clientId: string, productSlug: string): string {
  return `report_draft_${clientId}_${productSlug}`;
}

function isReceiptFilled(r: Receipt): boolean {
  return r.lens !== "" && r.finding.trim().length > 0;
}

function sectionValid(s: SectionState): boolean {
  if (!s.lockedIn.trim() || !s.checkedOut.trim() || !s.body.trim())
    return false;
  return s.receipts.filter(isReceiptFilled).length >= 3;
}

function formatDob(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportBuilder({
  clients,
  products,
  preselectedClientId,
  preselectedOrderId,
  saveDraft,
  sendToReview,
}: {
  clients: ClientOption[];
  products: ProductOption[];
  preselectedClientId: string | null;
  preselectedOrderId: string | null;
  saveDraft: (
    clientId: string,
    orderId: string | null,
    productSlug: string,
    sections: SectionState[],
  ) => Promise<
    { ok: true; reportId: string } | { ok: false; error: string }
  >;
  sendToReview: (
    reportId: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [clientId, setClientId] = useState<string>(
    preselectedClientId ?? "",
  );
  const [productSlug, setProductSlug] = useState<string>("");
  const [orderId] = useState<string | null>(preselectedOrderId);

  const [stepTwo, setStepTwo] = useState(false);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [restorePrompt, setRestorePrompt] = useState<{
    when: string;
  } | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDraft, startDraftSave] = useTransition();
  const [pendingSend, startSend] = useTransition();
  const autosaveTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId],
  );
  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === productSlug) ?? null,
    [products, productSlug],
  );

  // Group products by engine
  const productsByEngine = useMemo(() => {
    const map = new Map<number, ProductOption[]>();
    for (const p of products) {
      const eng = typeof p.engine === "number" ? p.engine : -1;
      const arr = map.get(eng) ?? [];
      arr.push(p);
      map.set(eng, arr);
    }
    return map;
  }, [products]);
  const engineKeysOrdered = useMemo(
    () =>
      Array.from(productsByEngine.keys()).sort(
        (a, b) => (a < 0 ? 99 : a) - (b < 0 ? 99 : b),
      ),
    [productsByEngine],
  );

  // On entering step two: check for existing draft in localStorage
  useEffect(() => {
    if (!stepTwo || !selectedClient || !selectedProduct) return;
    const key = draftStorageKey(selectedClient.id, selectedProduct.slug);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw) as DraftPayload;
        if (
          draft.clientId === selectedClient.id &&
          draft.productSlug === selectedProduct.slug
        ) {
          setRestorePrompt({ when: draft.updatedAt });
          setSections(buildEmptySections(selectedProduct));
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    setSections(buildEmptySections(selectedProduct));
  }, [stepTwo, selectedClient, selectedProduct]);

  // Autosave: every 30s persist current sections to localStorage
  useEffect(() => {
    if (!stepTwo || !selectedClient || !selectedProduct) return;
    if (autosaveTimerRef.current !== null)
      window.clearInterval(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setInterval(() => {
      persistDraftLocal();
    }, 30_000);
    return () => {
      if (autosaveTimerRef.current !== null)
        window.clearInterval(autosaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepTwo, selectedClient, selectedProduct, sections]);

  function persistDraftLocal() {
    if (!selectedClient || !selectedProduct) return;
    const payload: DraftPayload = {
      clientId: selectedClient.id,
      productSlug: selectedProduct.slug,
      orderId,
      sections,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(
        draftStorageKey(selectedClient.id, selectedProduct.slug),
        JSON.stringify(payload),
      );
    } catch {
      // ignore quota errors
    }
    setSavedFlash(true);
    if (flashTimerRef.current !== null)
      window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => {
      setSavedFlash(false);
    }, 2000);
  }

  function restoreDraft() {
    if (!selectedClient || !selectedProduct) return;
    const key = draftStorageKey(selectedClient.id, selectedProduct.slug);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw) as DraftPayload;
        if (Array.isArray(draft.sections) && draft.sections.length > 0) {
          setSections(draft.sections);
        }
      }
    } catch {
      // ignore parse errors
    }
    setRestorePrompt(null);
  }

  function discardDraft() {
    if (!selectedClient || !selectedProduct) return;
    try {
      window.localStorage.removeItem(
        draftStorageKey(selectedClient.id, selectedProduct.slug),
      );
    } catch {
      // ignore
    }
    setRestorePrompt(null);
  }

  function updateActive(patch: Partial<SectionState>) {
    setSections((prev) =>
      prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)),
    );
  }

  function updateReceipt(idx: number, patch: Partial<Receipt>) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== activeIdx) return s;
        return {
          ...s,
          receipts: s.receipts.map((r, j) =>
            j === idx ? { ...r, ...patch } : r,
          ),
        };
      }),
    );
  }

  function addReceipt() {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== activeIdx) return s;
        if (s.receipts.length >= 8) return s;
        return {
          ...s,
          receipts: [...s.receipts, { lens: "", finding: "" }],
        };
      }),
    );
  }

  function removeReceipt(idx: number) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== activeIdx) return s;
        if (s.receipts.length <= 3) return s;
        return {
          ...s,
          receipts: s.receipts.filter((_, j) => j !== idx),
        };
      }),
    );
  }

  function markComplete() {
    const s = sections[activeIdx];
    if (!sectionValid(s)) {
      setError(
        "Section needs at least 3 receipts plus Locked In, Checked Out, and body text.",
      );
      return;
    }
    setError(null);
    setSections((prev) =>
      prev.map((sec, i) =>
        i === activeIdx ? { ...sec, complete: true } : sec,
      ),
    );
    // Advance to the next incomplete section
    const next = sections.findIndex((sec, i) => i !== activeIdx && !sec.complete);
    if (next >= 0) setActiveIdx(next);
    persistDraftLocal();
  }

  function handleSaveDraft() {
    if (!selectedClient || !selectedProduct) return;
    persistDraftLocal();
    startDraftSave(async () => {
      const result = await saveDraft(
        selectedClient.id,
        orderId,
        selectedProduct.slug,
        sections,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReportId(result.reportId);
      setError(null);
    });
  }

  function handleSendToReview() {
    if (!selectedClient || !selectedProduct) return;
    startSend(async () => {
      // Ensure a draft row exists before flipping status
      let rid = reportId;
      if (!rid) {
        const saved = await saveDraft(
          selectedClient.id,
          orderId,
          selectedProduct.slug,
          sections,
        );
        if (!saved.ok) {
          setError(saved.error);
          return;
        }
        rid = saved.reportId;
        setReportId(rid);
      }
      const result = await sendToReview(rid);
      if (!result.ok) setError(result.error);
      else setError(null);
    });
  }

  const completeCount = sections.filter((s) => s.complete).length;
  const totalSections = sections.length;
  const progressPct =
    totalSections > 0 ? Math.round((completeCount / totalSections) * 100) : 0;

  if (!stepTwo) {
    return (
      <Step1
        clients={clients}
        productsByEngine={productsByEngine}
        engineKeysOrdered={engineKeysOrdered}
        clientId={clientId}
        setClientId={setClientId}
        productSlug={productSlug}
        setProductSlug={setProductSlug}
        orderId={orderId}
        selectedClient={selectedClient}
        selectedProduct={selectedProduct}
        onStart={() => {
          if (!clientId || !productSlug) {
            setError("Pick a client and a product before continuing.");
            return;
          }
          setError(null);
          setStepTwo(true);
        }}
        error={error}
      />
    );
  }

  const active = sections[activeIdx];
  if (!active) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      {/* Left: section navigator */}
      <aside
        className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl flex flex-col gap-4 lg:sticky"
        style={{
          padding: "20px",
          top: "16px",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className={EYEBROW}>Sections</p>
        <ol className="flex flex-col gap-1.5">
          {sections.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center gap-2.5"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(181,30,90,0.10)"
                      : "transparent",
                    borderLeft: isActive
                      ? "3px solid #B51E5A"
                      : "3px solid transparent",
                  }}
                >
                  <StatusGlyph complete={s.complete} />
                  <span
                    className="text-gold"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-cream truncate"
                    style={{
                      fontSize: "14px",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col gap-2 pt-2 border-t border-gold/10">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: 6,
              border: "1px solid rgba(201,169,110,0.4)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
            aria-label={`Progress ${progressPct}%`}
          >
            <div
              className="h-full bg-magenta transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p
            className="text-white/50"
            style={{ fontSize: "12px" }}
          >
            {completeCount} of {totalSections} sections complete.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-gold/10">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={pendingDraft}
            className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {pendingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handleSendToReview}
            disabled={pendingSend}
            className={`bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em] ${
              pendingSend ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {pendingSend ? "Sending..." : "Send to Review"}
          </button>
          {!orderId ? (
            <p
              className="text-cream/40"
              style={{ fontSize: "11px", lineHeight: 1.4 }}
            >
              An order id is required to save to the reports table. Drafts
              still write to local storage every 30 seconds.
            </p>
          ) : null}
        </div>
      </aside>

      {/* Right: section editor */}
      <section className="flex flex-col gap-5">
        {restorePrompt ? (
          <div
            className="rounded-xl flex items-center justify-between gap-4 flex-wrap"
            style={{
              backgroundColor: "rgba(201,169,110,0.08)",
              border: "1px solid rgba(201,169,110,0.35)",
              padding: "14px 18px",
              fontFamily: "var(--font-sans)",
            }}
          >
            <p
              className="text-gold"
              style={{ fontSize: "13px" }}
            >
              Draft found from {formatDate(restorePrompt.when)}. Restore?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="bg-magenta text-cream rounded-full px-4 py-1.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Restore
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Start fresh
              </button>
            </div>
          </div>
        ) : null}

        <SectionEditor
          number={activeIdx + 1}
          totalSections={totalSections}
          productName={selectedProduct?.name ?? ""}
          section={active}
          onUpdate={updateActive}
          onUpdateReceipt={updateReceipt}
          onAddReceipt={addReceipt}
          onRemoveReceipt={removeReceipt}
          onMarkComplete={markComplete}
          onAutosave={persistDraftLocal}
        />

        {error ? (
          <p
            className="text-magenta"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p
            className="text-white/45"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              lineHeight: 1.5,
              maxWidth: "640px",
            }}
          >
            Report must include the compliance statement on final section:
            If your lived experience disagrees with anything in this
            document, trust your lived experience.
          </p>
          <span
            className={`text-gold transition-opacity duration-500 ${
              savedFlash ? "opacity-60" : "opacity-0"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
            aria-live="polite"
          >
            Draft saved
          </span>
        </div>
      </section>
    </div>
  );
}

function StatusGlyph({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          backgroundColor: "rgba(45,155,110,0.18)",
          border: "1px solid #2D9B6E",
          color: "#2D9B6E",
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ✓
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        border: "1px solid rgba(201,169,110,0.5)",
      }}
    />
  );
}

function Step1({
  clients,
  productsByEngine,
  engineKeysOrdered,
  clientId,
  setClientId,
  productSlug,
  setProductSlug,
  orderId,
  selectedClient,
  selectedProduct,
  onStart,
  error,
}: {
  clients: ClientOption[];
  productsByEngine: Map<number, ProductOption[]>;
  engineKeysOrdered: number[];
  clientId: string;
  setClientId: (id: string) => void;
  productSlug: string;
  setProductSlug: (slug: string) => void;
  orderId: string | null;
  selectedClient: ClientOption | null;
  selectedProduct: ProductOption | null;
  onStart: () => void;
  error: string | null;
}) {
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients.slice(0, 10);
    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.mhbNumber.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [search, clients]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <section
        className="bg-[#151B33] rounded-2xl p-7 flex flex-col gap-5"
        style={{
          border: "1px solid rgba(201,169,110,0.15)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div>
          <p className={EYEBROW}>Step 1 · Client</p>
          {selectedClient ? (
            <div className="mt-3 bg-[#1A2140] border border-[rgba(201,169,110,0.15)] rounded-xl p-4 flex flex-col gap-1.5">
              <span
                className="text-gold"
                style={{
                  fontFamily:
                    "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                }}
              >
                {selectedClient.mhbNumber}
              </span>
              <p
                className="text-cream"
                style={{ fontSize: "16px", fontWeight: 500 }}
              >
                {selectedClient.fullName}
              </p>
              <div
                className="flex flex-wrap gap-x-3 gap-y-1 text-cream/70"
                style={{ fontSize: "13px" }}
              >
                <span>DOB {formatDob(selectedClient.dateOfBirth)}</span>
                {selectedClient.birthCardName ? (
                  <span>· {selectedClient.birthCardName}</span>
                ) : null}
                <span>· Personal Year {selectedClient.personalYear}</span>
              </div>
              <button
                type="button"
                onClick={() => setClientId("")}
                className="text-cream/50 hover:text-cream mt-2 self-start uppercase tracking-[0.2em]"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Change client
              </button>
            </div>
          ) : (
            <div className="mt-3 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpenSearch(true);
                }}
                onFocus={() => setOpenSearch(true)}
                onBlur={() =>
                  window.setTimeout(() => setOpenSearch(false), 120)
                }
                placeholder="Search by name or MHB number..."
                className="w-full bg-[#0D1220] rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
                style={INPUT_STYLE}
              />
              {openSearch && matches.length > 0 ? (
                <ul
                  className="absolute left-0 right-0 top-full mt-1 bg-[#0D1220] border border-gold/30 rounded-lg z-20 max-h-60 overflow-y-auto"
                  style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.6)" }}
                >
                  {matches.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setClientId(c.id);
                          setSearch("");
                          setOpenSearch(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gold/10 flex items-center gap-3"
                      >
                        <span
                          className="text-gold"
                          style={{
                            fontFamily:
                              "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                            fontSize: "12px",
                          }}
                        >
                          {c.mhbNumber}
                        </span>
                        <span
                          className="text-cream"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "14px",
                          }}
                        >
                          {c.fullName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <p className={EYEBROW}>Step 1 · Product</p>
          <select
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="mt-3 w-full bg-[#0D1220] rounded-lg outline-none"
            style={INPUT_STYLE}
          >
            <option value="">Select a product</option>
            {engineKeysOrdered.map((engine) => {
              const label =
                engine >= 0 ? `Engine ${engine}` : "Unassigned";
              return (
                <optgroup key={engine} label={label}>
                  {(productsByEngine.get(engine) ?? []).map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          {selectedProduct ? (
            <div
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-cream/80"
              style={{ fontSize: "13px" }}
            >
              <span className="text-magenta" style={{ fontWeight: 500 }}>
                {selectedProduct.name}
              </span>
              {selectedProduct.engine ? (
                <span>· Engine {selectedProduct.engine}</span>
              ) : null}
              <span>· {selectedProduct.sectionCount} sections</span>
              <span>· {selectedProduct.slaDays} day SLA</span>
            </div>
          ) : null}
        </div>

        {orderId ? (
          <div>
            <p className={EYEBROW}>Order locked</p>
            <p
              className="text-gold mt-2"
              style={{
                fontFamily:
                  "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                fontSize: "13px",
              }}
            >
              {orderId.replace(/-/g, "").slice(-8).toUpperCase()}
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            className="text-magenta"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onStart}
            className="bg-magenta text-cream rounded-full px-6 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            Start Building
          </button>
        </div>
      </section>
    </div>
  );
}

function SectionEditor({
  number,
  totalSections,
  productName,
  section,
  onUpdate,
  onUpdateReceipt,
  onAddReceipt,
  onRemoveReceipt,
  onMarkComplete,
  onAutosave,
}: {
  number: number;
  totalSections: number;
  productName: string;
  section: SectionState;
  onUpdate: (patch: Partial<SectionState>) => void;
  onUpdateReceipt: (idx: number, patch: Partial<Receipt>) => void;
  onAddReceipt: () => void;
  onRemoveReceipt: (idx: number) => void;
  onMarkComplete: () => void;
  onAutosave: () => void;
}) {
  const [titleEditing, setTitleEditing] = useState(false);
  const [nlpOpen, setNlpOpen] = useState(false);

  return (
    <div
      className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl flex flex-col gap-5"
      style={{
        padding: "24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header */}
      <div>
        <p className={EYEBROW}>
          Section {String(number).padStart(2, "0")} of {totalSections}
          {productName ? ` · ${productName}` : ""}
        </p>
        {titleEditing ? (
          <input
            type="text"
            autoFocus
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onBlur={() => {
              setTitleEditing(false);
              onAutosave();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="mt-2 w-full bg-transparent rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
            style={{
              border: "1px solid rgba(201,169,110,0.3)",
              padding: "10px 14px",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "28px",
              color: "#F4F1ED",
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setTitleEditing(true)}
            className="mt-2 text-left hover:bg-gold/5 transition-colors rounded-lg px-2 -mx-2"
            title="Click to edit"
          >
            <h2
              className="serif-it text-white"
              style={{ fontSize: "28px", lineHeight: 1.15 }}
            >
              {section.title}
            </h2>
          </button>
        )}
      </div>

      {/* NLP sequence */}
      <div className="border-t border-gold/10 pt-4">
        <button
          type="button"
          onClick={() => setNlpOpen((p) => !p)}
          className="flex items-center justify-between w-full text-left"
        >
          <p className={EYEBROW}>NLP Sequence Check</p>
          <span
            className="text-gold"
            style={{
              fontSize: "12px",
              transform: nlpOpen ? "rotate(180deg)" : undefined,
              transition: "transform 200ms",
            }}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
        {nlpOpen ? (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NLP_KEYS.map((k) => (
              <label
                key={k.key}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={section.nlp[k.key]}
                  onChange={(e) =>
                    onUpdate({
                      nlp: { ...section.nlp, [k.key]: e.target.checked },
                    })
                  }
                  className="accent-magenta"
                />
                <span
                  className="text-cream/80"
                  style={{ fontSize: "13px" }}
                >
                  {k.label}
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {/* Locked In */}
      <div>
        <p
          className="font-sans uppercase tracking-[0.35em] text-emerald font-semibold"
          style={{ fontSize: "10.5px" }}
        >
          Locked In
        </p>
        <textarea
          value={section.lockedIn}
          onChange={(e) => onUpdate({ lockedIn: e.target.value })}
          onBlur={onAutosave}
          rows={4}
          className={TEXTAREA_BASE + " mt-2"}
          style={{ ...TEXTAREA_STYLE, minHeight: "120px" }}
          placeholder="Resourced state language for this section."
        />
      </div>

      {/* Checked Out */}
      <div>
        <p
          className="font-sans uppercase tracking-[0.35em] text-magenta font-semibold"
          style={{ fontSize: "10.5px" }}
        >
          Checked Out
        </p>
        <textarea
          value={section.checkedOut}
          onChange={(e) => onUpdate({ checkedOut: e.target.value })}
          onBlur={onAutosave}
          rows={4}
          className={TEXTAREA_BASE + " mt-2"}
          style={{ ...TEXTAREA_STYLE, minHeight: "120px" }}
          placeholder="Shadow state language for this section."
        />
      </div>

      {/* Receipts */}
      <div>
        <div className="flex items-center justify-between">
          <p className={EYEBROW}>The Receipts</p>
          <span
            className="text-white/45"
            style={{ fontSize: "11px" }}
          >
            {section.receipts.filter(isReceiptFilled).length} of{" "}
            {section.receipts.length} filled · minimum 3
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {section.receipts.map((r, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-2 items-start"
            >
              <select
                value={r.lens}
                onChange={(e) =>
                  onUpdateReceipt(idx, { lens: e.target.value as LensKey })
                }
                onBlur={onAutosave}
                className="bg-[#0D1220] rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
                style={INPUT_STYLE}
              >
                <option value="">Lens</option>
                {LENS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <textarea
                value={r.finding}
                onChange={(e) =>
                  onUpdateReceipt(idx, { finding: e.target.value })
                }
                onBlur={onAutosave}
                rows={2}
                placeholder="What this lens shows."
                className={TEXTAREA_BASE}
                style={{ ...TEXTAREA_STYLE, minHeight: "72px" }}
              />
              <button
                type="button"
                onClick={() => onRemoveReceipt(idx)}
                disabled={section.receipts.length <= 3}
                className={`text-cream/40 hover:text-rose text-xs uppercase tracking-[0.18em] px-2 py-2 transition-colors ${
                  section.receipts.length <= 3
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
                style={{ fontWeight: 500 }}
                aria-label="Remove receipt"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {section.receipts.length < 8 ? (
          <button
            type="button"
            onClick={onAddReceipt}
            className="mt-3 text-gold border border-gold/40 rounded-full px-4 py-1.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            + Add receipt
          </button>
        ) : null}
      </div>

      {/* Body */}
      <div>
        <p className={EYEBROW}>Section Body</p>
        <textarea
          value={section.body}
          onChange={(e) => onUpdate({ body: e.target.value })}
          onBlur={onAutosave}
          rows={10}
          className={TEXTAREA_BASE + " mt-2"}
          style={{ ...TEXTAREA_STYLE, minHeight: "240px" }}
          placeholder="The main narrative for this section."
        />
      </div>

      {/* Quote */}
      <div>
        <p className={EYEBROW}>Quote Divider</p>
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={section.goldQuote}
            onChange={(e) => onUpdate({ goldQuote: e.target.value })}
            onBlur={onAutosave}
            placeholder="Add a proverb or quote..."
            className="flex-1 bg-[#151B33] rounded-lg outline-none focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]"
            style={INPUT_STYLE}
          />
          <button
            type="button"
            className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Browse proverbs
          </button>
        </div>
      </div>

      {/* Mark complete */}
      <div className="pt-3 border-t border-gold/10 flex items-center justify-end gap-3">
        {section.complete ? (
          <span
            className="inline-flex items-center gap-2 text-emerald uppercase tracking-[0.2em]"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            <StatusGlyph complete={true} /> Section complete
          </span>
        ) : null}
        <button
          type="button"
          onClick={onMarkComplete}
          className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em]"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          {section.complete ? "Update Section" : "Mark Section Complete"}
        </button>
      </div>
    </div>
  );
}

export { type SectionState as ReportSectionState };
