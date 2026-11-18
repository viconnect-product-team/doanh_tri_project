import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { issueMemberAccount } from "@/lib/members.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";
import { t } from "@/content/i18n";
import { MemberDirectory } from "@/components/site/MemberDirectory";

const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-sm";
export function MemberManager() {
  const c = t.member;
  const qc = useQueryClient();
  const issue = useServerFn(issueMemberAccount);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState("");
  const { data: requests = [] } = useQuery({ queryKey: ["cms-membership-requests"], queryFn: async () => {
    const { data, error } = await supabase.from("leads").select("id,full_name,email,phone,organization,membership_tier").eq("source", "community").not("membership_tier", "is", null).order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const request = requests.find(r => r.id === requestId);
  const { data: plans = [] } = useQuery({ queryKey: ["cms", "membership_plans"], queryFn: async () => {
    const { data, error } = await supabase.from("membership_plans").select("*").order("sort_order");
    if (error) throw error; return data;
  } });
  const { data: members = [], isPending: membersLoading, error: membersError } = useQuery({ queryKey: ["cms-members"], queryFn: async () => {
    const { data, error } = await supabase.from("member_profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const [selected, setSelected] = useState("");
  const { data: records = [] } = useQuery({ queryKey: ["cms-member-records", selected], enabled: !!selected, queryFn: async () => {
    const { data, error } = await supabase.from("member_records").select("*").eq("member_id", selected).order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  return <div className="mt-8 space-y-8">
    {membersError ? <p role="alert" className="text-destructive">{t.memberManagement.error}</p> : membersLoading ? <p role="status">{t.memberManagement.loading}</p> : <MemberDirectory members={members} plans={plans} emails={requests} onRecords={setSelected} />}
    <label className="block text-sm">{t.memberPage.adminRequest}<select value={requestId} onChange={e => setRequestId(e.target.value)} className={field}><option value="">{t.memberPage.manual}</option>{requests.filter(r => !members.some(m => m.registration_request_id === r.id)).map(r => <option key={r.id} value={r.id}>{r.full_name} · {r.email} · {r.membership_tier}</option>)}</select></label>
    <form key={requestId} className="grid gap-4 sm:grid-cols-2" onSubmit={async e => {
      e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget;
      setBusy(true); setMessage("");
      try { await issue({ data: { ...(requestId ? { registration_request_id: requestId } : {}), email: String(fd.get("email")), full_name: String(fd.get("full_name")), phone: String(fd.get("phone")), organization: String(fd.get("organization")), tier_id: request?.membership_tier ?? String(fd.get("tier_id") ?? ""), starts_on: String(fd.get("starts_on")), ends_on: String(fd.get("ends_on")) } }); form.reset(); setRequestId(""); setMessage(t.memberPage.confirmationSaved); await qc.invalidateQueries({ queryKey: ["cms-members"] }); await qc.invalidateQueries({ queryKey: ["member-dashboard"] }); }
      catch (error) { setMessage(error instanceof Error && error.message === "Account invited but profile could not be saved" ? t.memberPage.partialError : c.error); } finally { setBusy(false); }
    }}>
      <h2 className="text-xl font-semibold sm:col-span-2">{c.issue}</h2>
      {["full_name", "email", "organization", "phone", "starts_on", "ends_on"].map(name => <label className="text-sm" key={name}>{c.fields[name as keyof typeof c.fields]}<input required={name !== "phone" && name !== "organization"} name={name} defaultValue={request && (name === "full_name" || name === "email" || name === "organization" || name === "phone") ? request[name] ?? "" : ""} readOnly={!!request && !name.endsWith("_on")} type={name.endsWith("_on") ? "date" : name === "email" ? "email" : "text"} className={field} /></label>)}
      <label className="text-sm">{c.fields.tier_id}<select name="tier_id" defaultValue={request?.membership_tier ?? ""} required className={field} disabled={!!request}><option value="" disabled>{t.memberPage.noPlan}</option>{plans.map(p => <option key={p.id} value={p.id}>{L(p, "title")}</option>)}</select></label>
      <Button disabled={busy || plans.length === 0} className="self-end min-h-12">{t.memberPage.confirmIssue}</Button>
    </form>
    <p role="status" className="text-sm">{message}</p>
    {selected && <form className="grid gap-4 sm:grid-cols-2" onSubmit={async e => { e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form); const kind = String(fd.get("kind")); const { error } = await supabase.from("member_records").insert({ member_id: selected, kind, title: String(fd.get("title")), event_date: String(fd.get("event_date")) || null, status: String(fd.get("status")), benefit_key: kind === "benefit" ? String(fd.get("benefit_key")) : null, quantity: Number(fd.get("quantity")) }); setMessage(error ? c.error : t.cms.saved); if (!error) { form.reset(); await qc.invalidateQueries({ queryKey: ["cms-member-records", selected] }); } }}>
      <h2 className="text-xl font-semibold sm:col-span-2">{members.find(m => m.id === selected)?.full_name} · {c.records}</h2>
      <select name="kind" aria-label={c.records} className={field}>{Object.entries(c.kinds).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select>
      <input name="title" required placeholder={t.cms.fields.title} className={field} />
      <input name="event_date" type="date" required aria-label={t.cms.fields.event_date} className={field} />
      <input name="status" placeholder={t.crm.progress} className={field} />
      <select name="benefit_key" aria-label={c.benefit} className={field}>{Object.entries(t.community.benefits).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select>
      <input name="quantity" type="number" min={1} step={1} defaultValue={1} required aria-label={t.cms.registrations.quantity} className={field} />
      <Button>{t.cms.save}</Button>
      <ul className="sm:col-span-2">{records.map(r => <li key={r.id} className="flex items-center justify-between border-b border-border py-3"><span>{r.title} · {r.event_date} · {r.status} · {r.quantity}</span><Button variant="ghost" onClick={async () => { await supabase.from("member_records").delete().eq("id",r.id); await qc.invalidateQueries({ queryKey: ["cms-member-records", selected] }); }} type="button">{t.cms.del}</Button></li>)}</ul>
    </form>}
  </div>;
}