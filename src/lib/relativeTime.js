const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "week", seconds: 60 * 60 * 24 * 7 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

export function relativeTime(date) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return "";
  const diffSeconds = Math.round((t - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  for (const { unit, seconds } of UNITS) {
    if (abs >= seconds || unit === "second") {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "";
}
