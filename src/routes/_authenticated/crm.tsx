import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { listLeads, updateLead, LEAD_STATUSES } from "@/lib/leads.functions";
import { supabase } from "@/integrations/supabase/client";
import { t, getLocale } from "@/content/i18n";
import { Button } from "@/components/ui/button";
import { registrationQuantity } from "@/lib/registrations";

const leadsQuery = queryOptions({ queryKey: ["leads"], queryFn: () => listLeads() });

export const Route = createFileRoute("/_authenticated/crm")({
  head: () => ({
    meta: [
      { title: "CRM khách hàng – Viện Doanh Trí" },
      { name: "description", content: "Quản lý khách hàng tiềm năng và trạng thái tư vấn." },
      { property: "og:title", content: "CRM khách hàng – Viện Doanh Trí" },
      { property: "og:description", content: "Quản lý khách hàng tiềm năng và trạng thái tư vấn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: Crm,
  errorComponent: ({ error }) => <p className="p-10 text-destructive">{t.crm.loadError}: {String((error as Error)?.message ?? error)}</p>,
});

type Status = (typeof LEAD_STATUSES)[number];
const statusTone: Record<Status, string> = {
  new: "bg-accent text-primary",
  contacted: "bg-secondary text-secondary-foreground",
  consulting: "bg-primary/10 text-primary",
  enrolled: "bg-brand-green/10 text-brand-green",
  lost: "bg-muted text-muted-foreground",
};

function Crm() {
  const c = t.crm;
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const qc = useQueryClient();
  const nav = useNavigate();
  const update = useServerFn(updateLead);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState("");

  const rows = useMemo(() => leads.filter((l) =>
    (filter === "all" || l.status === filter) &&
    `${l.full_name} ${l.email} ${l.phone ?? ""} ${l.organization ?? ""} ${l.requests.map((r) => `${r.interest ?? ""} ${r.message ?? ""}`).join(" ")}`.toLowerCase().includes(q.toLowerCase())), [leads, filter, q]);

  async function save(id: string, patch: { status?: Status; notes?: string }) {
    setPending((ids) => [...ids, id]); setError("");
    try {
      await update({ data: { id, ...patch } });
      await qc.invalidateQueries({ queryKey: ["leads"] });
    } catch { setError(c.error); throw new Error(c.error); }
    finally { setPending((ids) => ids.filter((value) => value !== id)); }
  }
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads.length} {c.total}</p>
        </div>
        <div className="flex shrink-0 gap-2"><Link to="/cms" className="rounded-md border border-border px-4 py-2.5 text-sm hover:bg-muted">{t.cms.toCms}</Link>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm"><LogOut className="h-4 w-4" />{c.signOut}</button></div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LEAD_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-xl border p-4 text-left transition ${filter === s ? "border-primary bg-accent" : "border-border bg-card"}`}>
            <p className="text-2xl font-semibold text-navy">{leads.filter((l) => l.status === s).length}</p>
            <p className="text-xs text-muted-foreground">{c.status[s]}</p>
          </button>
        ))}
      </div>

      <label className="mt-6 flex items-center gap-2 rounded-md border border-input px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.search} className="w-full bg-transparent text-sm outline-none" />
      </label>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-6 space-y-3">
        {rows.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{c.empty}</p>}
        {rows.map((l) => {
          const open = openId === l.id;
          return (
            <div key={l.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Button variant="ghost" onClick={() => setOpenId(open ? null : l.id)} aria-expanded={open} className="h-auto min-w-0 flex-col items-start whitespace-normal p-0 text-left">
                  <p className="font-semibold text-navy">{l.full_name} {l.organization && <span className="font-normal text-muted-foreground">· {l.organization}</span>}</p>
                  <p className="break-all text-sm text-muted-foreground">{l.email}{l.phone ? ` · ${l.phone}` : ""}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{[...new Set(l.requests.map((r) => c.source[r.source as keyof typeof c.source] ?? r.source))].join(" · ")} · {l.requests.length} {c.requests}</p>
                </Button>
                <div className="flex items-center gap-3">
                  <span className="max-w-[220px] break-words text-xs text-muted-foreground">{[...new Set(l.requests.map((r) => r.interest).filter(Boolean))].join(" · ")}</span>
                  <select aria-label={`${c.progress}: ${l.full_name}`} disabled={pending.includes(l.id)} value={l.status} onChange={(e) => { void save(l.id, { status: e.target.value as Status }).catch(() => {}); }}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${statusTone[l.status as Status]}`}>
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{c.status[s]}</option>)}
                  </select>
                </div>
              </div>
              {open && (
                <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                  <h2 className="font-medium text-navy">{c.history}</h2>
                  <ul className="divide-y divide-border">
                    {l.requests.map((request) => {
                      const ai = request.ai_suggestions as { summary?: string; recommendations?: { name: string }[] } | null;
                      return <li key={request.id} className="space-y-2 py-3">
                        <p className="text-xs text-muted-foreground">{c.source[request.source as keyof typeof c.source] ?? request.source} · {new Date(request.created_at).toLocaleString(getLocale() === "en" ? "en-GB" : "vi-VN")}</p>
                        {request.interest && <p className="font-medium">{request.interest}</p>}
                        {request.source === "course" && <p>{t.cms.registrations.quantity}: {registrationQuantity(request.message) ?? t.cms.registrations.unknownQuantity}</p>}
                        {request.message && <p className="whitespace-pre-wrap break-words">{request.message}</p>}
                        {ai?.recommendations && <p><b>{c.ai}:</b> {ai.recommendations.map((r) => r.name).join(", ")}</p>}
                        {request.notes && <p className="whitespace-pre-wrap">{request.notes}</p>}
                      </li>;
                    })}
                  </ul>
                  <NotesEditor initial={l.notes ?? ""} onSave={(notes) => save(l.id, { notes })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (v: string) => Promise<void> }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <textarea value={v} onChange={(e) => { setV(e.target.value); setSaved(false); }} rows={3} maxLength={5000} placeholder={t.crm.notesPh}
        className="w-full rounded-md border border-input bg-background p-3 outline-none focus:border-primary" />
      <Button onClick={async () => { try { await onSave(v); setSaved(true); } catch { setSaved(false); } }} className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">{saved ? t.crm.saved : t.crm.saveNotes}</Button>
    </div>
  );
}
