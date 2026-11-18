import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CMS_MEDIA_BUCKET } from "@/lib/cms-media";

const FOLDERS = ["posts", "events", "experts", "library"] as const;
type Item = { path: string; folder: (typeof FOLDERS)[number]; size: number; created: string; url: string; usedBy: string[] };

const mediaQuery = queryOptions({
  queryKey: ["cms", "media"],
  queryFn: async (): Promise<Item[]> => {
    const bucket = supabase.storage.from(CMS_MEDIA_BUCKET);
    const lists = await Promise.all(FOLDERS.map(async (folder) => {
      const { data, error } = await bucket.list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new Error(error.message);
      return (data ?? []).filter((f) => f.id && !f.name.includes("-thumb.")).map((f) => ({ folder, path: `${folder}/${f.name}`, size: Number(f.metadata?.size ?? 0), created: f.created_at ?? "" }));
    }));
    const files = lists.flat();
    if (!files.length) return [];
    const [{ data: signed }, posts, events, experts] = await Promise.all([
      bucket.createSignedUrls(files.map((f) => f.path), 3600),
      supabase.from("posts").select("title,image_url").like("image_url", `%${CMS_MEDIA_BUCKET}%`),
      supabase.from("events").select("title,image_url").like("image_url", `%${CMS_MEDIA_BUCKET}%`),
      supabase.from("experts").select("name,image_url").like("image_url", `%${CMS_MEDIA_BUCKET}%`),
    ]);
    const rows = [...(posts.data ?? []), ...(events.data ?? []), ...(experts.data ?? []).map((e) => ({ title: e.name, image_url: e.image_url }))];
    return files.map((f, i) => ({ ...f, url: signed?.[i]?.signedUrl ?? "", usedBy: rows.filter((r) => r.image_url.includes(`/${f.path}?`)).map((r) => r.title) }));
  },
});

export function MediaLibrary() {
  const l = t.cms.library;
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(mediaQuery);
  const [busy, setBusy] = useState("");

  async function remove(path: string) {
    if (!window.confirm(l.confirm)) return;
    setBusy(path);
    const { error: e } = await supabase.storage.from(CMS_MEDIA_BUCKET).remove(path.includes("-large.") ? [path, path.replace("-large.", "-thumb.")] : [path]);
    setBusy("");
    if (e) { toast.error(l.error); return; }
    toast.success(l.deleted);
    qc.invalidateQueries({ queryKey: mediaQuery.queryKey });
  }

  async function copy(path: string) {
    // Long-lived link, same as the one saved on articles/events.
    const { data: s } = await supabase.storage.from(CMS_MEDIA_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!s?.signedUrl) { toast.error(l.error); return; }
    await navigator.clipboard.writeText(s.signedUrl);
    toast.success(l.copied);
  }

  if (isLoading) return <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label={l.loading}>{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[3/2] rounded-xl" />)}</div>;
  if (error) return <p className="mt-6 text-sm text-destructive">{l.error}</p>;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-navy">{l.title} <span className="text-sm font-normal text-muted-foreground">({data?.length ?? 0})</span></h2>
      {!data?.length ? <p className="py-10 text-center text-muted-foreground">{l.empty}</p> : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => (
            <li key={m.path} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <a href={m.url} target="_blank" rel="noreferrer" aria-label={l.open}><img src={m.url} alt="" loading="lazy" className="aspect-[3/2] w-full bg-muted object-cover" /></a>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5">{l.folders[m.folder]}</span>
                  <span className={`rounded px-2 py-0.5 ${m.usedBy.length ? "bg-primary/10 text-primary" : "bg-muted"}`}>{m.usedBy.length ? l.inUse : l.unused}</span>
                  <span>{(m.size / 1024).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} KB</span>
                  {m.created && <span>{new Date(m.created).toLocaleDateString("vi-VN")}</span>}
                </div>
                {m.usedBy.length > 0 && <p className="line-clamp-2 text-sm text-foreground">{m.usedBy.join(" · ")}</p>}
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="h-9"><a href={m.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />{l.open}</a></Button>
                  <Button variant="outline" size="icon" className="h-9 w-9" aria-label={l.copy} onClick={() => copy(m.path)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="ml-auto h-9 w-9 text-destructive" aria-label={l.del} disabled={busy === m.path} onClick={() => remove(m.path)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
