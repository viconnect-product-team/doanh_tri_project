import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { t } from "@/content/i18n";
import { submitLead } from "@/lib/leads.functions";
import { membershipRegistrationSchema, type MembershipTier } from "@/lib/membership";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const field = "min-h-12 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MembershipForm({ tier, onTier }: { tier: MembershipTier; onTier: (tier: MembershipTier) => void }) {
  const send = useServerFn(submitLead);
  const { data } = useSuspenseQuery(publicContentQuery);
  const plans = data.membership_plans;
  const selectedTier = plans.some(p => p.id === tier) ? tier : "";
  const [state, setState] = useState<"idle" | "busy" | "done" | "invalid" | "error">("idle");
  const c = t.community.form;
  const f = t.contact.fields;
  if (state === "done") return <div role="status" className="border-t-2 border-brand-green py-8"><CheckCircle2 className="mb-4 h-9 w-9 text-brand-green" /><p className="text-lg font-semibold text-navy">{c.success}</p><p className="mt-3 text-sm text-muted-foreground">{t.memberPage.registrationLead}</p><div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link to="/auth" search={{ member: true }}>{t.assistant.membershipLogin}</Link></Button><Button variant="outline" onClick={() => setState("idle")}>{c.again}</Button></div></div>;
  return <form className="grid gap-5 sm:grid-cols-2" onSubmit={async e => {
    e.preventDefault();
    if (state === "busy") return;
    const d = new FormData(e.currentTarget);
    const result = membershipRegistrationSchema.safeParse({ full_name: d.get("full_name"), email: d.get("email"), phone: d.get("phone"), organization: d.get("organization"), message: d.get("message"), membership_tier: selectedTier, consent: d.get("consent") === "on" });
    if (!result.success) { setState("invalid"); return; }
    setState("busy");
    try { const response = await send({ data: { ...result.data, source: "community" } }); setState(response.ok ? "done" : "error"); } catch { setState("error"); }
  }}>
    {([{ name: "full_name", label: f.name, type: "text", max: 100, required: true, auto: "name" }, { name: "organization", label: f.org, type: "text", max: 150, auto: "organization" }, { name: "email", label: f.email, type: "email", max: 255, required: true, auto: "email" }, { name: "phone", label: f.phone, type: "tel", max: 20, required: true, auto: "tel" }]).map(x => <label key={x.name} className="block text-sm font-medium"><span className="mb-2 block">{x.label}{x.required && " *"}</span><input name={x.name} type={x.type} autoComplete={x.auto} required={x.required} maxLength={x.max} className={field} disabled={state === "busy"} /></label>)}
    <label className="text-sm font-medium sm:col-span-2"><span className="mb-2 block">{c.tier}</span><select required value={selectedTier} onChange={e => { const value = plans.find(p => p.id === e.target.value)?.id; if (value) onTier(value); }} className={field} disabled={state === "busy"}><option value="" disabled>{t.memberPage.noPlan}</option>{plans.map(p => <option value={p.id} key={p.id}>{L(p, "title")}</option>)}</select></label>
    <label className="text-sm font-medium sm:col-span-2"><span className="mb-2 block">{c.needs}</span><textarea name="message" rows={4} maxLength={1800} placeholder={c.needsPh} className={field} disabled={state === "busy"} /></label>
    <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:col-span-2"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-primary" disabled={state === "busy"} /><span>{c.consent}</span></label>
    {(state === "invalid" || state === "error") && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state === "invalid" ? c.error : c.failed}</p>}
    <Button type="submit" disabled={state === "busy" || !selectedTier} className="h-auto min-h-12 whitespace-normal sm:col-span-2">{state === "busy" ? <Loader2 className="animate-spin" /> : <ArrowRight />}{state === "busy" ? c.sending : c.submit}</Button>
  </form>;
}