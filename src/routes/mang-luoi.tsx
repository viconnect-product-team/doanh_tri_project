import { richTextPlain } from "@/lib/rich-text";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, ArrowRight } from "lucide-react";
import { t } from "@/content/i18n";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";
import { CommunityMembership } from "@/components/site/CommunityMembership";
import { postSourceUrl } from "@/lib/post-source";

import { BtnOutline, BtnPrimary, CircleArrow, PageHero, Section, Tag } from "@/components/site/Layout";
import hero from "@/assets/network.jpg";
import meeting from "@/assets/meeting.jpg";

export const Route = createFileRoute("/mang-luoi")({
  head: () => ({
    meta: [
      { title: `${t.network.title} ${t.network.titleEm} – ${t.brand.name}` },
      { name: "description", content: t.community.lead },
      { property: "og:title", content: `${t.network.title} ${t.network.titleEm} – ${t.brand.name}` },
      { property: "og:description", content: t.community.lead },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: Network,
});

function initials(name: string) {
  const parts = name.replace(/^(GS\.|TS\.|Ông|Prof\.|Dr\.)\s*/, "").split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function Network() {
  const n = t.network;
  const { data: { experts } } = useSuspenseQuery(publicContentQuery);
  const all = n.filters[0] ?? t.filter.all;
  const filters = [all, ...Array.from(new Set(experts.map((e) => L(e, "category")).filter(Boolean)))];
  const [f, setF] = useState(all);
  const [q, setQ] = useState("");
  const list = experts.filter((e) => (f === all || L(e, "category") === f) &&
    `${L(e, "name")} ${L(e, "role")} ${L(e, "org")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHero crumbs={[`${n.title} ${n.titleEm}`]} eyebrow={t.community.eyebrow} title={n.title} titleEm={n.titleEm} lead={t.community.lead} image={hero}>
        <Button asChild className="h-auto min-h-12 whitespace-normal px-5 py-3"><a href="#membership-plans">{t.community.plansTitle}<ArrowRight /></a></Button>
        <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal px-5 py-3 text-primary"><a href="#experts">{n.ctaPrimary}</a></Button>
      </PageHero>
      <CommunityMembership />
      <Section id="experts" className="scroll-mt-28 pb-6"><h2 className="font-display text-3xl font-semibold text-navy">{t.community.expertsTitle}</h2><p className="mt-3 text-muted-foreground">{t.community.expertsLead}</p></Section>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 md:px-8">
          {filters.map((x) => (
            <Button variant="ghost" key={x} onClick={() => setF(x)} aria-pressed={x === f} className={`h-14 rounded-none border-b-2 px-3 text-sm ${x === f ? "border-brand-green font-medium text-brand-green" : "border-transparent text-foreground hover:text-primary"}`}>{x}</Button>
          ))}
        </div>
      </div>
      <Section className="py-12">
        <label className="flex items-center gap-2 rounded-md border border-input px-3 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input aria-label={n.searchPh} value={q} onChange={(e) => setQ(e.target.value)} placeholder={n.searchPh} className="min-w-0 w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <article key={e.id} id={`experts-${e.id}`} className="editorial-card group scroll-mt-28 rounded-lg border border-border bg-card p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent font-display text-2xl font-semibold text-primary">{initials(L(e, "name"))}</div>
              <div className="mt-5"><Tag>{L(e, "category")}</Tag></div>
              <h3 className="mt-3 font-display text-xl font-semibold text-navy">{L(e, "name")}</h3>
              <p className="text-sm text-foreground/80">{L(e, "role")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{L(e, "org")}</p>
              <p className="mt-3 text-sm text-muted-foreground">{richTextPlain(L(e, "bio"))}</p>
              {postSourceUrl(e.source_url) && <div className="mt-4 border-t border-border pt-3"><p className="text-xs text-muted-foreground">{t.news.source}: {e.source_name}</p><Button asChild variant="link" className="h-auto whitespace-normal px-0"><a href={postSourceUrl(e.source_url) ?? undefined} target="_blank" rel="noopener noreferrer">{t.news.readOriginal}<ArrowRight className="h-4 w-4" /></a></Button></div>}
            </article>
          ))}
        </div>
        {!list.length && <p className="py-8 text-muted-foreground">{t.filter.empty}</p>}
      </Section>
      <Section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden bg-navy p-8 text-navy-foreground md:p-12">
          <img src={meeting} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <p className="relative max-w-xl font-display text-2xl leading-snug md:text-3xl">“{n.quote}”</p>
          <p className="relative mt-6 text-sm opacity-70">{t.brand.name}</p>
        </div>
        <div className="border-t-2 border-brand-green bg-muted p-8">
          <Users className="h-9 w-9 text-primary" strokeWidth={1.5} />
          <p className="mt-4 font-display text-2xl font-semibold text-navy">{n.joinTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">{n.joinText}</p>
          <div className="mt-6"><BtnPrimary to="/lien-he">{n.joinCta}</BtnPrimary></div>
        </div>
      </Section>
    </>
  );
}
