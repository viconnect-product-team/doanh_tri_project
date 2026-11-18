import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { memberUpdate } from "@/lib/member-management";
import { memberIsActive } from "@/lib/member-access";
import { L } from "@/lib/localized";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Member = Database["public"]["Tables"]["member_profiles"]["Row"];
type Plan = Database["public"]["Tables"]["membership_plans"]["Row"];
const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-sm";

export function MemberDirectory({ members, plans, emails, onRecords }: { members: Member[]; plans: Plan[]; emails: { id: string; email: string }[]; onRecords: (id: string) => void }) {
  const c = t.memberManagement;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const status = (m: Member) => m.approval_status !== "approved" ? "pending" : !m.active ? "suspended" : memberIsActive(m, today) ? "active" : "inactive";
  const visible = members.filter(m => (filter === "all" || status(m) === filter) && [m.full_name, m.organization, m.phone, plans.find(p => p.id === m.tier_id)?.title, emails.find(r => r.id === m.registration_request_id)?.email].join(" ").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{c.title} <span className="text-muted-foreground">({members.length})</span></h2></div>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="relative"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input className={`${field} pl-10`} value={search} onChange={e => setSearch(e.target.value)} placeholder={c.search} aria-label={c.search} /></label>
      <select className={field} value={filter} onChange={e => setFilter(e.target.value)} aria-label={t.memberPage.status}>{Object.entries(c.filters).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
    </div>
    <p role="status" className="text-sm">{message}</p>
    <div className="divide-y divide-border border-y border-border">
      {visible.map(m => <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="min-w-0 space-y-1"><p className="break-words font-semibold">{m.full_name}</p><p className="break-words text-sm">{plans.find(p => p.id === m.tier_id) ? L(plans.find(p => p.id === m.tier_id) ?? {}, "title") : m.tier_id} · {c.filters[status(m)]}</p><p className="break-words text-sm text-muted-foreground">{[m.organization, m.phone, emails.find(r => r.id === m.registration_request_id)?.email].filter(Boolean).join(" · ")}</p><p className="text-sm text-muted-foreground">{m.starts_on ?? t.memberPage.unspecified} – {m.ends_on ?? t.memberPage.unspecified}</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setEditing(m); setMessage(""); }}><Pencil className="size-4" />{c.edit}</Button><Button variant="outline" onClick={() => onRecords(m.id)}>{t.member.records}</Button></div>
      </div>)}
      {!visible.length && <p className="py-8 text-center text-muted-foreground">{c.empty}</p>}
    </div>
    <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) setEditing(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>{c.edit}</DialogTitle><DialogDescription>{editing?.full_name}</DialogDescription>
      {editing && <form key={editing.id} className="grid gap-4 sm:grid-cols-2" onSubmit={async e => {
        e.preventDefault(); const fd = new FormData(e.currentTarget); setBusy(true); setMessage("");
        try {
          const values = memberUpdate({ full_name: fd.get("full_name"), organization: fd.get("organization"), phone: fd.get("phone"), tier_id: fd.get("tier_id"), starts_on: fd.get("starts_on") || null, ends_on: fd.get("ends_on") || null, active: fd.get("active") === "true", approval_status: fd.get("approval_status") }, editing, new Date().toISOString());
          const { data, error } = await supabase.from("member_profiles").update(values).eq("id", editing.id).select("id").single();
          if (error || !data) throw error;
          await Promise.all([qc.invalidateQueries({ queryKey: ["cms-members"] }), qc.invalidateQueries({ queryKey: ["member-dashboard"] }), qc.invalidateQueries({ queryKey: ["member-access"] })]);
          setEditing(null); setMessage(t.cms.saved);
        } catch { setMessage(c.error); } finally { setBusy(false); }
      }}>
        {(["full_name", "organization", "phone", "starts_on", "ends_on"] as const).map(name => <label key={name} className="text-sm">{t.member.fields[name]}<input className={field} name={name} defaultValue={editing[name] ?? ""} required={name === "full_name"} type={name.endsWith("_on") ? "date" : name === "phone" ? "tel" : "text"} /></label>)}
        <label className="text-sm">{t.member.fields.tier_id}<select className={field} name="tier_id" defaultValue={editing.tier_id} required>{plans.map(p => <option key={p.id} value={p.id}>{L(p, "title")}</option>)}</select></label>
        <label className="text-sm">{c.approval}<select className={field} name="approval_status" defaultValue={editing.approval_status}><option value="pending">{t.memberPage.pendingApproval}</option><option value="approved">{t.memberPage.approved}</option></select></label>
        <label className="text-sm">{c.accountState}<select className={field} name="active" defaultValue={String(editing.active)}><option value="true">{t.member.enable}</option><option value="false">{t.member.disable}</option></select></label>
        <p role="alert" className="text-sm text-destructive sm:col-span-2">{message}</p><Button disabled={busy} className="sm:col-span-2">{busy ? c.saving : t.cms.save}</Button>
      </form>}
    </DialogContent></Dialog>
  </section>;
}