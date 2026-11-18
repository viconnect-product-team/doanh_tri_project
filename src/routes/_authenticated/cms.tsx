import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState, useTransition } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { t, getLocale } from "@/content/i18n";
import { RichTextEditor } from "@/components/site/RichTextEditor";
import { membershipAmountSchema } from "@/lib/membership";
import { Button } from "@/components/ui/button";
import { RegistrationManager } from "@/components/site/RegistrationManager";
import { SharedTracking } from "@/components/site/SharedTracking";
import { MemberManager } from "@/components/site/MemberManager";
import { parseEventCapacity } from "@/lib/event-capacity";
import { MediaLibrary } from "@/components/site/MediaLibrary";
import { CmsImageUpload } from "@/components/site/CmsImageUpload";
import { PartnershipManager } from "@/components/site/PartnershipManager";
import { MemberPaymentManager } from "@/components/site/MemberPaymentManager";

type Kind = "courses" | "posts" | "experts" | "events" | "membership_plans" | "partners";
type Row = Record<string, unknown> & { id: string; published: boolean };
type FieldDef = { key: string; bilingual?: boolean; long?: boolean; type?: "text" | "date" | "number" | "bool" | "select"; options?: string[]; label?: string; required?: boolean; hidden?: boolean };

// Which fields each content type edits. Bilingual fields have a `<key>_en` column.
const SCHEMA: Record<Kind, { fields: FieldDef[]; titleKey: string; subKey: string; order: { col: string; asc: boolean } }> = {
  membership_plans: {
    titleKey: "title", subKey: "fee", order: { col: "sort_order", asc: true },
    fields: [
      { key: "title", bilingual: true, required: true }, { key: "description", bilingual: true, long: true },
      ...["fee", "knowledge", "dinners", "press", "visits", "flowers", "mentoring", "speaking", "overseas", "ceo", "sort_order"].map(key => ({ key, type: "number" as const })),
    ],
  },
  courses: {
    titleKey: "title", subKey: "tag", order: { col: "sort_order", asc: true },
    fields: [
      { key: "title", bilingual: true, required: true }, { key: "tag", bilingual: true },
      { key: "description", bilingual: true, long: true }, { key: "duration", bilingual: true },
      { key: "start_date" }, { key: "sort_order", type: "number" },
    ],
  },
  posts: {
    titleKey: "title", subKey: "published_on", order: { col: "published_on", asc: false },
    fields: [
      { key: "title", bilingual: true, required: true }, { key: "tag", bilingual: true },
      { key: "excerpt", bilingual: true, long: true }, { key: "body", bilingual: true, long: true },
      { key: "published_on", type: "date" },
      { key: "image_url" }, { key: "image_thumb_url", hidden: true }, { key: "image_caption", bilingual: true },
      { key: "source_name" }, { key: "source_url" },
    ],
  },
  events: {
    titleKey: "title", subKey: "event_date", order: { col: "event_date", asc: false },
    fields: [
      { key: "title", bilingual: true, required: true }, { key: "tag", bilingual: true }, { key: "topic", bilingual: true },
      { key: "description", bilingual: true, long: true }, { key: "place", bilingual: true }, { key: "mode", bilingual: true },
      { key: "attendees", bilingual: true }, { key: "event_date", type: "date" }, { key: "time_range" }, { key: "featured", type: "bool" },
      { key: "is_recurring", type: "bool" }, { key: "capacity", type: "number" },
      { key: "image_url" }, { key: "image_thumb_url", hidden: true }, { key: "image_caption", bilingual: true },
      { key: "source_name" }, { key: "source_url" },
    ],
  },
  partners: {
    titleKey: "name", subKey: "category", order: { col: "sort_order", asc: true },
    fields: [
      { key: "name", bilingual: true, required: true }, { key: "category", type: "select", options: ["client", "partner", "sponsor"], label: "partner_category" },
      { key: "description", bilingual: true, long: true }, { key: "image_url", label: "logo_url" }, { key: "image_thumb_url", hidden: true },
      { key: "website_url" }, { key: "sort_order", type: "number" },
    ],
  },
  experts: {
    titleKey: "name", subKey: "role", order: { col: "sort_order", asc: true },
    fields: [
      { key: "name", bilingual: true, required: true }, { key: "category", bilingual: true },
      { key: "role", bilingual: true }, { key: "org", bilingual: true },
      { key: "bio", bilingual: true, long: true }, { key: "image_url", label: "portrait" }, { key: "image_thumb_url", hidden: true }, { key: "sort_order", type: "number" },
      { key: "source_name" }, { key: "source_url" },
    ],
  },
};

// Long-form fields edited with the rich text editor (rendered via RichTextView on the site).
const RICH = new Set(["body", "description", "bio"]);

const listQuery = (kind: Kind) => queryOptions({
  queryKey: ["cms", kind],
  queryFn: async () => {
    const o = SCHEMA[kind].order;
    const { data, error } = await supabase.from(kind).select("*").order(o.col, { ascending: o.asc });
    if (error) throw new Error(error.message);
    return data as unknown as Row[];
  },
});

export const Route = createFileRoute("/_authenticated/cms")({
  head: () => ({
    meta: [
      { title: "Quản trị nội dung – Viện Doanh Trí" },
      { name: "description", content: "Quản lý khóa học, bài viết và chuyên gia hiển thị trên website." },
      { property: "og:title", content: "Quản trị nội dung – Viện Doanh Trí" },
      { property: "og:description", content: "Quản lý khóa học, bài viết và chuyên gia hiển thị trên website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cms,
  errorComponent: ({ error }) => <p className="p-10 text-destructive">{t.crm.loadError}: {String((error as Error)?.message ?? error)}</p>,
});

const field = "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20";

function Cms() {
  const c = t.cms;
  const [kind, setKindNow] = useState<Kind | "registrations" | "tracking" | "recurring" | "members" | "media" | "partnership" | "memberPayment">("courses");
  // Keep the current tab visible while the next tab loads, so the page never collapses and the footer never jumps up.
  const [switching, startSwitch] = useTransition();
  const setKind = (k: typeof kind) => startSwitch(() => setKindNow(k));
  return (
    <div className="mx-auto w-full flex-1 max-w-6xl px-4 py-10 md:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="truncate font-display text-2xl font-semibold text-navy md:text-3xl">{c.title}</h1>
        <div className="flex shrink-0 gap-2">
          <Link to="/quan-tri" className="rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90">{t.dashboard.nav}</Link>
          <Link to="/crm" className="rounded-md border border-border px-4 py-2.5 text-sm hover:bg-muted">{c.toCrm}</Link>
        </div>
      </div>
      <Button className="mt-4" variant={kind === "partnership" ? "default" : "outline"} onClick={() => setKind("partnership")}>{t.partnership.packages} & {t.partnership.orders}</Button>
      <Button className="mt-4 ml-2" variant={kind === "memberPayment" ? "default" : "outline"} onClick={() => setKind("memberPayment")}>{t.memberPayment.title}</Button>
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {(["tracking", ...Object.keys(SCHEMA), "recurring", "registrations", "members", "media"] as (Kind | "registrations" | "tracking" | "recurring" | "members" | "media")[]).map((k) => (
          <Button variant="ghost" key={k} onClick={() => setKind(k)} aria-pressed={kind === k}
            className={`h-11 flex-1 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition ${kind === k ? "bg-background text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
            {c.tabs[k]}
          </Button>
        ))}
      </div>
      <div className="min-h-[500px] transition-opacity duration-150" aria-busy={switching} style={{ opacity: switching ? 0.6 : 1 }}><Suspense fallback={<div className="flex min-h-[400px] items-center justify-center py-20 text-center text-muted-foreground" role="status"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="text-sm">{t.common.loading}</p></div></div>}>
        {kind === "memberPayment" ? <MemberPaymentManager /> : kind === "partnership" ? <PartnershipManager /> : kind === "media" ? <MediaLibrary /> : kind === "members" ? <MemberManager /> : kind === "tracking" ? <Suspense fallback={<p className="py-10 text-center text-muted-foreground" role="status">{c.tracking.loading}</p>}><SharedTracking /></Suspense> : kind === "registrations" ? <Suspense fallback={<p className="py-10 text-center text-muted-foreground" role="status">{c.registrations.loading}</p>}><RegistrationManager /></Suspense> : <List key={kind} kind={kind === "recurring" ? "events" : kind} recurring={kind === "recurring"} />}
      </Suspense></div>
    </div>
  );
}

function List({ kind, recurring = false }: { kind: Kind; recurring?: boolean }) {
  const c = t.cms;
  const s = SCHEMA[kind];
  const qc = useQueryClient();
  const { data: allRows } = useSuspenseQuery(listQuery(kind));
  const rows = recurring ? allRows.filter(r => r["is_recurring"] === true) : allRows;
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = async (m: string) => {
    setMsg(m);
    await Promise.all([qc.invalidateQueries({ queryKey: ["cms", kind] }), qc.invalidateQueries({ queryKey: ["public-content"] })]);
  };
  async function togglePublish(r: Row) {
    const { error } = await supabase.from(kind).update({ published: !r.published }).eq("id", r.id);
    await refresh(error ? c.error : c.saved);
  }
  async function remove(r: Row) {
    if (!confirm(c.confirmDel)) return;
    const { error } = await supabase.from(kind).delete().eq("id", r.id);
    await refresh(error ? (kind === "membership_plans" && error.code === "23503" ? c.membershipDeleteBlocked : c.error) : c.deleted);
  }
  async function setDate(r: Row, col: string, v: string) {
    if (!v || v === r[col]) return;
    const { error } = await supabase.from(kind).update({ [col]: v } as never).eq("id", r.id);
    await refresh(error ? c.error : c.saved);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" role="status">{msg}</p>
        <Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />{recurring ? c.recurring.add : c.add}</Button>
      </div>
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {rows.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">{recurring ? c.recurring.empty : c.empty}</li>}
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
            <div className="min-w-0">
              <p className={`truncate font-medium ${r.published ? "text-navy" : "text-muted-foreground line-through"}`}>{String(r[s.titleKey] ?? "")}</p>
              <p className="flex flex-wrap items-center gap-2 truncate text-xs text-muted-foreground">
                {s.subKey === "published_on" || s.subKey === "event_date" ? (
                  <input type="date" aria-label={c.fields[s.subKey as keyof typeof c.fields]} value={String(r[s.subKey] ?? "")}
                    onChange={(e) => setDate(r, s.subKey, e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground" />
                ) : kind === "membership_plans" ? new Intl.NumberFormat(getLocale() === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(r[s.subKey] ?? 0)) : String(r[s.subKey] ?? "")}
                <span>· {r.published ? c.shown : c.hidden}</span>
              </p>
              {kind === "events" && <p className="mt-2 text-sm text-muted-foreground">{String(r["time_range"] ?? "")} {String(r["place"] ?? "")} · {r["capacity"] == null ? c.recurring.unspecified : `${r["capacity"]} ${c.recurring.seats}`}</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <IconBtn label={r.published ? c.hidden : c.shown} onClick={() => togglePublish(r)}>{r.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</IconBtn>
              <IconBtn label={c.edit} onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label={c.del} onClick={() => remove(r)} danger><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <Editor kind={kind} recurring={recurring} row={editing === "new" ? null : editing} onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await refresh(c.saved); }} />
      )}
    </div>
  );
}

function IconBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <Button type="button" variant="outline" size="icon" aria-label={label} title={label} onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-muted ${danger ? "text-destructive" : "text-foreground/70"}`}>
      {children}
    </Button>
  );
}

function Editor({ kind, recurring = false, row, onClose, onSaved }: { kind: Kind; recurring?: boolean; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const c = t.cms;
  const s = SCHEMA[kind];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, unknown> = { published: fd.get("published") === "on" };
    for (const f of s.fields) {
      const keys = f.bilingual ? [f.key, `${f.key}_en`] : [f.key];
      for (const k of keys) {
        const v = String(fd.get(k) ?? "").trim();
        if (k === "capacity") {
          try { values[k] = parseEventCapacity(v); }
          catch { setErr(c.recurring.capacityError); return; }
        }
        else if (f.type === "bool") values[k] = fd.get(k) === "on";
        else if (f.type === "number") {
          const number = Number(v);
          if (kind === "membership_plans") {
            const parsed = membershipAmountSchema.safeParse(v);
            if (!parsed.success) { setErr(c.membershipNumberError); return; }
            values[k] = parsed.data;
          } else values[k] = number || 0;
        }
        else if (k.endsWith("_en")) values[k] = v || null;
        else values[k] = v;
      }
    }
    const req = s.fields.find((f) => f.required);
    if (req && !values[req.key]) { setErr(c.required); return; }
    for (const dk of ["published_on", "event_date"]) if (dk in values && !values[dk]) delete values[dk];
    setBusy(true); setErr("");
    const q = row ? supabase.from(kind).update(values as never).eq("id", row.id) : supabase.from(kind).insert(values as never);
    const { error } = await q;
    setBusy(false);
    if (error) { setErr(c.error); return; }
    onSaved();
  }

  const input = (f: FieldDef, k: string) => {
    if (f.type === "bool") return (
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name={k} defaultChecked={Boolean(row?.[k] ?? (k === "is_recurring" && recurring))} className="h-5 w-5" />{k === "featured" ? c.featuredHint : c.fields.is_recurring}</label>
    );
    const dv = row?.[k] == null ? (recurring && (k === "title" || k === "title_en") ? c.recurring.defaultTitle : "") : String(row[k]);
    if (f.type === "select") return (
      <select name={k} defaultValue={dv || f.options?.[0]} className={field} aria-label={c.fields[(f.label ?? f.key) as keyof typeof c.fields]}>
        {f.options?.map((o) => <option key={o} value={o}>{t.partners.kinds[o as keyof typeof t.partners.kinds] ?? o}</option>)}
      </select>
    );
    if (k === "image_url") return <CmsImageUpload name={k} kind={kind} defaultValue={dv} defaultThumb={String(row?.["image_thumb_url"] ?? "")} className={field} />;
    if (RICH.has(f.key)) return <RichTextEditor name={k} defaultValue={dv} />;
    return f.long
      ? <textarea name={k} defaultValue={dv} rows={f.key === "body" ? 6 : 3} maxLength={f.key === "body" ? 20000 : 2000} className={field} />
      : <input name={k} aria-label={c.fields[f.key as keyof typeof c.fields]} type={f.type ?? "text"} min={k === "capacity" ? 1 : kind === "membership_plans" && f.type === "number" ? 0 : undefined} max={kind === "membership_plans" && f.type === "number" ? 2147483647 : undefined} step={f.type === "number" ? 1 : undefined} defaultValue={dv} maxLength={300} className={field} required={f.required && !k.endsWith("_en")} />;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full max-w-5xl flex-col rounded-t-2xl bg-background shadow-soft sm:rounded-2xl`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-display text-xl font-semibold text-navy">{row ? c.edit : c.add} · {c.tabs[recurring ? "recurring" : kind]}</p>
          <button type="button" aria-label={c.cancel} onClick={onClose} className="rounded-md p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 overflow-y-auto px-5 py-5">
          {s.fields.filter((f) => !f.hidden).map((f) => (
            <div key={f.key}>
              <p className="mb-1.5 text-sm font-medium text-navy">{c.fields[(f.label ?? f.key) as keyof typeof c.fields]}</p>
              {f.bilingual ? (
                <div className={`grid gap-3 ${RICH.has(f.key) ? "" : "md:grid-cols-2"}`}>
                  <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{c.vi}</span>{input(f, f.key)}</label>
                  <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{c.en}</span>{input(f, `${f.key}_en`)}</label>
                </div>
              ) : input(f, f.key)}
            </div>
          ))}
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="published" defaultChecked={row ? row.published : !recurring} className="h-5 w-5 accent-[var(--color-primary)]" />
            {c.published}
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-5 py-2.5 text-sm">{c.cancel}</button>
          <button disabled={busy} className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? c.saving : c.save}</button>
        </div>
      </form>
    </div>
  );
}
