import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { PageHero } from "@/components/site/Layout";
import hero from "@/assets/community-dinner.jpg";
import { Button } from "@/components/ui/button";
import { t, getLocale } from "@/content/i18n";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { submitLead } from "@/lib/leads.functions";
import { membershipRegistrationSchema } from "@/lib/membership";

export const Route = createFileRoute("/dang-ky-hoi-vien")({
  head: () => ({
    meta: [
      { title: "Đăng ký hội viên – Viện Doanh Trí" },
      { name: "description", content: "Đăng ký hội viên Cộng đồng Doanh Trí: thông tin cá nhân, chọn gói, khóa học và hướng dẫn thanh toán." },
      { property: "og:title", content: "Đăng ký hội viên – Viện Doanh Trí" },
      { property: "og:description", content: "Đăng ký hội viên Cộng đồng Doanh Trí theo ba bước đơn giản." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: Page,
  errorComponent: ({ error }) => <p className="p-10 text-destructive">{String((error as Error)?.message ?? error)}</p>,
  notFoundComponent: () => <p className="p-10">404</p>,
});

const field = "min-h-12 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
type Info = { full_name: string; organization: string; email: string; phone: string; message: string };

function Page() {
  const s = t.memberSignup;
  const f = t.contact.fields;
  const { data } = useSuspenseQuery(publicContentQuery);
  const send = useServerFn(submitLead);
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<Info>({ full_name: "", organization: "", email: "", phone: "", message: "" });
  const [tier, setTier] = useState(data.membership_plans[0]?.id ?? "");
  const [courses, setCourses] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const plan = data.membership_plans.find((p) => p.id === tier);
  const money = (n: number) => n.toLocaleString(getLocale() === "en" ? "en-US" : "vi-VN");
  const infoValid = membershipRegistrationSchema.pick({ full_name: true, email: true, phone: true, organization: true }).safeParse(info).success;

  async function submit() {
    setState("busy");
    try {
      const r = await send({ data: { ...info, membership_tier: tier, consent: true, source: "community", course_ids: courses } });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  }

  return (
    <>
      <PageHero crumbs={[s.title]} title={s.title} lead={s.subtitle} image={hero} />
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {state === "done" ? (
          <div role="status" className="rounded-lg border border-border bg-card p-8 shadow-soft">
            <CheckCircle2 className="h-10 w-10 text-brand-green" />
            <p className="mt-4 text-lg font-semibold text-navy">{t.community.form.success}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.successNote}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link to="/auth" search={{ member: true }}>{t.assistant.membershipLogin}</Link></Button>
              <Button asChild variant="outline"><Link to="/thanh-toan-hoi-vien">{s.pay}</Link></Button>
            </div>
          </div>
        ) : (
          <>
            <ol className="mb-8 grid grid-cols-3 gap-2">
              {s.steps.map((label, i) => (
                <li key={label} className={`border-t-2 pt-2 text-xs font-medium sm:text-sm ${i <= step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{i + 1}. {label}</li>
              ))}
            </ol>
            <div className="rounded-lg border border-border bg-card p-6 shadow-soft md:p-8">
              {step === 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {([["full_name", f.name, "text", true], ["organization", f.org, "text", false], ["email", f.email, "email", true], ["phone", f.phone, "tel", true]] as const).map(([k, label, type, req]) => (
                    <label key={k} className="block text-sm font-medium"><span className="mb-2 block">{label}{req && " *"}</span>
                      <input type={type} value={info[k]} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} className={field} /></label>
                  ))}
                  <label className="text-sm font-medium sm:col-span-2"><span className="mb-2 block">{t.community.form.needs}</span>
                    <textarea rows={3} maxLength={1500} value={info.message} onChange={(e) => setInfo({ ...info, message: e.target.value })} className={field} /></label>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-6">
                  <fieldset><legend className="mb-3 text-sm font-semibold">{s.plan}</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.membership_plans.map((p) => (
                        <label key={p.id} className={`cursor-pointer rounded-lg border p-4 ${tier === p.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                          <input type="radio" className="sr-only" checked={tier === p.id} onChange={() => setTier(p.id)} />
                          <span className="block font-semibold text-navy">{L(p, "title")}</span>
                          <span className="text-sm text-primary">{money(p.fee)} VND</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset><legend className="mb-3 text-sm font-semibold">{s.courses}</legend>
                    {data.courses.length === 0 ? <p className="text-sm text-muted-foreground">{s.noCourses}</p> : (
                      <div className="space-y-2">
                        {data.courses.slice(0, 10).map((c) => (
                          <label key={c.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                            <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={courses.includes(c.id)} onChange={(e) => setCourses(e.target.checked ? [...courses, c.id] : courses.filter((x) => x !== c.id))} />
                            <span><span className="font-medium">{L(c, "title")}</span><span className="block text-xs text-muted-foreground">{c.start_date} · {L(c, "duration")}</span></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5 text-sm">
                  <h2 className="font-semibold text-navy">{s.review}</h2>
                  <dl className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                    <dt className="text-muted-foreground">{f.name}</dt><dd>{info.full_name}</dd>
                    <dt className="text-muted-foreground">{f.email}</dt><dd>{info.email}</dd>
                    <dt className="text-muted-foreground">{f.phone}</dt><dd>{info.phone}</dd>
                    <dt className="text-muted-foreground">{s.plan}</dt><dd>{plan ? L(plan, "title") : "—"}</dd>
                    <dt className="text-muted-foreground">{s.fee}</dt><dd className="font-semibold text-primary">{plan ? `${money(plan.fee)} VND` : "—"}</dd>
                    <dt className="text-muted-foreground">{s.coursesLabel}</dt><dd>{data.courses.filter((c) => courses.includes(c.id)).map((c) => L(c, "title")).join("; ") || "—"}</dd>
                  </dl>
                  <div className="rounded-md bg-muted p-4"><p className="font-semibold">{s.paymentTitle}</p><p className="mt-1 text-muted-foreground">{s.paymentNote}</p></div>
                  <label className="flex items-start gap-3 text-muted-foreground"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" /><span>{t.community.form.consent}</span></label>
                  {state === "error" && <p role="alert" className="text-destructive">{t.community.form.failed}</p>}
                </div>
              )}
              <div className="mt-8 flex justify-between gap-3">
                <Button variant="outline" disabled={step === 0 || state === "busy"} onClick={() => setStep(step - 1)}><ArrowLeft />{s.back}</Button>
                {step < 2 ? (
                  <Button disabled={(step === 0 && !infoValid) || (step === 1 && !plan)} onClick={() => setStep(step + 1)}>{s.next}<ArrowRight /></Button>
                ) : (
                  <Button disabled={!consent || state === "busy"} onClick={submit}>{state === "busy" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}{s.submit}</Button>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
