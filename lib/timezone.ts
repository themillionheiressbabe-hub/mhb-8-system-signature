import { find } from "geo-tz";
import { DateTime } from "luxon";

export function localToUTC(
  dateStr: string,
  timeStr: string,
  lat: number,
  lng: number,
): Date {
  const timezones = find(lat, lng);
  const timezone = timezones[0] || "UTC";

  const localDt = DateTime.fromFormat(
    `${dateStr} ${timeStr}`,
    "yyyy-MM-dd HH:mm",
    { zone: timezone },
  );

  return localDt.toUTC().toJSDate();
}
