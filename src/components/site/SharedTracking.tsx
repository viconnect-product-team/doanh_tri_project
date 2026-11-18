import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Search, Sparkles, MessagesSquare, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocale, t } from "@/content/i18n";
import { listLeads, updateLead, LEAD_STATUSES } from "@/lib/leads.functions";
import { filterTrackedCustomers, TRACKING_SOURCES, type Customer, type TrackingSource } from "@/lib/customers";
import { registrationQuantity } from "@/lib/registrations";

const trackingQuery = queryOptions({ queryKey: ["leads"], queryFn: () => listLeads() });
const sourceIcons = { ai_advisor: Sparkles, consulting: MessagesSquare, course: GraduationCap, community: Users };
const sourceTones = { ai_advisor: "bg-accent text-primary", consulting: "bg-secondary text-secondary-foreground", course: "bg-brand-green/10 text-brand-green", community: "bg-accent text-primary" };
const date = (value: string) => new Date(value).toLocaleDateString(getLocale() === "en" ? "en-GB" : "vi-VN");

export function SharedTracking() {
  const { data: customers } = useSuspenseQuery(trackingQuery);
  const qc = useQueryClient();
  const update = useServerFn(updateLead);
  const [source, setSource] = useState<TrackingSource | "all">("all");
  const [status, setStatus] = useState<Customer["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const rows = filterTrackedCustomers(customers, source, status, search);
  const all = filterTrackedCustomers(customers, "all", "all", "");
  const sourceRows = filterTrackedCustomers(customers, source, "all", search);

  async function save(id: string, patch: { status?: Customer["status"]; notes?: string }) {
    setPending((ids) => [...ids, id]); setNotice(null);
    try {
      await update({ data: { id, ...patch } });
      await qc.invalidateQueries({ queryKey: ["leads"] });
      setNotice({ error: false, text: t.crm.saved });
      return true;
    } catch { setNotice({ error: true, text: t.crm.error }); return false; }
    finally { setPending((ids) => ids.filter((value) => value !== id)); }
  }

  return <section className="mt-6 min-w-0" aria-label={t.cms.tabs.tracking}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-xl font-semibold text-navy">{t.cms.tabs.tracking} <span className="font-sans text-sm font-normal text-muted-foreground">{all.length} {t.crm.total}</span></h2>
      <Button variant="outline" onClick={() => { void qc.invalidateQueries({ queryKey: ["leads"] }); }}><RefreshCw />{t.cms.tracking.refresh}</Button>
    </div>
    <div className="mt-5 flex flex-wrap gap-2" aria-label={t.crm.sourceLabel}>
      <Button variant={source === "all" ? "default" : "outline"} aria-pressed={source === "all"} onClick={() => setSource("all")}>{t.filter.all} <span>{all.length}</span></Button>
      {TRACKING_SOURCES.map((s) => { const Icon = sourceIcons[s]; return <Button key={s} variant={source === s ? "default" : "outline"} aria-pressed={source === s} onClick={() => setSource(s)}><Icon />{t.crm.source[s]} <span>{filterTrackedCustomers(all, s, "all", "").length}</span></Button>; })}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {LEAD_STATUSES.map((s) => <Button key={s} variant="outline" aria-pressed={status === s} onClick={() => setStatus(status === s ? "all" : s)} className={`h-auto min-h-16 flex-col items-start gap-1 whitespace-normal p-3 ${status === s ? "border-primary bg-accent" : ""}`}><span className="text-xl font-semibold text-navy">{sourceRows.filter((c) => c.status === s).length}</span><span className="text-xs">{t.crm.status[s]}</span></Button>)}
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
      <label className="flex min-w-0 items-center gap-2 rounded-md border border-input px-3"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label={t.crm.search} placeholder={t.crm.search} value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-12 min-w-0 w-full bg-transparent text-sm outline-none" /></label>
      <select aria-label={t.crm.progress} value={status} onChange={(e) => setStatus(e.target.value as Customer["status"] | "all")} className="min-h-12 rounded-md border border-input bg-background px-3 text-sm"><option value="all">{t.filter.all}</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{t.crm.status[s]}</option>)}</select>
    </div>
    <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">{rows.length} {t.crm.total}</p>
      {(source !== "all" || status !== "all" || search) && <Button variant="ghost" onClick={() => { setSource("all"); setStatus("all"); setSearch(""); }}>{t.filter.reset}</Button>}
      {notice && <p role={notice.error ? "alert" : "status"} className={notice.error ? "text-destructive" : "text-brand-green"}>{notice.text}</p>}
    </div>
    <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_170px_44px] gap-4 border-b border-border bg-muted p-3 text-xs font-medium text-muted-foreground lg:grid"><span>{t.crm.customer}</span><span>{t.crm.sourceLabel}</span><span>{t.crm.interests}</span><span>{t.crm.progress}</span><span /></div>
    {!rows.length && <p className="py-12 text-center text-sm text-muted-foreground">{all.length ? t.cms.tracking.noResults : t.cms.tracking.empty}</p>}
    <ul className="divide-y divide-border">{rows.map((customer) => {
      const sources = TRACKING_SOURCES.filter((s) => customer.requests.some((r) => r.source === s));
      return <li key={customer.id} className="py-5 lg:px-3">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_170px_44px]">
          <div className="min-w-0"><p className="break-words font-semibold text-navy">{customer.full_name}</p><p className="break-all text-sm text-muted-foreground">{customer.email}</p>{customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}{customer.organization && <p className="break-words text-xs text-muted-foreground">{customer.organization}</p>}<p className="mt-1 text-xs text-muted-foreground">{t.cms.tracking.updated}: {date(customer.updated_at)}</p></div>
          <div className="flex flex-wrap content-start gap-1.5">{sources.map((s) => { const Icon = sourceIcons[s]; return <span key={s} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${sourceTones[s]}`}><Icon className="h-3 w-3" />{t.crm.source[s]}</span>; })}</div>
          <div className="min-w-0"><p className="break-words text-sm">{[...new Set(customer.requests.map((r) => r.interest).filter(Boolean))].join(" · ") || "—"}</p><p className="mt-1 text-xs text-muted-foreground">{customer.requests.length} {t.crm.requests}</p></div>
          <select aria-label={`${t.crm.progress}: ${customer.full_name}`} value={customer.status} disabled={pending.includes(customer.id)} onChange={(e) => { void save(customer.id, { status: e.target.value as Customer["status"] }); }} className="min-h-11 w-full self-start rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60">{LEAD_STATUSES.map((s) => <option key={s} value={s}>{t.crm.status[s]}</option>)}</select>
          <Button variant="ghost" aria-expanded={open === customer.id} aria-label={`${t.cms.tracking.detail}: ${customer.full_name}`} title={t.cms.tracking.detail} onClick={() => setOpen(open === customer.id ? null : customer.id)} className="h-11 w-11">{open === customer.id ? <ChevronUp /> : <ChevronDown />}</Button>
        </div>
        {open === customer.id && <div className="mt-5 border-t border-border pt-4"><h3 className="font-medium text-navy">{t.crm.history}</h3><ul className="mt-2 divide-y divide-border">{customer.requests.map((request) => {
          const ai = request.ai_suggestions as { summary?: string; recommendations?: { name: string }[] } | null;
          return <li key={request.id} className="space-y-2 py-3 text-sm"><p className="text-xs text-muted-foreground">{t.crm.source[request.source as keyof typeof t.crm.source] ?? request.source} · {date(request.created_at)}</p><p className="font-medium">{request.interest}</p>{request.source === "course" && <p>{t.cms.registrations.quantity}: {registrationQuantity(request.message) ?? t.cms.registrations.unknownQuantity}</p>}{request.message && <p className="whitespace-pre-wrap break-words">{request.message}</p>}{ai?.summary && <p>{ai.summary}</p>}{ai?.recommendations && <p>{t.crm.ai}: {ai.recommendations.map((r) => r.name).join(", ")}</p>}{request.notes && <p className="whitespace-pre-wrap">{request.notes}</p>}</li>;
        })}</ul><TrackingNotes key={customer.notes} initial={customer.notes ?? ""} busy={pending.includes(customer.id)} onSave={(notes) => save(customer.id, { notes })} /></div>}
      </li>;
    })}</ul>
  </section>;
}

function TrackingNotes({ initial, busy, onSave }: { initial: string; busy: boolean; onSave: (notes: string) => Promise<boolean> }) {
  const [notes, setNotes] = useState(initial);
  return <div className="mt-4"><textarea aria-label={t.crm.notesPh} placeholder={t.crm.notesPh} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={5000} className="w-full rounded-md border border-input bg-background p-3 text-sm" /><Button disabled={busy} onClick={() => { void onSave(notes); }} className="mt-2">{busy ? t.cms.saving : t.crm.saveNotes}</Button></div>;
}