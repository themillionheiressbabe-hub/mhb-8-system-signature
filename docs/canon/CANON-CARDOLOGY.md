# CANON-CARDOLOGY

The MillionHeiress BABE™ · The BABE Signature™
Locked 27 April 2026 · Source of truth for the cardology system

---

## RULES

- Cardology = Destiny Cards / Sacred Symbols system
- 52 standard cards + The Joker (53 total)
- Each date of the year maps to a Birth Card
- The system is one of the 8 lenses in The BABE Signature methodology
- Public language: "card patterns" or "Destiny Cards" — never name internal mechanics
- Recipe protection: never explain HOW the system works publicly

---

## THE 3-LAYER MODEL

The cardology system operates on 3 distinct layers. Each layer reads different patterns. Reports may use 1, 2, or all 3 layers depending on the product tier.

### Layer 1: Life Spread

The lifetime architecture. Set at birth. Never changes.

The Life Spread is a 13-position structure showing how the planetary energies arrange around your Birth Card across your entire life. Same for everyone with the same Birth Card. Used to read fundamental wiring.

**13 positions in the Life Spread:**
1. **Birth Card** — core identity, lifetime signature
2. **Planetary Ruling Card (PRC)** — secondary identity, life expression style
3. **Mercury** — communication, learning, mental wiring
4. **Venus** — love, values, what she's drawn to
5. **Mars** — drive, action, how she fights
6. **Jupiter** — expansion, abundance, where she grows
7. **Saturn** — boundaries, structure, where she's tested
8. **Uranus** — awakening, breakthrough, where she innovates
9. **Neptune** — dreams, spirituality, where she dissolves
10. **Pluto** — transformation, power, where she rebirths
11. **Result** — lifetime outcome card, what she lands on
12. **Cosmic Lesson** — what her soul came to learn
13. **Cosmic Reward** — what her soul came to receive

The Life Spread is the foundation for The BABE Life Spread (£14) and threads through every Engine 2 personal report.

### Layer 2: Karma + Past Life

The connection layer. Set at birth. Never changes.

This layer maps the cards that connect to her Birth Card across past lifetimes and karmic relationships. These cards aren't in her Life Spread — they're separate, indicating ancestral and karmic patterns.

**Cards in this layer:**
- **2 Karma Cards** — direct karmic ties, primary past-life partners
- **2 Karma Cousins** — secondary karmic ties, similar but lighter
- **2 Past Life Cards** — soul-history cards from before this incarnation

These 6 cards inform Engine 4 Bond products and threading in Engine 2 Signature reads.

### Layer 3: Planetary Periods

The timing layer. Changes every birthday. Each year a new spread.

Planetary Periods are 52-day cycles that move through the year. There are 8 periods per year, each ruled by a planet.

**8 planetary periods per year:**
1. Mercury Period
2. Venus Period
3. Mars Period
4. Jupiter Period
5. Saturn Period
6. Uranus Period
7. Neptune Period
8. Pluto Period

Each period has TWO card positions:
- **Direct card** — main energy of the period
- **Vertical card** — supporting/secondary energy

Total: 8 periods × 2 positions = up to 16 card data points per year.

Note: Neptune Vertical is commonly null and treated as a normal case, not an error.

### Yearly Spread (additional 5 cards, top-of-year)

Sits alongside Planetary Periods but is a separate structure. 5 cards that change every birthday.

**Yearly Spread cards:**
1. **Long Range Card** — required, year's main theme
2. **Pluto Card** — required, transformation/challenge
3. **Result Card** — required, outcome of Pluto
4. **Environment Card** — OPTIONAL (7 Birth Card exceptions don't receive — TBD identification)
5. **Displacement Card** — OPTIONAL (7 Birth Card exceptions don't receive — TBD identification)

**Total Engine 6 Timing data per year: 5 yearly cards + up to 16 planetary period fields = up to 21 card data points.**

---

## DATA SOURCES

### Birth Card lookup
- File: `MHB-FINAL-VERIFIED-LOOKUP-TABLE.md`
- Contains: every date of year mapped to Birth Card + PRC
- Cusp dates flagged
- Locked source — do not modify

### Card library content
- 53 HTML files (one per card)
- Stored: `/mnt/user-data/uploads/`
- Naming: `[CARD-NAME].html` (e.g., `KING-OF-HEARTS.html`)
- Each file contains: full Locked In read, Checked Out read, Watch For warnings, morning/afternoon/evening practical moves, body signals, voice patterns
- Locked source — content goes into Supabase as content blocks

### Life Spread content
- 13 positions × 52 cards = 676 position-specific reads
- Spades Life Spread: `spades-life-spreads-FINAL.sql` (DONE)
- Hearts Life Spread SQL: PENDING
- Clubs Life Spread SQL: PENDING
- Diamonds Life Spread SQL: PENDING

### Suit overviews
- Hearts overview: `MHB_Card_Definitions_Hearts.html`
- Clubs overview: `MHB_Card_Definitions_Clubs.html`
- Diamonds overview: `MHB_Card_Definitions_Diamonds.html`
- Spades overview: `MHB_Card_Definitions_Spades.html`

### Connection meanings (Engine 4 Bond)
- 59 codes total across 5 batches
- Files: `BOND-CONNECTION-MEANINGS-BATCH-1.md` through `BATCH-5.md`
- Locked 27 April 2026

### Index meanings (Engine 4 Bond)
- Attraction Index: -4 to +9
- Intensity Index: 0 to +9
- Compatibility Index: -9 to +9
- See `CANON-INDEX-MEANINGS.md`

---

## THE JOKER EXCEPTION

December 31st only. 53rd card. Solar value zero.

### What the Joker is NOT
- Not part of the standard 52-card system
- Not a Birth Card with a Life Spread
- Not a card with Planetary Periods
- Not a card that participates in Karma/Past Life mappings
- Not a card that participates in relationship comparisons (Engine 4 Bond)

### What the Joker IS
- The wildcard
- Solar value zero (outside the deck's planetary structure)
- The 53rd card
- Born only on December 31st

### How the system handles Joker birthdays

**Engine 1 (Free tools):**
- Daily Frequency works normally (universal collective card)
- Birthprint Snapshot returns custom Joker treatment in the Cardology slot
- Your BABE Year works normally (Numerology, not Cardology)

**Engine 1 (£14 BABE Life Spread):**
- Special Joker version
- Cardology section marked "Solar Value Zero — outside the deck system"
- Other 7 lenses (Tropical, Sidereal, Numerology, Name Frequency, Chinese Zodiac, Chakras, Medicine Wheel) work normally
- Pricing same (£14)

**Engine 2 (Personal Reads):**
- All 7 non-Cardology lenses work normally
- Cardology section adapted: shows the Joker treatment, no Life Spread, no Karma cards
- Cross-verification rule still applies (3+ lenses must confirm)
- Easier to hit 3+ confirmations because remaining 7 lenses still robust

**Engine 4 (Bond):**
- Joker birthdays cannot participate in Connection Meanings dropdowns
- The Bond Builder must skip the 5-dropdown step for Joker clients
- Other lens layers work for synastry (Tropical Astrology, Numerology, etc.)
- Reports note explicitly: "Cardology layer not available for this connection"

**Engine 6 (Timing):**
- No Yearly Spread (no Long Range, Pluto, Result, Environment, Displacement)
- No Planetary Periods
- Engine 6 products NOT AVAILABLE for Joker birthdays
- Recommend client purchase Engine 2 product instead
- Show clear messaging at checkout if Joker birthday detected

**Engine 7 (Journey):**
- Works normally — Journey is chakra-based, not Cardology-based
- Wednesday personalisation pulls from non-Cardology lenses for Joker

### Joker handler implementation
- Database flag on clients: `is_joker BOOLEAN DEFAULT FALSE`
- Set automatically on intake when DOB = December 31st
- All product pages check this flag before allowing Engine 6 purchase
- All report builders check this flag before pulling Cardology data

---

## CROSS-VERIFICATION RULE

A pattern may only enter a multi-lens report when 3+ of the 8 lenses confirm it.

Cardology counts as ONE lens for cross-verification purposes, regardless of which layer (Life Spread, Karma, or Planetary Periods) surfaces the pattern.

For Joker clients, Cardology is unavailable, so cross-verification draws from the remaining 7 lenses.

---

## PUBLIC LANGUAGE RULES

### What we say publicly
- "Card patterns"
- "Destiny Cards"
- "Your Birthprint includes a card layer"
- "The cards show..."

### What we never say publicly
- The 3-layer model name
- "Life Spread" + "Karma" + "Planetary Periods" as a system structure
- How cross-verification works between layers
- That Cardology is one of 8 lenses (we say "multi-system")

### What we say in client-facing reports
- We name positions when relevant ("Your Birth Card is the King of Hearts")
- We don't name layers ("Your Life Spread shows X" is internal — clients see "Your card patterns show X")
- We can reference specific cards by name in flowing prose
- We never publish the methodology of how the layers cross-reference

---

*Locked 27 April 2026. Source of truth for the cardology system.*
