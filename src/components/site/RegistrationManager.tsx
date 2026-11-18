import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { t, getLocale } from "@/content/i18n";
import { LEAD_STATUSES } from "@/lib/leads.functions";
import { filterRegistrations, registrationQuantity, type Registration } from "@/lib/registrations";

const registrationsQuery = queryOptions({
  queryKey: ["leads", "registrations"],
  queryFn: async () => {
    const rows: Registration[] = [];
    // Fetch every page rather than silently truncating registration history.
    for (let start = 0; ; start += 1000) {
      const { data, error } = await supabase.from("leads").select("*").eq("source", "course")
        .order("created_at", { ascending: false }).order("id").range(start, start + 999);
      if (error) throw new Error(error.message);
      rows.push(...data);
      if (data.length < 1000) return rows;
    }
  },
});

export function RegistrationManager() {
  const c = t.cms.registrations;
  const { data: registrations } = useSuspenseQuery(registrationsQuery);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [pending, setPending] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const rows = filterRegistrations(registrations, status, search);

  async function changeStatus(row: Registration, next: Registration["status"]) {
    setPending((ids) => [...ids, row.id]);
    setNotice(null);
    try {
      const { error } = await supabase.from("leads").update({ status: next }).eq("id", row.id)
        .eq("source", "course").select("id,status").single();
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["leads"] });
      setNotice({ error: false, text: c.saved });
    } catch {
      setNotice({ error: true, text: c.error });
    } finally {
      setPending((ids) => ids.filter((id) => id !== row.id));
    }
  }

  return (
    <section className="mt-6 min-w-0" aria-label={t.cms.tabs.registrations}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} aria-label={c.search} placeholder={c.search}
            className="min-w-0 w-full bg-transparent py-3 text-sm outline-none" />
        </label>
        <select aria-label={c.status} value={status} onChange={(e) => setStatus(e.target.value)}
          className="min-h-12 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">{t.filter.all}</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{t.crm.status[s]}</option>)}
        </select>
      </div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">{rows.length} / {registrations.length} {c.total}</p>
        <Button variant="outline" asChild><Link to="/crm">{t.crm.tracking}</Link></Button>
        {notice && <p role={notice.error ? "alert" : "status"} className={notice.error ? "text-destructive" : "text-brand-green"}>{notice.text}</p>}
      </div>
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_80px_120px_170px] gap-4 border-b border-border bg-muted px-4 py-3 text-xs font-medium text-muted-foreground lg:grid">
        <span>{c.learner}</span><span>{c.course}</span><span>{c.quantity}</span><span>{c.date}</span><span>{c.status}</span>
      </div>
      {rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">{registrations.length ? c.noResults : c.empty}</p>}
      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const quantity = registrationQuantity(row.message);
          return (
            <li key={row.id} className="grid min-w-0 grid-cols-2 items-start gap-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_80px_120px_170px] lg:px-4">
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="break-words font-semibold text-navy">{row.full_name}</p>
                <p className="break-all text-sm text-muted-foreground">{row.email}</p>
                {row.phone && <p className="text-sm text-muted-foreground">{row.phone}</p>}
                {row.organization && <p className="break-words text-xs text-muted-foreground">{row.organization}</p>}
              </div>
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="mb-1 text-xs text-muted-foreground lg:hidden">{c.course}</p>
                <p className="break-words text-sm text-foreground">{row.interest || "—"}</p>
              </div>
              <div><p className="mb-1 text-xs text-muted-foreground lg:hidden">{c.quantity}</p><p className="text-sm font-medium">{quantity ?? c.unknownQuantity}</p></div>
              <div><p className="mb-1 text-xs text-muted-foreground lg:hidden">{c.date}</p><p className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleDateString(getLocale() === "en" ? "en-GB" : "vi-VN")}</p></div>
              <label className="col-span-2 min-w-0 lg:col-span-1">
                <span className="mb-1 block text-xs text-muted-foreground lg:hidden">{c.status}</span>
                <select aria-label={`${c.status}: ${row.full_name}`} value={row.status} disabled={pending.includes(row.id)}
                  onChange={(e) => changeStatus(row, e.target.value as Registration["status"])}
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{t.crm.status[s]}</option>)}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}