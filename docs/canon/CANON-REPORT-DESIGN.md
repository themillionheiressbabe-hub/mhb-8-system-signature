# CANON-REPORT-DESIGN

The MillionHeiress BABE™ · The BABE Signature™
Locked 27 April 2026 · Source of truth for report visual + structural design

---

## RULES

- Reports use long-scroll structure (one continuous flowing read, not paginated walls)
- Every report PDF gets The Orbit cover (suit colour matched to context)
- Navy + magenta + gold + Cormorant + Outfit
- No em dashes anywhere
- No italic body content (italics for headings only)
- Gold quote dividers pulled from the locked proverb library
- Compliance footer on every page
- "If your lived experience disagrees with anything in this document, trust your lived experience." appears in every report

---

## REPORT SURFACES

Every paid report ships in TWO formats:

### 1. PDF (downloadable)
- Generated server-side via React-PDF
- Stored in Supabase Storage private bucket
- Signed URL (60-min expiry) for downloads
- Print-ready (1-inch margins, US Letter or A4)

### 2. Portal long-scroll
- Native React render in client portal
- Identical content to PDF, optimised for screen
- Anchor links from a sticky table of contents
- Mobile-responsive

Both surfaces share the same content blocks. Build the PDF generator and the portal render from the same data structures.

---

## REPORT VISUAL STRUCTURE

### Cover Page (PDF only)

Full-page Orbit (Variation 4 Constellation) at centre of page. Suit colour matched to report's primary suit context.

Below the Orbit:
- Product name in Cormorant italic, 36pt, gold
- Client name in Cormorant italic, 24pt, white
- Date generated in Outfit, 12pt, grey
- Brand mark at bottom: "The MillionHeiress BABE™" in Outfit, 10pt, gold

### Title Page (after cover)

- Eyebrow: "BABE SIGNATURE READ" (or product type) in gold uppercase, letterspaced 0.15em
- Main title: client's reading name in Cormorant italic, 48pt
- Subtitle: one-line summary in Cormorant italic, 18pt, gold
- Compact Orbit at top right (~40px)

### Table of Contents

- Compact list of section names
- Section number + name, gold accent on number
- Page numbers (PDF) or anchor links (portal)
- Subtle gold underline for hover state

### Body Sections

Each section follows the 16-element framework. See `CANON-PATTERN-ENGINE.md` for full structure.

### Closing Page

- Eyebrow: "INTEGRATION"
- Closing letter in client-facing voice (Caribbean big-sister tone)
- Compliance line: "If your lived experience disagrees with anything in this document, trust your lived experience."
- Brand mark
- Compact Orbit

---

## LONG-SCROLL DESIGN PRINCIPLES

### One continuous read

Reports are designed to be read in one sitting (or saved and returned to). Sections flow into each other, not separated by hard page breaks in the digital version.

### Visual rhythm

To prevent fatigue, alternate section densities:
- Heavy text section → gold quote divider → lighter visual section
- Pattern section → integration prompt → pattern section
- Three full sections → reflection break with gold proverb

### Gold quote dividers

Pulled from `MHB-REMIXED-PROVERBS-COLLECTION-1774612839538.md` (130+ proverbs in BABE voice).

**Frequency by product:**
- The BABE Mirror, Lens, Crossing, Reckoning, Rebuild: 4-6 per report
- The BABE 90, Bond Lens, Business Lens: 6-8 per report
- The BABE Signature, Business Signature, Bond Signature: 10-12 per report

**Visual spec:**
- Cormorant italic, 22pt
- Gold colour (#C9A96E)
- Centred horizontally
- Padding: 48px vertical
- Subtle gold rule above and below (0.5px, 30% opacity)
- Quote marks: stylised, gold

**Placement:**
- Between sections (most common)
- After particularly heavy emotional sections (palate cleanser)
- Before integration prompts (sets reflective tone)
- NEVER inside a section (breaks the flow)

### Suit-coloured card chips

When referencing specific Destiny Cards inline, use a small chip with the card name and suit colour.

**Visual spec:**
- Pill shape, 6px border-radius
- Border: 1px solid in suit colour
- Background: suit colour at 8% opacity
- Text: card name in Outfit weight 500, 13px, suit colour
- Suit symbol icon: 12px, suit colour, leading the text

**Example inline:**
"Your Birth Card [chip: King of Hearts ♥] sits in the lifetime position..."

---

## TYPOGRAPHY HIERARCHY

### Print (PDF)

| Element | Font | Size | Weight | Colour |
|---|---|---|---|---|
| Cover product name | Cormorant Italic | 36pt | 500 | Gold |
| Cover client name | Cormorant Italic | 24pt | 500 | White |
| Title page main title | Cormorant Italic | 48pt | 500 | Magenta |
| Section heading (H1) | Cormorant Italic | 28pt | 500 | Magenta |
| Subsection heading (H2) | Cormorant Italic | 20pt | 500 | Navy |
| Eyebrow | Outfit Uppercase | 10pt | 600 | Gold |
| Body | Outfit | 11pt | 400 | Text dark |
| Emphasis | Outfit | 11pt | 600 | Text dark |
| Gold divider quote | Cormorant Italic | 22pt | 500 | Gold |
| Caption | Outfit | 9pt | 400 | Grey mid |
| Footer | Outfit | 8pt | 400 | Grey mid |

### Digital (Portal)

| Element | Font | Size | Weight | Colour |
|---|---|---|---|---|
| Page title | Cormorant Italic | 48px | 500 | Magenta |
| Section heading (H1) | Cormorant Italic | 32px | 500 | Magenta |
| Subsection heading (H2) | Cormorant Italic | 24px | 500 | Navy |
| Eyebrow | Outfit Uppercase | 11px | 600 | Gold |
| Body | Outfit | 16px | 400 | Text dark |
| Emphasis | Outfit | 16px | 600 | Text dark |
| Gold divider quote | Cormorant Italic | 28px | 500 | Gold |
| Caption | Outfit | 13px | 400 | Grey mid |

---

## COLOUR USAGE WITHIN REPORTS

### Section accents

Each section gets a subtle colour accent based on its theme:
- Identity / Birth Card sections: Magenta accent
- Shadow / Chiron sections: Magenta + slight darker tone
- Integration / Practice sections: Gold accent
- Body / Chakra sections: Emerald accent
- Direction / Medicine Wheel sections: Gold accent

Accent shows as:
- 4px gold or magenta vertical bar at left edge of section heading
- Eyebrow text colour shifts to match accent
- Card chips referenced in section default to section's accent colour if no specific suit

### Locked In vs Checked Out boxes

These appear in every full pattern section.

**Locked In box:**
- Background: emerald at 8% opacity (#2D9B6E08)
- Border: 1px solid emerald at 30%
- Border radius: 12px
- Padding: 20px
- Eyebrow: "LOCKED IN" in emerald uppercase letterspaced
- Body: standard typography

**Checked Out box:**
- Background: magenta at 6% opacity (#B51E5A06)
- Border: 1px solid magenta at 25%
- Border radius: 12px
- Padding: 20px
- Eyebrow: "CHECKED OUT" in magenta uppercase letterspaced
- Body: standard typography

These boxes are STRUCTURAL not decorative. They organise the pattern. Always paired (Locked In before Checked Out).

### Receipts (multi-lens evidence)

When showing the receipts (3+ lens evidence) for a pattern:

- Header: "THE RECEIPTS" in gold uppercase letterspaced
- List format with bullet
- Each receipt shows: lens name + specific finding (e.g., "Tropical Astrology: Sun in Libra 6th house")
- Lens names in Outfit weight 500, gold
- Findings in Outfit weight 400, text dark

The receipts section is what differentiates The BABE Signature from generic astrology readings. Show the work.

---

## PAGE LAYOUT (PDF)

### Margins

- Top: 1 inch
- Bottom: 1 inch
- Left: 1 inch
- Right: 1 inch

### Header (every page after cover)

- Compact Orbit (~40px) at top right
- Section name at top left in Outfit 9pt grey
- Hairline rule below header at 30% gold opacity

### Footer (every page)

- Page number centred in Outfit 9pt grey
- Brand mark "The MillionHeiress BABE™" at bottom right in Outfit 8pt gold
- Page navigation arrows on long reports: "← Previous Section · Next Section →" in Outfit 8pt grey
- Hairline rule above footer at 30% gold opacity

### Spacing

- Top of page to first content: 0.75 inch (after header)
- Between sections: 1 inch (excluding gold divider space)
- Between subsections: 0.5 inch
- Within paragraphs: 1.4 line height

---

## PORTAL LAYOUT (Long-Scroll)

### Sticky table of contents

- Right sidebar on desktop (≥1024px)
- Hamburger menu on mobile/tablet
- Section names with anchor links
- Current section highlighted in magenta
- Smooth scroll on click

### Section transitions

- 96px vertical padding between major sections
- 64px between subsections
- Gold dividers add 48px on either side

### Reading progress indicator

- 2px bar at top of viewport
- Magenta fill, gold background at 20% opacity
- Tracks scroll position through report

### Sidebar widgets (right side, below TOC)

- "Save section to journal" button
- "Ask BABE Companion about this" button (opens companion preloaded with section context)
- "Mark as integrated" toggle (saves to Pattern Tracker)

These widgets only appear in portal version, not PDF.

---

## INTERACTIVE ELEMENTS (PORTAL ONLY)

### Hover states on card chips
- Hover reveals tooltip with full card name + brief description
- Click opens card detail modal

### Section highlights
- Reader can highlight passages
- Highlights save to journal automatically
- Visual: 4px magenta underline that pulses briefly when highlighted

### Inline reflections
- After certain sections, embedded prompt: "Sit with this for a moment. What's coming up?"
- Optional text input that saves directly to Integration Journal
- Skip option: "Move on"

---

## REPORT GENERATION ORDER

When building a report (Engine 2-7), generate in this order:

1. **Cover** with suit colour matching primary context
2. **Title page** with client name + product name
3. **Table of contents** auto-generated from section headings
4. **Sections** in their locked product-specific order (see CANON-PATTERN-ENGINE for 16-element framework per section)
5. **Closing letter** with compliance line
6. **Footer mark** on every page

For Engine 1 (£14 BABE Life Spread): Skip Title Page, simpler ToC, fewer gold dividers (4 max).

For Engine 5 subscription daily emails: Different structure entirely (see CANON-PATTERN-ENGINE Engine 5 section).

---

## QUALITY CONTROL CHECKLIST

Before delivery, every report passes through QC:

- [ ] Compliance line present in closing
- [ ] No em dashes in body or headings
- [ ] No italic body text (italics on headings only)
- [ ] No banned vocabulary (Mind/Body/Soul, Blueprint, Alignment Codex)
- [ ] Locked vocabulary used (Locked In / Checked Out, NEVER "Burnt Out" or "Unattended")
- [ ] All 16 elements present in each full pattern section (or correct count for product tier)
- [ ] Receipts show 3+ lens confirmation per pattern (where applicable)
- [ ] Chiron section present in all Engine 2+ products
- [ ] Saturn safety footer present in any Bond report containing Saturn codes
- [ ] Card chips correctly suit-coloured
- [ ] Gold quote dividers placed at section transitions
- [ ] Cover Orbit suit colour matches primary context
- [ ] PDF renders correctly (no overflow, no broken layout)
- [ ] Portal version matches PDF content

---

## EMAIL REPORT DELIVERY

When a report is approved and sent:

- Email template includes compact Orbit header
- Subject line format: "Your [Product Name] is ready" (e.g., "Your BABE Signature is ready")
- Email body: short letter from Yemi voice (3-4 sentences)
- "View your report" button → portal long-scroll version
- "Download PDF" button → signed URL (60-min expiry)
- Footer with brand mark

---

*Locked 27 April 2026. Source of truth for report visual + structural design.*
