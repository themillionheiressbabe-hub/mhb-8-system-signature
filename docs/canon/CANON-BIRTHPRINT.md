# CANON-BIRTHPRINT

The MillionHeiress BABE™ · The BABE Signature™
Locked 27 April 2026 · Source of truth for the 8-lens architecture

---

## RULES

- Birthprint = the internal data signature of one person across the 8 lenses
- Birthprint is NEVER a product name (the proprietary term stays internal)
- The Birthprint Page = the personalised Orbit display in the client portal
- Public language: "your patterns" / "your data" / "your read" — never name the 8 lenses
- The 8-lens system is recipe-protected. Public hears "multi-system."

---

## THE 8 LENSES

Every Birthprint runs through these 8 lenses. Cross-verification rule: a pattern qualifies for inclusion in a multi-lens report only when 3+ lenses confirm it.

| # | Lens | Data Input | What It Reads |
|---|---|---|---|
| 1 | Tropical Astrology (Placidus, primary anchor) | Date + time + place | Natal chart, houses, aspects, Chiron position |
| 2 | Sidereal Astrology (Whole Sign, Lahiri Ayanamsa) | Date + time + place | Cross-reference layer, Nakshatras |
| 3 | Destiny Cards | Date | Birth Card, PRC, Life Spread, Karma cards, Past Life cards |
| 4 | Name Frequency | Name letters | Expression, Soul Urge, Personality numbers |
| 5 | Numerology (date-based) | Date | Life Path, Personal Year/Month/Day, Pinnacles, Challenges, Life Cycles, Maturity |
| 6 | Chinese Zodiac | Date | Animal, Element, Yin/Yang |
| 7 | Chakras | Aspects from astrology | Body translation, where patterns live physically |
| 8 | Medicine Wheel | House emphasis | Directional support |

### Why 8 and not 7

Numerology (Lens 5) and Name Frequency (Lens 8) are separate because they pull from different inputs (date vs name letters) and read different patterns (timing/cycles vs identity expression). Counting them as one lens collapses two distinct frameworks into one.

For cross-verification purposes, Numerology and Name Frequency count as separate confirmations.

---

## WHAT EACH LENS PRODUCES

### Lens 1: Tropical Astrology (primary anchor)

**Data calculated by Swiss Ephemeris with Placidus house system:**
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto positions
- Chiron position (mandatory for all Engine 2+ products)
- North Node, South Node positions
- Ascendant (Rising sign)
- Midheaven (MC)
- All 12 house cusps (Placidus)
- Major aspects (conjunction, opposition, trine, square, sextile)
- Planetary period transits (current and forthcoming, used in Engine 6)

**Why it's the primary anchor:**
Tropical Placidus is the most widely understood astrological framework in Western contexts. The Birthprint's foundation reads here. Other lenses cross-reference back to this layer.

### Lens 2: Sidereal Astrology

**Data calculated by Swiss Ephemeris with Whole Sign houses + Lahiri Ayanamsa:**
- Same planet positions as Tropical, shifted by Ayanamsa (~24°)
- Whole Sign house cusps
- Nakshatra placements (27 lunar mansions for Moon, plus Sun's nakshatra)

**Role in the system:**
Cross-reference layer. Catches patterns Tropical alone might miss. Particularly useful for spiritual themes and inherited patterns.

### Lens 3: Destiny Cards

See `CANON-CARDOLOGY.md` for full 3-layer model.

**Data calculated:**
- Birth Card (from date)
- Planetary Ruling Card (PRC)
- Life Spread (13 positions)
- Karma Cards (2)
- Karma Cousins (2)
- Past Life Cards (2)
- Yearly Spread (5 cards, current year, used in Engine 6)
- Planetary Periods (8 × Direct + Vertical, current year, used in Engine 6)

**Joker exception:** December 31st birthdays receive Cardology adapted handling — see CANON-CARDOLOGY.

### Lens 4: Name Frequency

**Data calculated using Pythagorean letter-to-number system (A=1, B=2... reduced to single digits):**
- **Expression Number** — sum of all letters in full birth name
- **Soul Urge Number** — sum of vowels only
- **Personality Number** — sum of consonants only

**Optional inputs:**
- Chosen name (if different from birth name) — for cross-reference of identity evolution
- Business name (for Engine 3) — for brand frequency comparison

**What it reads:**
- Expression: how she's wired to express in the world
- Soul Urge: what she actually wants underneath
- Personality: how she comes across to others

### Lens 5: Numerology (date-based)

**Data calculated from birth date:**
- **Life Path Number** — primary life themes (1-9 + master numbers 11/22/33)
- **Birthday Number** — day of birth
- **Personal Year** — current year energy (1-9, 11/22/33)
- **Personal Month** — current month layered on Personal Year
- **Personal Day** — current day layered on Personal Month
- **Pinnacles** — 4 major life chapters
- **Challenges** — 4 corresponding life challenges
- **Life Cycles** — 3 life eras
- **Maturity Number** — combined with Expression for late-life integration

**What it reads:**
Timing, cycles, life-path themes. About when and what cycles, not who she is.

### Lens 6: Chinese Zodiac

**Data calculated from birth date and year:**
- **Animal** — 12-year cycle (Pig, Tiger, Dragon, etc.)
- **Element** — 5-element cycle (Water, Wood, Fire, Earth, Metal) layered on the animal
- **Yin/Yang** — masculine/feminine current

**What it reads:**
Inherited cultural patterns, work ethic, resilience patterns, cyclic timing on a 60-year wheel.

### Lens 7: Chakras

**Derived from astrology aspects (not direct input):**
- **Root** — security/foundation (read from Saturn, Moon, 4th house)
- **Sacral** — creativity/pleasure (read from Venus, Mars, 5th house)
- **Solar Plexus** — power/will (read from Sun, Mars in fire signs)
- **Heart** — love/connection (read from Venus, Moon, Cancer/Leo placements)
- **Throat** — voice/expression (read from Mercury, North Node in Gemini, Chiron in Gemini)
- **Third Eye** — insight (read from Jupiter, Neptune, 9th house)
- **Crown** — spiritual integration (read from Jupiter conjunctions, 12th house, Pisces emphasis)

**Each chakra returns a state:**
- Locked In (resourced)
- Checked Out (shadow state)

**What it reads:**
Body translation. Where her patterns live physically. Used in the interactive Chakra Capacity component in the portal.

### Lens 8: Medicine Wheel

**Derived from house emphasis (not direct input):**
- **East** — Clarity/Vision (1st, 5th, 9th houses)
- **South** — Connection/Heart (3rd, 7th, 11th houses)
- **West** — Rest/Reflection (4th, 8th, 12th houses)
- **North** — Structure/Wisdom (2nd, 6th, 10th houses)

**What it reads:**
Directional support. Which compass direction she leans into when resourced. Which one she avoids when stressed.

Used in the interactive Medicine Wheel component in the portal — rotates with Personal Month.

---

## CROSS-VERIFICATION ENGINE

The 3+ lens rule. A pattern qualifies for inclusion in a multi-lens report when 3 or more of the 8 lenses confirm it.

### Confidence scoring
- 3 lenses confirm → MINIMUM threshold (pattern enters report)
- 4-5 lenses confirm → HIGH confidence (pattern gets prominent placement)
- 6+ lenses confirm → CORE pattern (anchors the report)

### What the engine does
1. Pulls all 8 lens datasets for the client
2. Identifies thematic clusters (e.g., "voice/worth wound")
3. Counts how many lenses confirm each cluster
4. Filters out patterns with <3 lens confirmation
5. Sorts remaining patterns by confidence score
6. Returns ordered list to the report builder

### What the engine does NOT do
- Improvise patterns not actually present in the data
- Diagnose conditions
- Predict outcomes
- Override Yemi's manual review for Engine 2+ products

---

## THE BIRTHPRINT PAGE (Client Portal)

The personalised Orbit display in the client portal. Centre = her Birth Card. 8 data nodes orbit around it.

See `CANON-VISUAL-IDENTITY.md` for full Orbit + Birthprint Page architecture spec.

### 8 Data Node Positions

| Position | Node | Data Shown |
|---|---|---|
| North | Sun | Sign + degrees (e.g., Libra 1°23') |
| Northeast | Moon | Sign + degrees |
| East | Rising | Sign + degrees |
| Southeast | MC | Sign + degrees |
| South | PRC | Card + suit |
| Southwest | Personal Year | Number + current year |
| West | Life Path | Number + meaning keyword |
| Northwest | Element | Chinese animal + element |

### Centre

- 220px disc (portal version)
- Double-ringed
- Magenta radial glow
- Birth Card displayed (e.g., "King of Hearts")
- Suit symbol 64px in suit colour with double-glow

### Interactive behaviour

- Each node hover/tap: scales up 1.08x, shows expanded read
- Connection lines from centre to each node
- Star field animation in background
- Rotating dashed ring continues during interaction

### 8 Lens Detail Cards (below the orbit)

2-column grid. One card per lens. Each card shows:
- Lens name
- Her actual data values for that lens
- Green receipt chip showing pattern confirmation count (e.g., "3 patterns confirmed")
- Click to expand for full lens read

---

## DATA STORAGE

### Birthprint storage in Supabase

Each client's Birthprint stored permanently in the `birthprints` table. Calculated ONCE on intake, never recalculated unless:
- Birth time gets corrected
- Place of birth gets corrected
- Name gets corrected (rare — usually only for legal name change)

### What's cached vs what's calculated on-demand

**Cached (calculated once at intake):**
- Tropical natal chart positions
- Sidereal natal chart positions
- Birth Card, PRC, Life Spread, Karma cards
- Name Frequency numbers
- Life Path, Pinnacles, Challenges
- Chinese Zodiac
- Chakra base states (from natal chart)
- Medicine Wheel base direction

**Calculated on-demand:**
- Personal Year/Month/Day (changes with current date)
- Current planetary period (changes every 52 days)
- Current Yearly Spread (changes every birthday)
- Current transits (Engine 6 timing reports)
- Daily Frequency activations (Engine 5 subscription)

### Why this matters
Engine 5 (Daily Frequency · Personal subscription) needs the cached Birthprint to run cheap (one Claude API call per day per subscriber). If we recalculate on every send, the cost model breaks.

---

## THE BIRTHPRINT IS NOT A PRODUCT

Birthprint = internal data signature.

The Birthprint is NEVER sold as a standalone product. It informs every product but is not delivered separately. Standalone delivery would let clients reverse-engineer the proprietary methodology.

What we call "The Birthprint Snapshot" is a free tool — a marketing surface, not the actual Birthprint. It uses 5 of the 8 lenses for a lightweight read.

What we call "Your Birthprint" in the client portal is the visualisation of the data, not the data itself. Clients see the layout. They don't see the cross-verification engine.

---

## PUBLIC LANGUAGE RULES

### What we say publicly
- "Your Birthprint" (when speaking to a client about their portal page)
- "Your patterns"
- "Your data"
- "The Birthprint Snapshot" (the free tool only)
- "Multi-system pattern recognition"

### What we never say publicly
- "8 lenses"
- The names of the 8 lenses as a list
- "Cross-verification engine"
- "3+ lens rule"
- How any specific lens calculation works

### What clients are allowed to know
- They have a Birthprint
- It's based on multiple frameworks
- It cross-references patterns
- The result is more reliable than single-system reads

### What clients are NOT shown
- The 8-lens count
- The specific frameworks named together
- The internal scoring/confidence layer
- The recipe

---

*Locked 27 April 2026. Source of truth for the 8-lens architecture and Birthprint Page.*
