import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowUpRight, BookOpen, CalendarDays, UserRound, FileText, Globe, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t, useLocale } from "@/content/i18n";
import { publicContentQuery } from "@/lib/cms.functions";
import { buildSearchIndex, searchSite, searchSnippet, type SearchKind } from "@/lib/site-search";

const icons = { courses: BookOpen, experts: UserRound, events: CalendarDays, posts: FileText, pages: Globe };
const kinds: SearchKind[] = ["courses", "experts", "events", "posts", "pages"];

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>();
  const locale = useLocale();
  const { data, isPending, isError, refetch } = useQuery({ ...publicContentQuery, enabled: open });
  const index = useMemo(() => buildSearchIndex(data ?? { courses: [], experts: [], events: [], posts: [] }, locale), [data, locale]);
  const all = useMemo(() => searchSite(index, query), [index, query]);
  const results = kind ? all.filter(r => r.kind === kind) : all;
  const s = t.siteSearch;
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={s.open} title={s.open}><Search className="h-5 w-5" /></Button></DialogTrigger>
    <DialogContent aria-describedby={undefined} className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg p-0">
      <div className="border-b border-border p-5">
        <DialogTitle className="pr-6 font-display text-lg font-semibold tracking-normal">{s.title}</DialogTitle>
        <div className="mt-4 flex items-center gap-3 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-5 w-5 shrink-0 text-primary" />
          <input aria-label={s.title} placeholder={s.placeholder} value={query} maxLength={200} onChange={e => setQuery(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          {query && <Button variant="ghost" size="icon" aria-label={t.filter.clear} onClick={() => setQuery("")} className="h-9 w-9 shrink-0"><X className="h-4 w-4" /></Button>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-border p-3">
        <Button size="sm" variant={kind ? "ghost" : "default"} aria-pressed={!kind} onClick={() => setKind(undefined)}>{t.filter.all}</Button>
        {kinds.map(k => <Button key={k} size="sm" variant={kind === k ? "default" : "ghost"} aria-pressed={kind === k} onClick={() => setKind(k)} className="shrink-0">{s.kinds[k]}</Button>)}
      </div>
      <div className="min-h-40 overflow-y-auto overscroll-contain p-4" aria-live="polite">
        {isPending ? <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{s.loading}</p>
          : isError ? <div className="py-8 text-center"><p className="text-sm text-destructive">{s.error}</p><Button variant="outline" className="mt-3" onClick={() => refetch()}>{s.retry}</Button></div>
          : !query.trim() ? <div className="flex flex-wrap justify-center gap-2 py-8">{s.suggestions.map(word => <Button key={word} variant="outline" onClick={() => setQuery(word)}>{word}</Button>)}</div>
          : <><p className="mb-3 text-xs text-muted-foreground">{results.length} {t.filter.results}</p>
            {!results.length && <p className="py-8 text-center text-sm text-muted-foreground">{t.filter.empty}</p>}
            <ul className="divide-y divide-border">{results.map(r => { const Icon = icons[r.kind]; return <li key={r.id}>
              <Link to={r.to} hash={r.hash ?? ""} onClick={() => setOpen(false)} className="group flex gap-3 rounded-md px-2 py-4 transition-colors hover:bg-muted focus-visible:bg-muted">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1"><p className="text-[11px] font-medium text-muted-foreground">{s.kinds[r.kind]}</p><p className="mt-1 break-words text-sm font-semibold text-foreground group-hover:text-primary">{r.title}</p><p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{searchSnippet(r.text, query)}</p></div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>; })}</ul>
          </>}
      </div>
    </DialogContent>
  </Dialog>;
}