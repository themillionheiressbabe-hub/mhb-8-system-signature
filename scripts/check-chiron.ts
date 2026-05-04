import * as sweph from "sweph";

sweph.set_ephe_path("");

const SEFLG_MOSEPH = sweph.constants.SEFLG_MOSEPH;
const SEFLG_SPEED = sweph.constants.SEFLG_SPEED;

const date = new Date();
const jd = sweph.julday(
  date.getUTCFullYear(),
  date.getUTCMonth() + 1,
  date.getUTCDate(),
  date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600,
  sweph.constants.SE_GREG_CAL,
);

const flagSets = [
  ["MOSEPH | SPEED", SEFLG_MOSEPH | SEFLG_SPEED],
  ["SPEED only (default SWIEPH)", SEFLG_SPEED],
  ["0 (default)", 0],
] as const;

for (const [label, flags] of flagSets) {
  try {
    const result = sweph.calc_ut(jd, sweph.constants.SE_CHIRON, flags);
    console.log(label, "→", JSON.stringify(result));
  } catch (err) {
    console.log(label, "→ THROW:", err);
  }
}
