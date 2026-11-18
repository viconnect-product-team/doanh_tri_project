import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { t } from "@/content/i18n";
import { submitLead } from "@/lib/leads.functions";

const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 sm:text-sm";

/** Bottom sheet on phones, centered dialog on larger screens. Saves the learner as a CRM lead. */
export function CourseRegister({ course, meta, onClose }: { course: string; meta: string; onClose: () => void }) {
  const r = t.training.register;
  const f = t.contact.fields;
  const send = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const name = (d["name"] ?? "").trim();
    const email = (d["email"] ?? "").trim();
    const phone = (d["phone"] ?? "").trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !phone) { setState("err"); return; }
    setState("busy");
    const seats = Math.max(1, Math.min(500, Number(d["seats"]) || 1));
    const message = [`${r.seats}: ${seats}`, d["note"]?.trim()].filter(Boolean).join("\n");
    try {
      const res = await send({ data: { full_name: name, email, phone, organization: d["org"], source: "course", interest: course.slice(0, 200), message: message.slice(0, 2000) } });
      setState(res.ok ? "ok" : "err");
    } catch { setState("err"); }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={r.title}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-background shadow-soft sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-green">{r.title}</p>
            <p className="mt-1 font-display text-xl font-semibold leading-snug text-navy">{course}</p>
            {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
          </div>
          <button type="button" aria-label={t.cms.cancel} onClick={onClose} className="shrink-0 rounded-md p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        {state === "ok" ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-green" />
            <p className="font-medium text-navy">{r.success}</p>
            <button onClick={onClose} className="min-h-12 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground">{r.done}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 overflow-y-auto px-5 py-5">
            <input name="name" required maxLength={100} autoComplete="name" placeholder={`${f.name} *`} className={field} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="email" type="email" required maxLength={255} autoComplete="email" placeholder={`${f.email} *`} className={field} />
              <input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder={`${f.phone} *`} className={field} />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
              <input name="org" maxLength={150} autoComplete="organization" placeholder={f.org} className={field} />
              <label className="block">
                <span className="sr-only">{r.seats}</span>
                <input name="seats" type="number" min={1} max={500} defaultValue={1} aria-label={r.seats} title={r.seats} className={field} />
              </label>
            </div>
            <p className="-mt-1 text-right text-[11px] text-muted-foreground">{r.seatsHint}</p>
            <textarea name="note" rows={3} maxLength={1500} placeholder={r.note} className={field} />
            {state === "err" && <p className="text-sm text-destructive" role="alert">{r.error}</p>}
            <button disabled={state === "busy"} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}{r.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
