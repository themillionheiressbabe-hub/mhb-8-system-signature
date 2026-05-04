import { getMoonData } from "../lib/astrology/ephemeris";

const moon = getMoonData(new Date());
console.log(JSON.stringify(moon, null, 2));
