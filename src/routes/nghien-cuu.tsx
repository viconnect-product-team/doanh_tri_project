import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { EmptyResult, FilterBar, matches } from "@/components/site/FilterBar";
import { t } from "@/content/i18n";
import { BtnOutline, BtnPrimary, CircleArrow, Eyebrow, H2, PageHero, Section, Tag } from "@/components/site/Layout";
import hero from "@/assets/meeting.jpg";
import research from "@/assets/research.jpg";
import home from "@/assets/hero-home.jpg";
import training from "@/assets/training.jpg";
import event from "@/assets/event.jpg";

export const Route = createFileRoute("/nghien-cuu")({
  head: () => ({
    meta: [
      { title: "Nghiên cứu & Công bố – Viện Doanh Trí" },
      { name: "description", content: "Báo cáo, ấn phẩm và nghiên cứu chính sách của Viện Doanh Trí." },
      { property: "og:title", content: "Nghiên cứu & Công bố – Viện Doanh Trí" },
      { property: "og:description", content: "Báo cáo, ấn phẩm và nghiên cứu chính sách của Viện Doanh Trí." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Research,
});

const imgs = [home, research, training, hero, event, research];

function Research() {
  const r = t.research;
  const [topic, setTopic] = useState("");
  const [q, setQ] = useState("");
  const items = useMemo(() => r.items.map((it, i) => ({ ...it, img: imgs[i] })).filter((it) =>
    (!topic || it.topic === topic) && matches(q, it.title, it.tag, it.topic)), [topic, q, r]);

  return (
    <>
      <PageHero crumbs={[t.nav[1]!.label]} eyebrow={r.eyebrow} title={r.title} titleEm={r.titleEm} lead={r.lead} image={hero}>
        <BtnPrimary to="/nghien-cuu">{r.ctaPrimary}</BtnPrimary>
        <BtnOutline to="/lien-he">{r.ctaSecondary}</BtnOutline>
      </PageHero>
      <Section className="grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <img src={research} alt="" loading="lazy" width={1408} height={912} className="h-72 w-full rounded-lg object-cover md:h-96" />
        <div>
          <span className="rounded bg-brand-green/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-green">{r.featuredTag}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-navy md:text-4xl">{r.featuredTitle}</h2>
          <p className="mt-3 font-display text-lg text-navy/80">{r.featuredSub}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.featuredText}</p>
          <div className="mt-6 flex flex-wrap gap-3"><BtnPrimary to="/nghien-cuu">{r.featuredCta}</BtnPrimary></div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><Eyebrow>{r.listEyebrow}</Eyebrow><H2>{r.listTitle}</H2></div>
        </div>
        <div className="mt-6"><FilterBar q={q} onQ={setQ} topic={topic} onTopic={setTopic} topics={r.topics.slice(1)} placeholder={r.searchPh} count={items.length} /></div>
        {items.length === 0 && <div className="mt-8"><EmptyResult /></div>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.title} className="editorial-card group overflow-hidden rounded-lg border border-border bg-card">
              <img src={it.img} alt="" loading="lazy" width={1408} height={912} className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground"><Tag>{it.tag}</Tag>{it.date}</div>
                <h3 className="mt-3 font-display text-xl font-semibold text-navy">{it.title}</h3>
                <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" />{r.download}</span><CircleArrow />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="mt-20">
        <div className="grid gap-6 bg-navy p-8 text-navy-foreground md:grid-cols-[1.2fr_1fr_auto] md:items-center md:p-12">
          <div><Eyebrow light>{r.ctaBandEyebrow}</Eyebrow><p className="mt-4 font-display text-3xl">{r.ctaBandTitle}</p></div>
          <p className="text-sm opacity-80">{t.research.lead}</p>
          <a href="/lien-he" className="rounded-md bg-brand-green px-6 py-3.5 text-center text-sm font-medium text-brand-green-foreground">{r.ctaBandBtn}</a>
        </div>
      </Section>
    </>
  );
}
