import { richTextPlain } from "@/lib/rich-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Compass, Gem, Mountain, Facebook, Mail, MapPin } from "lucide-react";
import { t } from "@/content/i18n";
import { Eyebrow, H2, PageHero, Pillars, Section } from "@/components/site/Layout";
import hero from "@/assets/hero-home.jpg";
import meeting from "@/assets/meeting.jpg";
import { FounderProfile } from "@/components/site/FounderProfile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { INSTITUTE_CONTACT } from "@/lib/contact";

export const Route = createFileRoute("/ve-vien")({
  head: () => ({
    meta: [
      { title: "Về Viện – Viện Doanh Trí" },
      { name: "description", content: "Khám phá Viện Doanh Trí: sứ mệnh, tầm nhìn và chân dung CEO Lê Dung, nhà sáng lập Viện và Chủ tịch sáng lập CEO 1983." },
      { property: "og:title", content: "Về Viện – Viện Doanh Trí" },
      { property: "og:description", content: "Sứ mệnh, tầm nhìn và chân dung CEO Lê Dung – người sáng lập Viện Doanh Trí, kết nối tri thức và doanh nhân." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: About,
});

const icons = [Mountain, Compass, Gem];

function About() {
  const a = t.about;
  const [tab, setTab] = useState("0");
  const { data: { experts } } = useSuspenseQuery(publicContentQuery);
  const council = experts.filter((expert) => /hội đồng|council/i.test(`${expert.role} ${expert.role_en ?? ""}`));
  const selectTab = (value: string) => {
    setTab(value);
    requestAnimationFrame(() => document.getElementById("about-tabs")?.scrollIntoView({ behavior: "instant", block: "start" }));
  };
  return (
    <>
      <PageHero crumbs={[t.nav[0]?.label ?? t.common.home]} title={a.title} titleEm={a.titleEm} lead={a.lead} image={hero}>
        <Button className="min-h-12" onClick={() => selectTab("1")}>{a.ctaPrimary}</Button>
        <Button asChild variant="outline" className="min-h-12 text-primary"><a href="#ceo-le-dung" onClick={() => setTab("0")}>{a.ctaSecondary}</a></Button>
        <Button asChild variant="outline" className="min-h-12 text-primary"><a href="#ceo-le-dung" onClick={() => setTab("0")}>{a.founder.explore}</a></Button>
      </PageHero>
      <Tabs id="about-tabs" value={tab} onValueChange={setTab} className="scroll-mt-20">
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-8">
          <TabsList aria-label={`${a.title} ${a.titleEm}`} className="h-auto w-max min-w-full justify-start gap-6 rounded-none bg-transparent p-0">
          {a.tabs.map((tab, i) => (
            <TabsTrigger key={tab} value={String(i)} onFocus={(e) => e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })} className="min-h-14 rounded-none border-b-2 border-transparent px-0 py-4 text-sm text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">{tab}</TabsTrigger>
          ))}
          </TabsList>
        </div>
      </div>
      <TabsContent value="0" className="mt-0">
      <Section className="grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <Eyebrow>{a.overviewEyebrow}</Eyebrow>
          <H2>{a.overviewTitle}</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{a.subtitle} {t.home.aboutText}</p>
        </div>
        <Pillars />
      </Section>
      <FounderProfile />
      <Section className="border-t border-border py-16">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-10">
          <Eyebrow>{t.contact.eyebrow}</Eyebrow>
          <H2>{t.brand.name} (IEM)</H2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.footer.about}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
              <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase text-muted-foreground">{t.contact.addressLabel}</span>
                <p className="mt-1 text-sm font-medium text-navy">{t.contact.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
              <Mail className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase text-muted-foreground">{t.contact.emailLabel}</span>
                <a href={`mailto:${INSTITUTE_CONTACT.email}`} className="mt-1 block break-all text-sm font-medium text-primary hover:underline">{INSTITUTE_CONTACT.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
              <Facebook className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <span className="block text-xs font-semibold uppercase text-muted-foreground">{t.contact.fanpageLabel}</span>
                <a href={INSTITUTE_CONTACT.fanpageUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-medium text-primary hover:underline">{t.contact.fanpageName}</a>
              </div>
            </div>
          </div>
        </div>
      </Section>
      </TabsContent>
      <TabsContent value="1" className="mt-0">
      <Section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr_1fr]">
        <img src={meeting} alt="" loading="lazy" width={1408} height={912} className="h-80 w-full rounded-lg object-cover" />
        <div>
          <Eyebrow>{a.missionEyebrow}</Eyebrow>
          <H2>{a.missionTitle}</H2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.missionText}</p>
        </div>
        <ul className="space-y-6 lg:border-l lg:border-border lg:pl-8">
          {a.values.slice(0, 2).map((v, i) => {
            const I = icons[i] ?? Gem;
            return (
              <li key={v.title} className="flex gap-4">
                <I className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />
                <div><p className="font-semibold text-navy">{v.title}</p><p className="mt-1 text-sm text-muted-foreground">{v.desc}</p></div>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section className="border-t border-border py-16">
        <H2>{a.directionTitle}</H2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {a.directions.map((direction) => <article key={direction.title} className="border-t-2 border-primary pt-5"><h3 className="text-lg font-semibold text-navy">{direction.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{direction.desc}</p></article>)}
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-xl font-semibold text-navy">{a.communityDirectionTitle}</h3>
          <p className="mt-4 max-w-4xl leading-relaxed text-muted-foreground">{a.communityDirectionText}</p>
          <Button asChild variant="link" className="mt-4 px-0"><Link to="/mang-luoi">{a.communityCta}</Link></Button>
          <p className="mt-6 max-w-4xl border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">{a.proposalNote}</p>
        </div>
      </Section>
      </TabsContent>
      <TabsContent value="2" className="mt-0">
        <Section className="py-16">
          <Eyebrow>{a.tabs[2]}</Eyebrow>
          <H2>{a.values[2]?.title}</H2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{a.values[2]?.desc}</p>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {a.coreValues.map((value) => <article key={value.title} className="border-t border-border pt-5"><h3 className="text-xl font-semibold text-navy">{value.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{value.desc}</p></article>)}
          </div>
        </Section>
      </TabsContent>
      <TabsContent value="3" className="mt-0">
        <Section className="py-16"><Eyebrow>{a.tabs[3]}</Eyebrow><div className="mt-8"><Pillars /></div></Section>
      </TabsContent>
      <TabsContent value="4" className="mt-0">
        <Section className="py-16">
          <Eyebrow>{a.tabs[4]}</Eyebrow>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {council.map((expert) => (
              <article key={expert.id} className="editorial-card rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-navy">{L(expert, "name")}</h2>
                <p className="mt-2 text-primary">{L(expert, "role")}</p>
                <p className="mt-4 leading-relaxed text-muted-foreground">{richTextPlain(L(expert, "bio"))}</p>
                <Button asChild variant="link" className="mt-4 px-0"><Link to="/mang-luoi" hash={`experts-${expert.id}`}>{t.community.expertsTitle}</Link></Button>
              </article>
            ))}
          </div>
          {!council.length && <p className="mt-6 text-muted-foreground">{t.filter.empty}</p>}
        </Section>
      </TabsContent>
      <TabsContent value="5" className="mt-0">
        <Section className="py-16">
          <Eyebrow>{a.tabs[5]}</Eyebrow><H2>{t.network.joinTitle}</H2>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">{t.network.joinText}</p>
          <Button asChild className="mt-6 min-h-12"><Link to="/lien-he" search={{ department: "partnership" }}>{t.network.joinCta}</Link></Button>
        </Section>
      </TabsContent>
      </Tabs>
    </>
  );
}
