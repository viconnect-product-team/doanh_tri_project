import { richTextPlain } from "@/lib/rich-text";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, BookOpen, Users, Sparkles, Network } from "lucide-react";
import { t } from "@/content/i18n";
import { useState } from "react";
import { EmptyResult, FilterBar, matches } from "@/components/site/FilterBar";
import { CourseRegister } from "@/components/site/CourseRegister";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Button } from "@/components/ui/button";

import { BtnOutline, BtnPrimary, CircleArrow, Eyebrow, H2, PageHero, Section, Tag } from "@/components/site/Layout";
import hero from "@/assets/training.jpg";
import meeting from "@/assets/meeting.jpg";
import research from "@/assets/research.jpg";
import home from "@/assets/hero-home.jpg";

export const Route = createFileRoute("/dao-tao")({
  head: () => ({
    meta: [
      { title: "Đào tạo & Phát triển – Viện Doanh Trí" },
      { name: "description", content: "Chương trình đào tạo lãnh đạo, chuyển đổi số, ESG và đổi mới sáng tạo." },
      { property: "og:title", content: "Đào tạo & Phát triển – Viện Doanh Trí" },
      { property: "og:description", content: "Chương trình đào tạo lãnh đạo, chuyển đổi số, ESG và đổi mới sáng tạo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: Training,
});

const imgs = [meeting, hero, research, meeting];
const whyIcons = [BookOpen, Users, Sparkles, Network];

function Training() {
  const d = t.training;
  const { data: { courses: all } } = useSuspenseQuery(publicContentQuery);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const [reg, setReg] = useState<{ course: string; meta: string } | null>(null);
  const topics = Array.from(new Set(all.map((c) => L(c, "tag")).filter(Boolean)));
  const courses = all.filter((c) => (!topic || L(c, "tag") === topic) && matches(q, L(c, "title"), richTextPlain(L(c, "description")), L(c, "tag")));
  return (
    <>
      <PageHero crumbs={[t.nav[2]!.label]} eyebrow={d.eyebrow} title={d.title} lead={d.lead} image={hero}>
        <BtnPrimary to="/dao-tao">{d.ctaPrimary}</BtnPrimary>
        <BtnOutline to="/lien-he">{d.ctaSecondary}</BtnOutline>
      </PageHero>
      <Section className="grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
        <div>
          <Eyebrow>{d.listEyebrow}</Eyebrow>
          <H2>{d.listTitle}</H2>
          <div className="mt-6"><FilterBar q={q} onQ={setQ} topic={topic} onTopic={setTopic} topics={topics} placeholder={d.searchPh} count={courses.length} /></div>
          {courses.length === 0 && <div className="mt-8"><EmptyResult /></div>}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {courses.map((p) => (
              <article key={p.id} id={`courses-${p.id}`} className="editorial-card group scroll-mt-28 overflow-hidden rounded-lg border border-border bg-card">
                <img src={imgs[all.indexOf(p) % imgs.length]} alt="" loading="lazy" width={1408} height={912} className="h-44 w-full object-cover" />
                <div className="p-5">
                  <Tag>{L(p, "tag")}</Tag>
                  <h3 className="mt-3 font-display text-xl font-semibold text-navy">{L(p, "title")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{richTextPlain(L(p, "description"))}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="flex gap-4"><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{d.start}: {p.start_date}</span><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{L(p, "duration")}</span></span>
                    <Button type="button" onClick={() => setReg({ course: L(p, "title"), meta: [p.start_date && `${d.start}: ${p.start_date}`, L(p, "duration")].filter(Boolean).join(" · ") })} className="min-h-11 px-4">{d.registerBtn}</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="relative mt-8 overflow-hidden bg-navy p-8 text-navy-foreground md:p-12">
            <img src={home} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="relative max-w-lg">
              <Eyebrow light>{d.flagshipEyebrow}</Eyebrow>
              <p className="mt-4 font-display text-4xl">{d.flagshipTitle}</p>
              <p className="mt-4 text-sm opacity-85">{d.flagshipText}</p>
              <Button variant="outline" type="button" onClick={() => setReg({ course: d.flagshipTitle, meta: "" })} className="mt-6 min-h-12 px-6 text-primary">{d.registerBtn}</Button>
            </div>
          </div>
        </div>
        <aside className="h-fit border-t-2 border-brand-green bg-muted p-6 lg:sticky lg:top-24">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-green">{d.whyTitle}</p>
          <ul className="mt-6 space-y-6">
            {d.why.map((w, i) => {
              const I = whyIcons[i]!;
              return (
                <li key={w.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-brand-green"><I className="h-5 w-5" /></span>
                  <div><p className="font-semibold text-navy">{w.title}</p><p className="mt-1 text-sm text-muted-foreground">{w.desc}</p></div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8"><BtnPrimary to="/lien-he">{d.whyCta}</BtnPrimary></div>
        </aside>
      </Section>
      {reg && <CourseRegister course={reg.course} meta={reg.meta} onClose={() => setReg(null)} />}
    </>
  );
}
