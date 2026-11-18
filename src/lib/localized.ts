import { getLocale } from "@/content/i18n";

/** Reads `field` or `field_en` (falls back to Vietnamese when English is empty). */
export function L<T extends Record<string, unknown>>(row: T, field: string): string {
  if (getLocale() === "en") {
    const en = row[`${field}_en`];
    if (typeof en === "string" && en.trim()) return en;
  }
  const v = row[field];
  return typeof v === "string" ? v : "";
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  // Explicit formatting avoids server/browser ICU differences during hydration.
  const locale = getLocale();
  if (locale === "vi") return `${iso.slice(8, 10)} tháng ${Number(iso.slice(5, 7))}, ${iso.slice(0, 4)}`;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
}
