import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { t } from "@/content/i18n";
import { submitLead } from "@/lib/leads.functions";

const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20";

export function ConsultForm({ service, onService }: { service: string; onService: (s: string) => void }) {
  const c = t.consulting;
  const f = t.contact.fields;
  const send = useServerFn(submitLead);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-8 shadow-soft">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-green" />
        <p className="text-navy">{t.contact.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        const name = (d["name"] ?? "").trim();
        const email = (d["email"] ?? "").trim();
        if (!name || !/^\S+@\S+\.\S+$/.test(email)) { setStatus("error"); return; }
        setStatus("busy");
        try {
          const r = await send({ data: {
            full_name: name, email, phone: d["phone"], organization: d["org"],
            interest: service, message: d["message"], source: "consulting",
          } });
          setStatus(r.ok ? "done" : "error");
        } catch { setStatus("error"); }
      }}
      className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2 md:p-8"
    >
      <input name="name" required placeholder={f.name} className={field} maxLength={100} />
      <input name="org" placeholder={f.org} className={field} maxLength={150} />
      <input name="email" type="email" required placeholder={f.email} className={field} maxLength={255} />
      <input name="phone" type="tel" placeholder={f.phone} className={field} maxLength={20} />
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{c.form.service}</span>
        <select value={service} onChange={(e) => onService(e.target.value)} className={field}>
          {c.services.map((s) => <option key={s.title}>{s.title}</option>)}
        </select>
      </label>
      <textarea name="message" required rows={5} maxLength={2000} placeholder={c.form.need} className={`${field} sm:col-span-2`} />
      {status === "error" && <p className="text-sm text-destructive sm:col-span-2">{t.contact.error}</p>}
      <button disabled={status === "busy"} className="rounded-md bg-primary py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:col-span-2">
        {c.cta}
      </button>
    </form>
  );
}
