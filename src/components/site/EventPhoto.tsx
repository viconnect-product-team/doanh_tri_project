const ok = (u?: string) => !!u && (u.startsWith("/assets/") || u.startsWith("https://"));

export function EventPhoto({ url, thumb, caption, title, compact = false }: { url: string; thumb?: string; caption: string; title: string; compact?: boolean }) {
  if (!ok(url)) return null;
  const hasThumb = ok(thumb);
  // Lists prefer the thumbnail; phones get it via srcset even on detail pages.
  const src = compact && hasThumb ? thumb! : url;
  return <figure className="mb-5 overflow-hidden rounded-md border border-border bg-muted">
    <img src={src} srcSet={hasThumb ? `${thumb} 640w, ${url} 1600w` : undefined} sizes={compact ? "(min-width: 768px) 400px, 100vw" : "(min-width: 768px) 900px, 100vw"}
      alt={caption || title} loading="lazy" decoding="async" width={960} height={640} className="aspect-[3/2] w-full object-contain" />
    {caption && <figcaption className="border-t border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground">{caption}</figcaption>}
  </figure>;
}
