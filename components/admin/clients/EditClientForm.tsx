"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

export type EditClientPayload = {
  full_name: string;
  email: string;
  chosen_name: string;
  date_of_birth: string;
  time_of_birth: string;
  time_unknown: boolean;
  place_of_birth: string;
  notes: string;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const INPUT_CLS =
  "w-full bg-[#151B33] border rounded-lg outline-none transition-colors";
const INPUT_STYLE: React.CSSProperties = {
  borderColor: "rgba(201,169,110,0.3)",
  padding: "14px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  color: "#F4F1ED",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
};

export function EditClientForm({
  clientId,
  initial,
  updateClient,
}: {
  clientId: string;
  initial: EditClientPayload;
  updateClient: (
    payload: EditClientPayload,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [fullName, setFullName] = useState(initial.full_name);
  const [email, setEmail] = useState(initial.email);
  const [chosenName, setChosenName] = useState(initial.chosen_name);
  const [dob, setDob] = useState(initial.date_of_birth);
  const [time, setTime] = useState(initial.time_of_birth);
  const [timeUnknown, setTimeUnknown] = useState(initial.time_unknown);
  const [place, setPlace] = useState(initial.place_of_birth);
  const [notes, setNotes] = useState(initial.notes);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isJokerDob = dob.endsWith("-12-31");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !dob || !place.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    startTransition(async () => {
      const result = await updateClient({
        full_name: fullName.trim(),
        email: email.trim(),
        chosen_name: chosenName.trim(),
        date_of_birth: dob,
        time_of_birth: timeUnknown ? "" : time,
        time_unknown: timeUnknown,
        place_of_birth: place.trim(),
        notes: notes.trim(),
      });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#151B33] rounded-3xl"
      style={{
        padding: "32px",
        border: "1px solid rgba(201,169,110,0.15)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="flex flex-col gap-6">
        <section>
          <p className={EYEBROW}>Account</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Legal Name" required>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={INPUT_CLS + " focus:border-gold/80"}
                style={INPUT_STYLE}
              />
            </Field>
            <Field label="Email Address" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT_CLS + " focus:border-gold/80"}
                style={INPUT_STYLE}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Chosen Name">
              <input
                type="text"
                value={chosenName}
                onChange={(e) => setChosenName(e.target.value)}
                placeholder="Name they go by day to day"
                className={INPUT_CLS + " focus:border-gold/80 placeholder:text-cream/30"}
                style={INPUT_STYLE}
              />
            </Field>
          </div>
        </section>

        <section className="pt-6 border-t border-gold/15">
          <p className={EYEBROW}>Birth Data</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of Birth" required>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className={INPUT_CLS + " focus:border-gold/80"}
                style={INPUT_STYLE}
              />
            </Field>
            <Field label="Time of Birth">
              <input
                type="time"
                value={timeUnknown ? "" : time}
                onChange={(e) => setTime(e.target.value)}
                disabled={timeUnknown}
                className={INPUT_CLS + " focus:border-gold/80"}
                style={{ ...INPUT_STYLE, opacity: timeUnknown ? 0.5 : 1 }}
              />
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => {
                    setTimeUnknown(e.target.checked);
                    if (e.target.checked) setTime("");
                  }}
                  className="accent-magenta"
                />
                <span
                  className="text-cream/70"
                  style={{ fontSize: "13px" }}
                >
                  I don&rsquo;t know my birth time
                </span>
              </label>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Place of Birth" required>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
                placeholder="City, Country"
                className={INPUT_CLS + " focus:border-gold/80 placeholder:text-cream/30"}
                style={INPUT_STYLE}
              />
            </Field>
          </div>
          {isJokerDob ? (
            <div
              className="mt-4 rounded-xl"
              style={{
                backgroundColor: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.4)",
                padding: "16px 18px",
              }}
            >
              <p
                className="font-sans uppercase tracking-[0.35em]"
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "#F59E0B",
                }}
              >
                Joker Flag
              </p>
              <p
                className="text-cream mt-2"
                style={{ fontSize: "14px", lineHeight: 1.55 }}
              >
                This client&rsquo;s birth date is December 31. The Joker
                card applies. Engine 6 timing products are not available
                for this client. Bond reports require special handling.
              </p>
            </div>
          ) : null}
        </section>

        <section className="pt-6 border-t border-gold/15">
          <p className={EYEBROW}>Notes</p>
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any notes about this client."
              className={INPUT_CLS + " focus:border-gold/80 placeholder:text-cream/30 resize-y"}
              style={{ ...INPUT_STYLE, lineHeight: 1.5 }}
            />
          </div>
        </section>

        {error ? (
          <p
            className="text-magenta"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px" }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/clients/${clientId}`}
            className="text-gold border border-gold/40 rounded-full px-5 py-2.5 hover:bg-gold/10 transition-colors uppercase tracking-[0.2em]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className={`bg-magenta text-cream rounded-full px-6 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] ${
              pending ? "opacity-60 cursor-wait" : ""
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
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
        className="block font-sans uppercase tracking-[0.2em] text-gold mb-2"
        style={LABEL_STYLE}
      >
        {label}
        {required ? <span className="text-magenta ml-1">*</span> : null}
      </label>
      {children}
    </div>
  );
}
