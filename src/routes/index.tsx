import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessagesSquare, Users, BookOpen } from "lucide-react";
import { t } from "@/content/i18n";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L, formatDate } from "@/lib/localized";

import { BtnOutline, BtnPrimary, CircleArrow, Eyebrow, H2, Pillars, Section, Tag } from "@/components/site/Layout";
import { PartnersShowcase } from "@/components/site/PartnersShowcase";
import { AiAdvisor } from "@/components/site/AiAdvisor";
import hero from "@/assets/hero-home.jpg";
import meeting from "@/assets/meeting.jpg";
import event from "@/assets/event.jpg";
import research from "@/assets/research.jpg";
import training from "@/assets/training.jpg";
import communityDinner from "@/assets/community-dinner.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viện Doanh Trí – Khai mở Doanh trí, Kiến tạo Tương lai" },
      { name: "description", content: "Viện Doanh Trí kết nối tri thức, doanh nhân và công nghệ vì một Việt Nam thịnh vượng." },
      { property: "og:title", content: "Viện Doanh Trí – Khai mở Doanh trí, Kiến tạo Tương lai" },
      { property: "og:description", content: "Viện Doanh Trí kết nối tri thức, doanh nhân và công nghệ vì một Việt Nam thịnh vượng." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: Home,
});

function Home() {
  const h = t.home;
  const community = h.communitySpotlight;
  const communityIcons = [MessagesSquare, Users, BookOpen];
  const { data: { posts } } = useSuspenseQuery(publicContentQuery);
  const imgs = [event, research, training];
  const news = posts.slice(0, 3).map((p, i) => ({ id: p.id, img: imgs[i] ?? event, tag: L(p, "tag"), title: L(p, "title"), date: formatDate(p.published_on) }));
  return (
    <>
      <section className="site-hero relative overflow-hidden bg-navy text-hero-foreground">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover object-right" width={1600} height={912} />
        <div className="absolute inset-0 bg-hero-scrim" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16 lg:py-20">
          <div className="hero-copy max-w-3xl">
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[1.15] md:text-6xl lg:text-7xl">{t.brand.name}</h1>
            <p className="mt-4 text-2xl font-medium leading-snug md:text-3xl">{h.title1} {h.titleEm}<br />{h.title2}</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed md:text-lg">{h.lead}</p>
            <div className="hero-actions mt-8 flex flex-wrap gap-3">
              <BtnPrimary to="/ve-vien">{h.ctaPrimary}</BtnPrimary>
              <BtnOutline to="/lien-he">{h.ctaSecondary}</BtnOutline>
            </div>
          </div>
        </div>
      </section>
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-3 md:px-8">
          {h.steps.map((s, i) => <div key={s} className="flex items-center gap-4"><span className="text-sm font-semibold text-brand-green">0{i + 1}</span><span className="text-xs font-semibold text-foreground">{s}</span></div>)}
        </div>
      </div>

      <div className="border-b border-border bg-muted">
        <Section id="community-spotlight" className="py-12 md:py-16">
          <div className="max-w-3xl">
            <Eyebrow>{community.eyebrow}</Eyebrow>
            <H2>{community.title}</H2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{community.lead}</p>
          </div>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
            <figure className="min-w-0">
              <img src={communityDinner} alt={community.imageAlt} loading="lazy" width={1200} height={800} className="aspect-[3/2] w-full rounded-lg object-cover" />
              <figcaption className="mt-2 text-xs text-muted-foreground">{community.imageCaption}</figcaption>
            </figure>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-green">{t.community.name}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy md:text-3xl">{community.dinnerTitle}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{community.dinnerText}</p>
              <ul className="mt-6 space-y-3 border-y border-border py-5">
                {community.highlights.map((label, i) => { const Icon = communityIcons[i] ?? Users; return <li key={label} className="flex items-center gap-3 text-sm font-medium text-foreground"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-green" />{label}</li>; })}
              </ul>
              <div className="mt-6 flex flex-col items-start gap-3">
                <Button asChild className="h-auto min-h-12 whitespace-normal px-5 py-3 text-left"><Link to="/mang-luoi" hash="membership-register">{community.join}<ArrowRight className="h-4 w-4 shrink-0" /></Link></Button>
                <Button asChild variant="link" className="h-auto min-h-11 whitespace-normal px-0 text-left"><Link to="/mang-luoi" hash="membership-plans">{community.explore}<ArrowRight className="h-4 w-4 shrink-0" /></Link></Button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{community.note}</p>
            </div>
          </div>
        </Section>
      </div>

      <Section className="grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <Eyebrow>{h.aboutEyebrow}</Eyebrow>
          <H2>{h.aboutTitle1}<br /><em className="text-brand-green">{h.aboutTitleEm}</em> {h.aboutTitle2}</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{h.aboutText}</p>
          <Link to="/ve-vien" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4">{h.aboutLink}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <Pillars />
      </Section>

      <div className="bg-muted">
      <Section>
        <div className="grid py-12 lg:grid-cols-[1.1fr_1fr_0.9fr]">
          <img src={meeting} alt="" loading="lazy" width={1408} height={912} className="h-72 w-full object-cover lg:h-full" />
          <div className="p-8 md:p-10">
            <Eyebrow>{h.focusEyebrow}</Eyebrow>
            <H2>{h.focusTitle}</H2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{h.focusText}</p>
            <div className="mt-6"><BtnPrimary to="/dao-tao">{h.focusCta}</BtnPrimary></div>
          </div>
          <ul className="border-t border-border p-8 lg:border-l lg:border-t-0">
            {h.focusList.map((f, i) => (
              <li key={f.to}>
                <Link to={f.to} className="group flex items-center justify-between border-b border-border py-5 text-navy">
                  <span><span className="mr-4 text-primary">0{i + 1}</span>{f.label}</span><CircleArrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      </div>

      <Section className="pt-20"><AiAdvisor /></Section>

      <Section className="py-20">
        <div className="grid grid-cols-2 gap-8 border-y border-border py-10 md:grid-cols-4">
          {h.stats.map((s) => (
            <div key={s.label}><p className="font-display text-4xl font-semibold text-primary md:text-5xl">{s.value}</p><p className="mt-2 text-sm text-muted-foreground">{s.label}</p></div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between">
          <H2>{h.newsTitle}</H2>
          <Link to="/tin-tuc" className="hidden text-sm font-medium text-primary underline underline-offset-4 sm:block">{t.common.viewAll}</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <Link to="/tin-tuc" key={n.id} className="editorial-card group overflow-hidden rounded-lg border border-border bg-card">
              <img src={n.img} alt="" loading="lazy" width={1408} height={912} className="h-48 w-full object-cover transition group-hover:scale-[1.02]" />
              <div className="p-5">
                <Tag>{n.tag}</Tag>
                <p className="mt-3 font-display text-xl font-semibold text-navy">{n.title}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">{n.date}<CircleArrow /></div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <PartnersShowcase />
    </>
  );
}
