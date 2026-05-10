-- Life Spread data for all 52 cards
-- Generated from docs/cardology/ HTML files

CREATE TABLE IF NOT EXISTS life_spreads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_code TEXT NOT NULL UNIQUE,
  moon TEXT,
  mercury TEXT,
  venus TEXT,
  mars TEXT,
  jupiter TEXT,
  saturn TEXT,
  uranus TEXT,
  neptune TEXT,
  pluto TEXT,
  result TEXT,
  cosmic_lesson TEXT,
  cosmic_reward TEXT,
  personality_card TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_spreads_card_code ON life_spreads(card_code);

ALTER TABLE life_spreads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read" ON life_spreads FOR SELECT USING (true);
CREATE POLICY "Service role full" ON life_spreads FOR ALL USING (true);

-- Seed data
INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('AC', '3H', 'QC', '10S', '5C', '3D', 'AS', '7H', '7D', '5S', 'JH', '9C', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('AD', 'AH', 'QD', '5H', '3C', '3S', '9H', '7C', '5D', 'QS', 'JC', '9D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('AH', '8S', 'AD', 'QD', '5H', '3C', '3S', '9H', '7C', '5D', 'QS', 'JC', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('AS', '3D', '7H', '7D', '5S', 'JH', '9C', '9S', '2H', 'KH', 'KD', '6H', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('8C', 'JS', '6D', '4S', '10H', '10D', '8S', 'AH', 'AD', 'QD', '5H', '3C', NULL, '8Clubs (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('8D', '10C', 'KS', '3H', 'AC', 'QC', '10S', '5C', '3D', 'AS', '7H', '7D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('8H', '2S', '6C', '6S', 'QH', '10C', '8D', 'KS', '3H', 'AC', 'QC', '10S', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('8S', '10D', 'AH', 'AD', 'QD', '5H', '3C', '3S', '9H', '7C', '5D', 'QS', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('5C', '10S', '3D', 'AS', '7H', '7D', '5S', 'JH', '9C', '9S', '2H', 'KH', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('5D', '7C', 'QS', 'JC', '9D', '7S', '2C', 'KC', 'JD', '4H', '4D', '2S', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('5H', 'QD', '3C', '3S', '9H', '7C', '5D', 'QS', 'JC', '9D', '7S', '2C', NULL, 'Jack')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('5S', '7D', 'JH', '9C', '9S', '2H', 'KH', 'KD', '6H', '4C', '2D', 'JS', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('4C', '6H', '2D', 'JS', '8C', '6D', '4S', '10H', '10D', '8S', 'AS', 'AD', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('4D', '4H', '2S', '8H', '6C', '6S', 'QH', '10C', '8D', 'KS', '3H', 'AC', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('4H', 'JD', '4D', '2S', '8H', '6C', '6S', 'QH', '10C', '8D', 'KS', '3H', NULL, 'Jack')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('4S', '6D', '10H', '10D', '8S', 'AH', 'AD', 'QD', '5H', '3C', '3S', '9H', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('JC', 'QS', '9D', '7S', '2C', 'KC', 'JD', '4H', '4D', '2S', '8H', '6C', NULL, 'JClubs (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('JD', 'KC', '4H', '4D', '2S', '8H', '6C', '6S', 'QH', '10C', '8D', 'KS', NULL, 'JDiamonds (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('JH', '5S', '9C', '9S', '2H', 'KH', 'KD', '6H', '4C', '2D', 'JS', '8C', NULL, 'JHearts (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('JS', '2D', '8C', '6D', '4S', '10H', '10D', '8S', 'AH', 'AD', 'QD', '5H', NULL, 'JSpades (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('KC', '2C', 'JD', '4H', '4D', '2S', '8H', '6C', '6S', 'QH', '10C', '8D', NULL, 'KClubs (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('KD', 'KH', '6H', '4C', '2D', 'JS', '8C', '6D', '4S', '10H', '10D', '8S', NULL, 'KDiamonds (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('KH', '2H', 'KD', '6H', '4C', '2D', 'JS', '8C', '6D', '4S', '10S', '10D', NULL, 'KHearts (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('KS', '8D', '3H', 'AC', 'QC', '10S', '5C', '3D', 'AS', '7H', '7D', '5S', NULL, 'KSpades (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('9C', 'JH', '9S', '2H', 'KH', 'KD', '6H', '4C', '2D', 'JS', '8C', '6D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('9D', 'JC', '7S', '2C', 'KC', 'JD', '4H', '4D', '2S', '8H', '6C', '6S', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('9H', '3S', '7C', '5D', 'QS', 'JC', '9D', '7S', '2C', 'KC', 'JD', '4H', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('9S', '9C', '2H', 'KH', 'KD', '6H', '4C', '2D', 'JS', '8C', '6D', '4S', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('QC', 'AC', '10S', '5C', '3D', 'AS', '7H', '7D', '5S', 'JH', '9C', '9S', NULL, 'QClubs (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('QD', 'AD', '5H', '3C', '3S', '9H', '7C', '5D', 'QS', 'JC', '9D', '7S', NULL, 'QDiamonds (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('QH', '6S', '10C', '8D', 'KS', '3H', 'AC', 'QC', '10S', '5C', '3D', 'AS', NULL, 'QHearts (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('QS', '5D', 'JC', '9D', '7S', '2C', 'KC', 'JD', '4H', '4D', '2S', '8H', NULL, 'QSpades (Birth Card)')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('7C', '9H', '5D', 'QS', 'JC', '9D', '7S', '2C', 'KC', 'JD', '4H', '4D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('7D', '7H', '5S', 'JH', '9C', '9S', '2H', 'KH', 'KD', '6H', '4C', '2D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('7H', 'AS', '7D', '5S', 'JH', '9C', '9S', '2H', 'KH', 'KD', '6H', '4C', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('7S', '9D', '2C', 'KC', 'JD', '4H', '4D', '2S', '8H', '6C', '6S', 'QH', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('6C', '8H', '6S', 'QH', '10C', '8D', 'KS', '3H', 'AC', 'QC', '10S', '5C', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('6D', '8C', '4S', '10H', '10D', '8S', 'AH', 'AD', 'QD', '5H', '3C', '3S', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('6H', 'KD', '4C', '2D', 'JS', '8C', '6D', '4S', '10H', '10D', '8S', 'AH', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('6S', '6C', 'QH', '10C', '8D', 'KS', '3H', 'AC', 'QC', '10S', '5C', '3D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('10C', 'QH', '8D', 'KS', '3H', 'AC', 'QC', '10S', '5C', '3D', 'AS', '7H', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('10D', '10H', '8S', 'AH', 'AD', 'QD', '5H', '3C', '3S', '9H', '7C', '5D', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('10H', '4S', '10D', '8S', 'AH', 'AD', 'QD', '5H', '3C', '3S', '9H', '7C', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('10S', 'QC', '5C', '3D', 'AS', '7H', '7D', '5S', 'JH', '9C', '9S', '2H', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('3C', '5H', '3S', '9H', '7C', '5D', 'QS', 'JC', '9D', '7S', '2C', 'KC', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('3D', '5C', 'AS', '7H', '7D', '5S', 'JH', '9C', '9S', '2H', 'KH', 'KD', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('3H', 'KS', 'AC', 'QC', '10S', '5C', '3D', 'AS', '7H', '7D', '5S', 'JH', NULL, 'Jack')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('3S', '3C', '9H', '7C', '5D', 'QS', 'JC', '9D', '7S', '2C', 'KC', 'JD', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('2C', '7S', 'KC', 'JD', '4H', '4D', '2S', '8H', '6C', '6S', 'QH', '10C', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('2D', '4C', 'JS', '8C', '6D', '4S', '10H', '10D', '8S', 'AH', 'AD', 'QD', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('2H', '9S', 'KH', 'KD', '6H', '4C', '2D', 'JS', '8C', '6D', '4S', '10H', NULL, 'Jack')
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;

INSERT INTO life_spreads (card_code, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, cosmic_reward, personality_card)
VALUES ('2S', '4D', '8H', '6C', '6S', 'QH', '10C', '8D', 'KS', '3H', 'AC', 'QC', NULL, NULL)
ON CONFLICT (card_code) DO UPDATE SET moon=EXCLUDED.moon, mercury=EXCLUDED.mercury, venus=EXCLUDED.venus, mars=EXCLUDED.mars, jupiter=EXCLUDED.jupiter, saturn=EXCLUDED.saturn, uranus=EXCLUDED.uranus, neptune=EXCLUDED.neptune, pluto=EXCLUDED.pluto, result=EXCLUDED.result, cosmic_lesson=EXCLUDED.cosmic_lesson, cosmic_reward=EXCLUDED.cosmic_reward, personality_card=EXCLUDED.personality_card;
