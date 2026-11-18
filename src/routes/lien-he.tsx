import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { ArrowUpRight, Building2, Facebook, Mail, MapPin, CalendarDays, CheckCircle2, GraduationCap, Handshake, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { t } from "@/content/i18n";
import { Breadcrumb, Section } from "@/components/site/Layout";
import { submitLead } from "@/lib/leads.functions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";
import { CONTACT_DEPARTMENTS, INSTITUTE_CONTACT, contactMessageSchema } from "@/lib/contact";

export const Route = createFileRoute("/lien-he")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ interest: z.string().max(200).optional(), source: z.enum(["event", "consulting"]).optional(), department: z.enum(CONTACT_DEPARTMENTS).optional() }).catch({}).parse(s),
  head: () => ({
    meta: [
      { title: "Kết nối hợp tác – Viện Doanh Trí" },
      { name: "description", content: "Liên hệ Viện Doanh Trí để hợp tác nghiên cứu, đào tạo và tư vấn." },
      { property: "og:title", content: "Kết nối hợp tác – Viện Doanh Trí" },
      { property: "og:description", content: "Liên hệ Viện Doanh Trí để hợp tác nghiên cứu, đào tạo và tư vấn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: Contact,
});

const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20";

function Contact() {
  const c = t.contact;
  const search = Route.useSearch();
  const { data: { courses } } = useSuspenseQuery(publicContentQuery);
  const courseTitles = courses.map((p) => L(p, "title"));
  const send = useServerFn(submitLead);
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "busy">("idle");
  const [invalid, setInvalid] = useState(false);
  const [department, setDepartment] = useState<(typeof CONTACT_DEPARTMENTS)[number]>(search.department ?? (search.source === "event" ? "community" : search.source === "consulting" ? "consulting" : "training"));
  const formRef = useRef<HTMLFormElement>(null);
  const extra = search.interest && ![...courseTitles, ...t.consulting.services.map((s) => s.title), ...c.topics].includes(search.interest) ? search.interest : null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactMessageSchema.safeParse({ full_name: d["name"], email: d["email"], phone: d["phone"], organization: d["org"], department, interest: d["interest"], message: d["message"] });
    if (!parsed.success) { setInvalid(true); return setStatus("err"); }
    setInvalid(false);
    setStatus("busy");
    try {
      const r = await send({ data: {
        ...parsed.data, source: search.source ?? "contact",
      } });
      if (!r.ok) return setStatus("err");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <Section className="py-12 md:py-16">
      <div className="max-w-3xl">
        <Breadcrumb items={[t.common.connect]} />
        <h1 className="font-display text-4xl font-semibold text-navy md:text-5xl">{c.title} <em className="text-brand-green">{c.titleEm}</em></h1>
        <p className="mt-5 text-muted-foreground">{c.lead}</p>
      </div>
      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy">{c.departmentTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.departmentLead}</p>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {c.departments.map((team, i) => {
              const id = CONTACT_DEPARTMENTS[i];
              if (!id) return null;
              const Icon = [GraduationCap, Building2, CalendarDays, Handshake][i] ?? Building2;
              return <article key={id} className="flex gap-4 py-6">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0"><h3 className="font-semibold text-navy">{team.title}</h3><p className="mt-1 text-sm text-muted-foreground">{team.description}</p>
                  <Button variant="link" className="mt-2 h-auto whitespace-normal px-0" onClick={() => { setDepartment(id); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }); }}>{c.chooseDepartment}<ArrowUpRight className="h-4 w-4" /></Button>
                </div>
              </article>;
            })}
          </div>
          <section aria-labelledby="contact-info" className="mt-8 rounded-lg border border-border bg-card p-5 shadow-soft">
            <h2 id="contact-info" className="font-display text-xl font-semibold text-navy">{c.infoTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.contactPending}</p>
            <ul className="mt-4 grid gap-4 text-sm">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><span className="block text-xs font-semibold uppercase text-muted-foreground">{c.addressLabel}</span>{c.address}</span></li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-xs font-semibold uppercase text-muted-foreground">{c.emailLabel}</span><a href={`mailto:${INSTITUTE_CONTACT.email}`} className="break-all font-medium text-primary hover:underline">{INSTITUTE_CONTACT.email}</a></span></li>
              <li className="flex gap-3"><Facebook className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><span className="block text-xs font-semibold uppercase text-muted-foreground">{c.fanpageLabel}</span><a href={INSTITUTE_CONTACT.fanpageUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{c.fanpageName}</a></span></li>
            </ul>
          </section>
        </div>
      <form ref={formRef} onSubmit={submit} className="grid scroll-mt-28 content-start gap-5 border-t-2 border-primary bg-muted p-5 md:grid-cols-2 md:p-8" aria-busy={status === "busy"}>
        <h2 className="font-display text-2xl font-semibold text-navy md:col-span-2">{c.formTitle}</h2>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">{c.department}<select name="department" value={department} onChange={e => { const value = CONTACT_DEPARTMENTS.find(id => id === e.target.value); if (value) setDepartment(value); }} className={field}>{c.departments.map((team, i) => <option key={team.title} value={CONTACT_DEPARTMENTS[i]}>{team.title}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">{c.fields.name}<input name="name" autoComplete="name" required className={field} maxLength={100} /></label>
        <label className="grid gap-2 text-sm font-medium">{c.fields.org}<input name="org" autoComplete="organization" className={field} maxLength={150} /></label>
        <label className="grid gap-2 text-sm font-medium">{c.fields.email}<input name="email" type="email" autoComplete="email" required className={field} maxLength={255} /></label>
        <label className="grid gap-2 text-sm font-medium">{c.fields.phone}<input name="phone" type="tel" autoComplete="tel" className={field} maxLength={20} /></label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">{c.fields.topic}<select name="interest" className={field} defaultValue={search.interest ?? ""}>
          <option value="">{c.fields.topic}</option>
          {extra && <option value={extra}>{extra}</option>}
          <optgroup label={c.interestGroups.training}>{courseTitles.map((x) => <option key={x}>{x}</option>)}<option>{t.training.flagshipTitle}</option></optgroup>
          <optgroup label={c.interestGroups.consulting}>{t.consulting.services.map((s) => <option key={s.title}>{s.title}</option>)}</optgroup>
          <optgroup label={c.interestGroups.other}>{c.topics.map((x) => <option key={x}>{x}</option>)}</optgroup>
        </select></label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">{c.fields.message}<textarea name="message" required rows={5} placeholder={c.messagePh} className={field} maxLength={1900} /></label>
        {status === "ok" && <p role="status" className="flex items-center gap-2 text-sm text-brand-green md:col-span-2"><CheckCircle2 className="h-5 w-5 shrink-0" />{c.success}</p>}
        {status === "err" && <p role="alert" className="text-sm text-destructive md:col-span-2">{invalid ? c.error : c.failed}</p>}
        <Button disabled={status === "busy"} className="h-12 md:col-span-2">{status === "busy" ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Send className="h-4 w-4" />}{status === "busy" ? c.sending : c.submit}</Button>
      </form>
      </div>
    </Section>
  );
}
