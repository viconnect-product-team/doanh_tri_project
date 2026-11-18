import { richTextPlain } from "@/lib/rich-text";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, ArrowRight } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { t } from "@/content/i18n";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";
import { postSourceUrl } from "@/lib/post-source";
import { BtnPrimary, PageHero, Section, Tag } from "@/components/site/Layout";
import hero from "@/assets/network.jpg";

const pageTitle = () => `${t.expertsPage.title} ${t.expertsPage.titleEm} – ${t.brand.name}`;

export const Route = createFileRoute("/chuyen-gia")({
  head: () => ({
    meta: [
      { title: pageTitle() },
      { name: "description", content: t.expertsPage.lead },
      { property: "og:title", content: pageTitle() },
      { property: "og:description", content: t.expertsPage.lead },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: ExpertsPage,
  errorComponent: ({ error }) => <div role="alert" className="p-8">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-8">{t.filter.empty}</div>,
});

function initials(name: string) {
  const parts = name.replace(/^(GS\.|TS\.|PGS\.|ThS\.|Ông|Bà|Prof\.|Dr\.)\s*/, "").split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function ExpertsPage() {
  const p = t.expertsPage;
  const { data: { experts } } = useSuspenseQuery(publicContentQuery);
  const all = t.filter.all;
  const filters = [all, ...Array.from(new Set(experts.map((e) => L(e, "category")).filter(Boolean)))];
  const [f, setF] = useState(all);
  const [q, setQ] = useState("");
  const list = experts.filter((e) => (f === all || L(e, "category") === f) &&
    `${L(e, "name")} ${L(e, "role")} ${L(e, "org")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHero crumbs={[`${p.title} ${p.titleEm}`]} eyebrow={p.eyebrow} title={p.title} titleEm={p.titleEm} lead={p.lead} image={hero} />
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 md:px-8">
          {filters.map((x) => (
            <Button variant="ghost" key={x} onClick={() => setF(x)} aria-pressed={x === f} className={`h-14 shrink-0 rounded-none border-b-2 px-3 text-sm ${x === f ? "border-brand-green font-medium text-brand-green" : "border-transparent text-foreground hover:text-primary"}`}>{x}</Button>
          ))}
        </div>
      </div>
      <Section className="py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-md border border-input px-3 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input aria-label={t.network.searchPh} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.network.searchPh} className="w-full min-w-0 bg-transparent text-sm outline-none" />
          </label>
          <p className="text-sm text-muted-foreground">{list.length} {p.count}</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <article key={e.id} id={`experts-${e.id}`} className="editorial-card flex scroll-mt-28 flex-col rounded-lg border border-border bg-card p-6">
              {e.image_thumb_url || e.image_url ? <img src={e.image_thumb_url || e.image_url} alt={L(e, "name")} loading="lazy" className="h-24 w-24 rounded-full object-cover ring-2 ring-border" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent font-display text-2xl font-semibold text-primary">{initials(L(e, "name"))}</div>}
              {L(e, "category") && <div className="mt-5"><Tag>{L(e, "category")}</Tag></div>}
              <h2 className="mt-3 font-display text-xl font-semibold text-navy">{L(e, "name")}</h2>
              <p className="text-sm text-foreground/80">{L(e, "role")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{L(e, "org")}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{richTextPlain(L(e, "bio"))}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <BtnPrimary to="/lien-he">{p.book}</BtnPrimary>
                {postSourceUrl(e.source_url) && <Button asChild variant="link" className="h-auto px-0"><a href={postSourceUrl(e.source_url) ?? undefined} target="_blank" rel="noopener noreferrer">{t.news.source}<ArrowRight className="h-4 w-4" /></a></Button>}
              </div>
            </article>
          ))}
        </div>
        {!list.length && <p className="py-8 text-muted-foreground">{t.filter.empty}</p>}
      </Section>
      <Section className="pb-16">
        <div className="flex flex-col items-start gap-4 border-t-2 border-brand-green bg-muted p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Users className="h-9 w-9 text-primary" strokeWidth={1.5} />
            <p className="mt-4 font-display text-2xl font-semibold text-navy">{p.joinTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.joinText}</p>
          </div>
          <BtnPrimary to="/lien-he">{p.joinCta}</BtnPrimary>
        </div>
      </Section>
    </>
  );
}
