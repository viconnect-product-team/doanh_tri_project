import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import { eventRegistrationFields } from "@/lib/event-registration";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const send = useServerFn(submitLead);
  const cache = useQueryClient();
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const r = t.news.registration;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    const registration = eventRegistrationFields.safeParse({ event_id: eventId, participant_count: Number(values.get("quantity")) });
    if (!registration.success) { setState("err"); return; }
    setState("busy");
    try {
      const result = await send({ data: { ...registration.data, source: "event", full_name: String(values.get("name") ?? ""), email: String(values.get("email") ?? ""), phone: String(values.get("phone") ?? ""), organization: String(values.get("org") ?? ""), message: `${r.quantity}: ${registration.data.participant_count}\n${values.get("note") ?? ""}`.slice(0, 2000) } });
      setState(result.ok ? "ok" : "err");
      if (result.ok) await cache.invalidateQueries({ queryKey: ["public-content"] });
    } catch { setState("err"); }
  }
  return <section id="event-register" className="scroll-mt-28 border-t border-border py-8">
    <h2 className="font-display text-2xl font-semibold text-navy">{r.title}</h2>
    <p className="mt-3 text-sm text-muted-foreground">{r.pending}</p>
    {state === "ok" ? <p role="status" className="mt-6 flex items-start gap-3 font-medium text-brand-green"><CheckCircle2 className="h-5 w-5 shrink-0" />{r.success}</p> : <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
      {([ ["name", t.contact.fields.name, "text", "name"], ["email", t.contact.fields.email, "email", "email"], ["phone", t.contact.fields.phone, "tel", "tel"], ["org", t.contact.fields.org, "text", "organization"] ] as const).map(([name, label, type, autoComplete]) => <div key={name} className="space-y-2"><Label htmlFor={`event-${name}`}>{label}{name !== "org" ? " *" : ""}</Label><Input id={`event-${name}`} name={name} type={type} autoComplete={autoComplete} required={name !== "org"} maxLength={name === "email" ? 255 : name === "phone" ? 20 : name === "org" ? 150 : 100} className="min-h-11" /></div>)}
      <div className="space-y-2"><Label htmlFor="event-quantity">{r.quantity} *</Label><Input id="event-quantity" name="quantity" type="number" min={1} step={1} required defaultValue={1} className="min-h-11" /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="event-note">{r.note}</Label><textarea id="event-note" name="note" rows={3} maxLength={1500} className="w-full rounded-md border border-input bg-background p-3 text-base" /></div>
      {state === "err" && <p role="alert" className="text-sm text-destructive sm:col-span-2">{r.failed}</p>}
      <Button disabled={state === "busy"} className="min-h-12 sm:col-span-2">{state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}{r.submit}</Button>
    </form>}
  </section>;
}