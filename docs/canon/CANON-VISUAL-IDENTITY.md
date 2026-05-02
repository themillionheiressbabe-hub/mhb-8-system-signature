# CANON-VISUAL-IDENTITY

The MillionHeiress BABE™ · The BABE Signature™
Locked 27 April 2026 · Source of truth for visual identity

---

## RULES

- The Orbit is the universal cover mark across all surfaces
- Birthprint Page architecture is locked (Variation 4 Constellation)
- Suit colour rotation is mandatory across all product covers
- Em dashes are BANNED everywhere (content + code comments)
- Italic body content is BANNED (italics reserved for headings only)
- Cormorant Garamond italic for headings
- Outfit for body, 16px minimum
- Deep navy background (#0A0E1A) is the canvas

---

## DESIGN TOKENS

### Colours

| Token | Hex | Usage |
|---|---|---|
| Navy (background) | `#0A0E1A` | Default canvas |
| Magenta primary | `#B51E5A` | CTAs, primary interactive, accents |
| Magenta bright | `#D63F7E` | Hover states, glow effects |
| Gold secondary | `#C9A96E` | Borders, dividers, gold quote callouts |
| Gold bright | `#E8C988` | Glow effects, hover states for gold elements |
| Emerald accent | `#2D9B6E` | Success states, receipt chips, Clubs suit |
| Hearts | `#C44A6E` | Hearts suit colour (warm magenta) |
| Diamonds | `#C9A96E` | Diamonds suit colour (gold) |
| Clubs | `#2D9B6E` | Clubs suit colour (emerald) |
| Spades | `#A78BFA` | Spades suit colour (violet) |
| Text dark | `#1A1A1A` | Body text on light backgrounds |
| Text light | `#F4F1ED` | Body text on dark navy |
| Grey mid | `#888888` | Tertiary text, timestamps, metadata |

### Typography

**Headings:** Cormorant Garamond, italic, weight 500-600
**Body:** Outfit, weight 400 for prose, weight 500 for emphasis
**Body minimum size:** 16px
**Line height:** 1.4 for body, 1.2 for headings
**Letterspacing:** 0.02em for eyebrow text (gold uppercase)

### Spacing

- Use multiples of 4px throughout
- Common spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Section padding: 96px vertical desktop, 48px mobile
- Component padding: 24px standard

### Borders + Radius

- Pill buttons: 50px border-radius
- Cards: 16px border-radius
- Inputs: 8px border-radius
- Hairline borders: 1px solid at 10-15% opacity

### Effects

- Frosted glass navbar (backdrop-filter: blur(20px))
- Particles in hero sections
- Parallax on scroll for marketing pages
- Scroll reveals (fade up + 20px translate)
- Grain texture overlay (noise.svg at 3% opacity)

---

## THE ORBIT (Universal Cover Mark)

**Variation 4 Constellation locked.** Appears on every product cover, free tool, portal page header, admin branding, email send template.

### Architecture

**Outer ring**
- 1px solid stroke
- Gold at 30% opacity
- Outer glow: 1px gold at 15% opacity, offset 4px outside

**Star field**
- 7-10 small stars inside the orbit area
- Random positioning (seeded for consistency)
- Twinkling animation: opacity 0.3 → 1.0 → 0.3
- Speeds vary per star (3-7 second cycles, randomised offsets)

**Rotating ring**
- 1px dashed stroke
- Gold at 40% opacity
- Dash pattern: 4 4
- Rotation: 240 second cycle (slow, hypnotic)
- Traveller dot at top of ring (small filled circle, gold bright, glows)

**Compass cardinals**
- N, E, W rendered in gold (#E8C988) with bright glow
- S rendered in magenta (#D63F7E) with bright glow
- Letters: Outfit weight 600, uppercase, letterspacing 0.15em
- Positioned at 12 o'clock, 3, 6, 9 (true cardinal positions on the circle)

**Centre disc**
- Cover version: 92px diameter
- Birthprint Page version: 220px diameter
- Border: 1px solid gold
- Background: magenta radial gradient (#B51E5A center → #D63F7E edge)
- Double inner shadow: inner 0 0 20px rgba(0,0,0,0.4), inner 0 0 40px rgba(181,30,90,0.3)

**Centre symbol**
- Cover version: suit symbol 32-40px in suit colour with double-glow
- Birthprint Page version: Birth Card with suit symbol 64px in suit colour with double-glow
- Symbol style: clean, geometric, slightly stylised (NOT playing-card cartoonish)

### Suit Colour Rotation

Every product cover uses the colour matching the relevant suit context. For products that aren't suit-specific (e.g., Engine 5 subscription), default to Hearts magenta-warm.

| Suit | Colour | Hex |
|---|---|---|
| Hearts | Magenta-warm | `#C44A6E` |
| Diamonds | Gold | `#C9A96E` |
| Clubs | Emerald | `#2D9B6E` |
| Spades | Violet | `#A78BFA` |

### Where The Orbit appears

| Surface | Size | Notes |
|---|---|---|
| Product covers (29 products + 3 free tools) | Full size | Suit colour rotation applied |
| Portal page header (Dashboard, Birthprint, all pages) | Compact | Uses client's Birth Card suit |
| Admin dashboard header | Compact | Default Hearts magenta |
| Email send template header | Logo size | Default Hearts magenta |
| Storefront product card thumbnails | Thumbnail | Suit colour rotation |
| Favicon | Simplified | Centre disc + minimal star field, no rotating ring |
| Loading states | Full size | Rotation speeds up to 30 second cycle |

### What The Orbit replaces

The Orbit replaces ALL prior logo/cover marks. There is no separate logotype. The Orbit + the brand name in Cormorant italic IS the logo.

---

## THE BIRTHPRINT PAGE (Personalised Orbit)

The portal's flagship interactive page. Same Orbit architecture as the universal cover mark, personalised at centre with HER Birth Card and 8 data nodes orbiting around it.

### Centre

- 220px disc (larger than cover version)
- Double-ringed (outer ring + inner border)
- Magenta radial glow
- **Eyebrow text:** "Birth Card" in gold uppercase letterspaced 0.15em
- **Card name:** in italic Cormorant (e.g., "King of Hearts") size 24px
- **Suit symbol:** 64px in suit colour with double-glow

### 8 Data Nodes (orbiting positions)

Each node is a small circle with a label and value, positioned at compass points around the centre.

| Position | Node | Data Shown |
|---|---|---|
| North (12 o'clock) | Sun | Sign + degrees (e.g., "Libra 1°23'") |
| Northeast (1:30) | Moon | Sign + degrees |
| East (3 o'clock) | Rising | Sign + degrees |
| Southeast (4:30) | MC | Sign + degrees |
| South (6 o'clock) | PRC | Card name + suit |
| Southwest (7:30) | Personal Year | Number + current year |
| West (9 o'clock) | Life Path | Number + meaning keyword |
| Northwest (10:30) | Element | Chinese animal + element |

### Node Visual Spec

- Circle size: 56px diameter
- Border: 1px gold at 60% opacity
- Background: navy darker (#060812)
- Label (above): Outfit weight 500, gold, 11px, uppercase, letterspaced 0.1em
- Value (centre of circle): Cormorant italic, 14px, white text
- Hover state: scales 1.08x, glow brightens, border opacity 100%
- Tap (mobile): same as hover, plus expansion below page showing full read

### Connection Lines

- Subtle gold lines from centre to each node
- 0.5px stroke, gold at 15% opacity
- Drawn straight from disc edge to node edge

### Star Field

- Same as cover version (7-10 stars twinkling)
- Continues animating during all interactions

### Rotating Ring

- Same as cover version (dashed gold, 240s rotation)
- Continues during all interactions

### Below the Orbit: 8 Lens Detail Cards

2-column grid (mobile: 1 column).

Each card shows:
- **Lens name** (Cormorant italic, gold, 18px) — e.g., "Tropical Astrology"
- **Her data values** for that lens — e.g., "Sun: Libra 1° / Moon: Taurus 23° / Rising: Aries 12°"
- **Green receipt chip** (emerald background, white text, pill shape, 11px) — e.g., "3 patterns confirmed"
- **Expand arrow** (gold) — opens full lens read in a modal or inline expansion

Card visual spec:
- Padding: 24px
- Border: 1px solid gold at 20% opacity
- Background: navy lighter (#101526)
- Border radius: 16px
- Hover: border opacity 40%, slight scale (1.02x)

---

## SCROLL REVEALS + MICRO-INTERACTIONS

### Scroll reveals

When elements enter viewport:
- Fade in opacity 0 → 1
- Translate up 20px → 0
- Duration: 400ms
- Easing: ease-out

### Hover states

- Buttons: brightness +10%, scale 1.02x
- Cards: border opacity +20%, scale 1.02x
- Nodes (Birthprint Page): scale 1.08x, glow brightens
- Links: underline reveal animation (0.2s)

### Loading states

- Use The Orbit at full size
- Rotation speed: 30 second cycle (faster than the calm 240s)
- Subtle pulse on the centre disc

### Page transitions

- Crossfade 200ms when navigating between portal pages
- Header (with Orbit) stays static during transitions

---

## RESPONSIVE BEHAVIOUR

### Mobile (<768px)

- Orbit centre disc: 160px (Birthprint Page), 64px (cover thumbnails)
- 8 nodes: 40px diameter, labels reduce to 9px
- Lens detail cards: stack to 1 column
- Section padding: 48px vertical
- Font sizes: body 14-15px, headings reduced ~20%

### Tablet (768-1024px)

- Orbit centre disc: 200px (Birthprint Page)
- Nodes: 48px diameter
- Lens detail cards: still 2 columns
- Section padding: 72px vertical

### Desktop (1024+)

- Full sizes as locked above
- Maximum content width: 1200px (with side gutters)

---

## PRINT (PDF reports)

### Cover page

- Full-page Orbit (Variation 4 Constellation)
- Suit colour matches the report's primary suit context
- Below Orbit: product name in Cormorant italic + client name
- Brand mark at footer: "The MillionHeiress BABE™"

### Section pages

- Compact Orbit at top right of every page (~40px)
- Same colour palette as digital
- Print-safe: ensure magenta and gold print accurately on standard CMYK
- Margins: 1 inch all sides
- Footer: page number + brand mark + page navigation arrows

### Gold quote dividers

- Sit between sections
- Cormorant italic, gold (#C9A96E)
- Pulled from `MHB-REMIXED-PROVERBS-COLLECTION-1774612839538.md` (130+ proverbs in BABE voice)
- Frequency: 4-6 per Birthprint Read, 6-8 per Bond/Business Map, 10-12 per BABE Signature

---

## COMPONENTS LIBRARY (Tailwind)

Build components using these tokens. Names locked:

- `<OrbitCover suit="hearts" size="full" />` — universal cover mark
- `<BirthprintPage data={...} />` — personalised Orbit display
- `<LensDetailCard lens="..." data={...} confirmations={3} />` — 8 lens detail cards
- `<GoldDivider />` — gold quote callout pulled from proverb library
- `<ReceiptChip count={3} />` — emerald pill showing pattern confirmation count
- `<MedicineWheel position="north" interactive />` — interactive Medicine Wheel (Dashboard)
- `<ChakraCapacity states={...} interactive />` — interactive Chakra Capacity (Dashboard)

---

## BANNED VISUAL ELEMENTS

- Em dashes (— and –) anywhere — replace with commas, periods, or " · "
- Italic body text (italics ONLY for headings)
- More than one font weight per heading
- Drop shadows on text (use glow effects on UI only, never on text)
- Round avatars on testimonials (use square with 4px radius)
- Stock photography (every photo must be Yemi or commissioned)
- Generic icon libraries (lucide-react acceptable for utility icons only — NEVER for brand-facing decorative use)

---

## EXISTING MOCKUPS

### Reference status

All HTML mockups in `/mnt/user-data/uploads/` are REFERENCE ONLY. They show structural intent but do NOT match the locked v5 spec.

| File | Status |
|---|---|
| `BABE_Public_Site.html` | Reference — rebuild required |
| `BABE_Client_Portal.html` | Reference — rebuild required (Birthprint Page architecture missing) |
| `BABE_HQ_Admin.html` | Reference — rebuild required (engine-specific builders missing) |
| `Engine_1_Bridge_Products__standalone_.html` | Reference — rebuild required |
| `Engine_2_BABE_Signature__standalone_.html` | Reference — rebuild required |
| `Your_Year_Map__standalone_.html` | Reference — rebuild required (Engine 6 timing structure corrected) |

### Locked mockups (use as visual reference for build)

| File | Status |
|---|---|
| `the-orbit-mockup.html` | LOCKED — Variation 4 Constellation chosen |
| `her-birthprint-page.html` | LOCKED — Birthprint Page architecture |

---

*Locked 27 April 2026. Source of truth for visual identity.*
