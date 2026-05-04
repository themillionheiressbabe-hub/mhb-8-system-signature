"use client";

import { useState } from "react";

type Props = {
  text: string;
  label?: string;
  copiedLabel?: string;
};

export function CopySeedButton({
  text,
  label = "Copy as caption seed",
  copiedLabel = "Copied",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-outline btn-sm"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
