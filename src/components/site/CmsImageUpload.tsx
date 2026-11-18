import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";
import { CMS_IMAGE_SIZES, CMS_MEDIA_BUCKET, CMS_MEDIA_LINK_SECONDS, CMS_MEDIA_TYPES, fitWidth, validateCmsImage } from "@/lib/cms-media";

export async function resize(file: File, maxWidth: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const { width, height } = fitWidth(bmp.width, bmp.height, maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("encode"))), "image/webp", 0.82));
}

export function CmsImageUpload({ name, kind, defaultValue, defaultThumb, className }: { name: string; kind: string; defaultValue: string; defaultThumb: string; className: string }) {
  const u = t.cms.upload;
  const [url, setUrl] = useState(defaultValue);
  const [thumb, setThumb] = useState(defaultThumb);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    if (!validateCmsImage(file)) { setMsg({ ok: false, text: u.error }); return; }
    setBusy(true); setMsg(null);
    const bucket = supabase.storage.from(CMS_MEDIA_BUCKET);
    const id = crypto.randomUUID();
    const links = { large: "", thumb: "" };
    try {
      for (const size of ["large", "thumb"] as const) {
        const path = `${kind}/${id}-${size}.webp`;
        const blob = await resize(file, CMS_IMAGE_SIZES[size]);
        const up = await bucket.upload(path, blob, { contentType: "image/webp" });
        if (up.error) throw up.error;
        const { data } = await bucket.createSignedUrl(path, CMS_MEDIA_LINK_SECONDS);
        if (!data?.signedUrl) throw new Error("link");
        links[size] = data.signedUrl;
      }
    } catch { setBusy(false); setMsg({ ok: false, text: u.error }); return; }
    setBusy(false);
    setUrl(links.large); setThumb(links.thumb); setMsg({ ok: true, text: u.done });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="image_thumb_url" value={thumb} />
      {url && (url.startsWith("https://") || url.startsWith("/")) && (
        <div className="relative w-full max-w-xs overflow-hidden rounded-md border border-border bg-muted">
          <img src={thumb || url} alt="" className="aspect-[3/2] w-full object-cover" />
          <Button type="button" size="icon" variant="secondary" aria-label={u.remove} onClick={() => { setUrl(""); setThumb(""); }} className="absolute right-2 top-2 h-8 w-8"><X className="h-4 w-4" /></Button>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name={name} value={url} onChange={(e) => { setUrl(e.target.value); setThumb(""); }} maxLength={2000} aria-label={t.cms.fields.image_url} className={className} />
        <label className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy ? u.uploading : u.choose}
          <input type="file" accept={CMS_MEDIA_TYPES.join(",")} className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
      </div>
      {msg && <p role="status" className={`text-xs ${msg.ok ? "text-muted-foreground" : "text-destructive"}`}>{msg.text}</p>}
    </div>
  );
}
