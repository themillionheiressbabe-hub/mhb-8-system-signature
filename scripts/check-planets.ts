import { getAllPlanets } from "../lib/astrology/ephemeris";

const planets = getAllPlanets(new Date());
for (const p of planets) {
  console.log(
    `${p.name.padEnd(8)} ${p.symbol}  ${p.sign.padEnd(11)} ${String(p.degree).padStart(2)}°${String(p.minutes).padStart(2, "0")}'${p.isRetrograde ? " ℞" : ""}`,
  );
}
