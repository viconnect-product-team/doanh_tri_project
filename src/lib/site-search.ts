import type { Course, Post, Expert, EventRow } from "./cms.functions";
import { vi, type Dict } from "@/content/vi";
import { en } from "@/content/en";

export type SearchKind = "courses" | "experts" | "events" | "posts" | "pages";
export type SearchPath = "/" | "/ve-vien" | "/nghien-cuu" | "/dao-tao" | "/tu-van" | "/mang-luoi" | "/tin-tuc" | "/lien-he" | "/tu-van-ai";
export type SearchEntry = { id: string; kind: SearchKind; title: string; text: string; searchable: string; to: SearchPath; hash?: string };
export type SearchContent = { courses: Course[]; posts: Post[]; experts: Expert[]; events: EventRow[] };

export function normalizeSearch(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim();
}

function plain(text: string) { return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
function strings(value: unknown): string[] {
  if (typeof value === "string") return value.startsWith("/") ? [] : [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}
function pageSections(d: Dict): Array<{ to: SearchPath; title: string; content: unknown }> {
  const { programs: _programs, register: _register, ...training } = d.training;
  const { experts: _experts, ...network } = d.network;
  const { events: _events, upcoming: _upcoming, ...news } = d.news;
  return [
    { to: "/", title: d.common.home, content: [d.brand, d.home, d.pillars] },
    { to: "/ve-vien", title: `${d.about.title} ${d.about.titleEm}`, content: d.about },
    { to: "/nghien-cuu", title: `${d.research.title} ${d.research.titleEm}`, content: d.research },
    { to: "/dao-tao", title: d.training.title, content: training },
    { to: "/tu-van", title: `${d.consulting.title} ${d.consulting.titleEm}`, content: d.consulting },
    { to: "/mang-luoi", title: `${d.network.title} ${d.network.titleEm}`, content: [network, d.community] },
    { to: "/tin-tuc", title: d.nav.find(n => n.to === "/tin-tuc")?.label ?? news.title, content: news },
    { to: "/lien-he", title: `${d.contact.title} ${d.contact.titleEm}`, content: [d.contact.lead, d.contact.topics] },
    { to: "/tu-van-ai", title: d.advisor.navLabel, content: [d.advisor.title, d.advisor.lead] },
  ];
}

export function buildSearchIndex(content: SearchContent, locale: "vi" | "en"): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const configs: Array<{ kind: Exclude<SearchKind, "pages">; rows: Array<Course | Post | Expert | EventRow>; title: string; fields: string[]; to: SearchPath }> = [
    { kind: "courses", rows: content.courses, title: "title", fields: ["description", "tag", "duration", "start_date"], to: "/dao-tao" },
    { kind: "experts", rows: content.experts, title: "name", fields: ["role", "org", "bio", "category"], to: "/mang-luoi" },
    { kind: "events", rows: content.events, title: "title", fields: ["description", "tag", "topic", "place", "mode", "event_date"], to: "/tin-tuc" },
    { kind: "posts", rows: content.posts, title: "title", fields: ["excerpt", "body", "tag"], to: "/tin-tuc" },
  ];
  for (const c of configs) for (const row of c.rows) {
    if (!row.published) continue;
    const r = row as Record<string, unknown>;
    const read = (key: string) => plain(String(locale === "en" && r[`${key}_en`] ? r[`${key}_en`] : r[key] ?? ""));
    const fields = [c.title, ...c.fields];
    entries.push({ id: `${c.kind}-${row.id}`, kind: c.kind, title: read(c.title), text: c.fields.map(read).filter(Boolean).join(" · "), searchable: fields.flatMap(f => [plain(String(r[f] ?? "")), plain(String(r[`${f}_en`] ?? ""))]).join(" "), to: c.to, hash: `${c.kind}-${row.id}` });
  }
  const pages = pageSections(locale === "vi" ? vi : en);
  const other = pageSections(locale === "vi" ? en : vi);
  pages.forEach((p, i) => {
    const text = strings(p.content).join(" · ");
    entries.push({ id: p.to, kind: "pages", title: p.title, text, searchable: [p.title, text, ...strings(other[i]?.content)].join(" "), to: p.to });
  });
  return entries;
}

export function searchSite(entries: SearchEntry[], query: string, kind?: SearchKind) {
  const q = normalizeSearch(query);
  if (!q) return [];
  const tokens = words(q);
  if (!tokens.length) return [];
  return entries.filter(e => (!kind || e.kind === kind) && tokens.every(token => words(normalizeSearch(`${e.title} ${e.searchable}`)).some(word => word === token || (token.length >= 3 && word.startsWith(token)))))
    .sort((a, b) => score(b.title, q, tokens) - score(a.title, q, tokens));
}
function words(text: string) { return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean); }
function score(title: string, query: string, tokens: string[]) {
  const normalized = normalizeSearch(title);
  const titleWords = words(normalized);
  return (normalized === query ? 100 : tokens.every(t => titleWords.includes(t)) ? 50 : 0) + tokens.filter(t => titleWords.includes(t)).length;
}
export function searchSnippet(text: string, query: string) {
  const normalized = normalizeSearch(text);
  const tokens = normalizeSearch(query).split(" ").filter(Boolean);
  const at = tokens.map(t => Array.from(normalized.matchAll(/[\p{L}\p{N}]+/gu)).find(m => m[0] === t || (t.length >= 3 && m[0].startsWith(t)))?.index ?? -1).find(i => i >= 0) ?? 0;
  const start = Math.max(0, at - 55);
  return `${start ? "…" : ""}${text.slice(start, start + 190)}${text.length > start + 190 ? "…" : ""}`;
}