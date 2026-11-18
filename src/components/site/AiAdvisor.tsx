import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Sparkles, Loader2, GraduationCap, Briefcase, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { recommendPrograms, type AdvisorResult } from "@/lib/advisor.functions";
import { t, getLocale } from "@/content/i18n";
import { submitLead } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";

const select = "w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 sm:text-sm";

export function AiAdvisor() {
  const a = t.advisor;
  const run = useServerFn(recommendPrograms);
  const [need, setNeed] = useState("");
  const [audience, setAudience] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<AdvisorResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (res) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [res]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (need.trim().length < 10) return setErr(a.errors.short);
    setLoading(true); setErr(null); setRes(null);
    try {
      const r = await run({ data: { need, locale: getLocale(), audience, size } });
      if (r.ok) setRes(r.result);
      else setErr(a.errors[r.error as keyof typeof a.errors] ?? a.errors.generic);
    } catch {
      setErr(a.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-y border-border bg-muted px-5 py-8 sm:px-8 md:py-12">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-green"><Sparkles className="h-4 w-4" />{a.badge}</div>
      <h2 className="mt-3 font-display text-2xl font-semibold text-navy sm:text-3xl md:text-4xl">{a.title}</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{a.lead}</p>

      <form ref={formRef} onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{a.audience}</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className={select}>
              <option value="">{a.any}</option>
              {a.audiences.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{a.size}</span>
            <select value={size} onChange={(e) => setSize(e.target.value)} className={select}>
              <option value="">{a.any}</option>
              {a.sizes.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <textarea value={need} onChange={(e) => setNeed(e.target.value)} rows={4} maxLength={2000} placeholder={a.placeholder}
          className="w-full rounded-md border border-input bg-background p-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {a.examples.map((x) => (
            <Button variant="outline" type="button" key={x} onClick={() => setNeed(x)}
              className="h-auto min-h-10 shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:whitespace-normal">{x}</Button>
          ))}
        </div>
        <Button disabled={loading} className="min-h-12 w-full px-6 sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? a.loading : a.submit}
        </Button>
      </form>

      {err && <p className="mt-4 text-sm text-destructive" role="alert">{err}</p>}

      {loading && (
        <div className="mt-8 grid gap-3 md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}

      {res && (
        <div ref={resultRef} className="mt-8 scroll-mt-24 space-y-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-navy sm:text-2xl">{a.resultTitle}</h3>
            <Button variant="ghost" type="button" onClick={() => { setRes(null); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}
              className="shrink-0 px-2 text-xs text-primary">
              <RotateCcw className="h-3.5 w-3.5" />{a.retry}
            </Button>
          </div>
          <p className="rounded-lg bg-muted p-4 text-sm text-foreground/80">{res.summary}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {res.recommendations.map((r, i) => {
              const I = r.kind === "training" ? GraduationCap : Briefcase;
              return (
                <article key={r.name} className={`flex flex-col rounded-lg border bg-background p-5 ${i === 0 ? "border-primary shadow-soft" : "border-border"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary"><I className="h-4 w-4" />{a.kinds[r.kind]}</span>
                    {i === 0 && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">{a.top}</span>}
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold leading-snug text-navy">{r.name}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-green" style={{ width: `${r.match}%` }} /></div>
                    <span className="shrink-0 text-xs font-medium text-brand-green">{r.match}% {a.match}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{r.reason}</p>
                  {r.benefit && (
                    <p className="mt-3 flex gap-2 border-t border-border pt-3 text-sm text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span><b className="font-medium">{a.benefit}:</b> {r.benefit}</span>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <p className="flex gap-2 text-sm text-foreground/80"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b>{a.next}:</b> {res.nextStep}</span></p>
          <SaveLead need={need} audience={audience} size={size} result={res} />
        </div>
      )}
    </div>
  );
}

function SaveLead({ need, audience, size, result }: { need: string; audience: string; size: string; result: AdvisorResult }) {
  const a = t.advisor;
  const send = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  if (state === "ok") return <p className="flex items-center gap-2 rounded-lg bg-brand-green/10 p-4 text-sm text-brand-green"><CheckCircle2 className="h-5 w-5 shrink-0" />{a.saved}</p>;
  const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary sm:text-sm";
  return (
    <form className="border-t border-border pt-6" onSubmit={async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      const name = (d["name"] ?? "").trim(); const email = (d["email"] ?? "").trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) return setState("err");
      setState("busy");
      const context = [audience && `${a.audience}: ${audience}`, size && `${a.size}: ${size}`].filter(Boolean).join(" · ");
      try {
        const r = await send({ data: {
          full_name: name, email, phone: d["phone"], organization: d["org"], source: "ai_advisor",
          interest: result.recommendations.map((x) => x.name).join(", ").slice(0, 200),
          message: (context ? `${context}\n\n${need}` : need).slice(0, 2000), ai_suggestions: result,
        } });
        setState(r.ok ? "ok" : "err");
      } catch { setState("err"); }
    }}>
      <p className="font-medium text-navy">{a.saveTitle}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input name="name" required maxLength={100} autoComplete="name" placeholder={t.contact.fields.name} className={field} />
        <input name="email" type="email" required maxLength={255} autoComplete="email" placeholder={t.contact.fields.email} className={field} />
        <input name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder={t.contact.fields.phone} className={field} />
        <input name="org" maxLength={150} autoComplete="organization" placeholder={t.contact.fields.org} className={field} />
      </div>
      {state === "err" && <p className="mt-3 text-sm text-destructive">{a.saveError}</p>}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button disabled={state === "busy"} className="min-h-12 px-6">{state === "busy" ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : a.saveBtn}</Button>
        <Link to="/lien-he" className="text-center text-sm text-primary underline">{a.contact}</Link>
      </div>
    </form>
  );
}
