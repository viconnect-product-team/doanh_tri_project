import { Search, X } from "lucide-react";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";

/** Search box + topic chips. `topics` excludes the "all" option; empty string = all. */
export function FilterBar({ q, onQ, topic, onTopic, topics, placeholder, count }: {
  q: string; onQ: (v: string) => void; topic: string; onTopic: (v: string) => void;
  topics: string[]; placeholder: string; count: number;
}) {
  const f = t.filter;
  const chip = (value: string, label: string) => (
    <Button key={value || "_all"} variant={topic === value ? "default" : "outline"} type="button" onClick={() => onTopic(value)} aria-pressed={topic === value}
      className="h-10 shrink-0 px-4 text-sm">
      {label}
    </Button>
  );
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input type="text" inputMode="search" enterKeyHint="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder={placeholder} aria-label={placeholder}
          className="w-full min-w-0 bg-transparent text-base outline-none sm:text-sm" />
        {q && <Button variant="ghost" size="icon" type="button" onClick={() => onQ("")} aria-label={f.clear} className="h-8 w-8 text-muted-foreground"><X className="h-4 w-4" /></Button>}
      </label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {chip("", f.all)}
        {topics.map((x) => chip(x, x))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{count} {f.results}</span>
        {(q || topic) && <Button variant="link" type="button" onClick={() => { onQ(""); onTopic(""); }} className="h-auto p-0 text-xs">{f.reset}</Button>}
      </div>
    </div>
  );
}

export function matches(q: string, ...fields: string[]) {
  const s = q.trim().toLowerCase();
  return !s || fields.join(" ").toLowerCase().includes(s);
}

export function EmptyResult() {
  return <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t.filter.empty}</p>;
}
