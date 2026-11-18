import { createFileRoute } from "@tanstack/react-router";
import { Target, Cpu, Leaf, Lightbulb, Landmark, Building2 } from "lucide-react";
import { t } from "@/content/i18n";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Eyebrow, H2, PageHero, Section } from "@/components/site/Layout";
import { ConsultForm } from "@/components/site/ConsultForm";
import hero from "@/assets/meeting.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tu-van")({
  head: () => ({
    meta: [
      { title: "Tư vấn & Đổi mới – Viện Doanh Trí" },
      { name: "description", content: "Dịch vụ tư vấn chiến lược, chuyển đổi số, ESG và đổi mới sáng tạo cho doanh nghiệp." },
      { property: "og:title", content: "Tư vấn & Đổi mới – Viện Doanh Trí" },
      { property: "og:description", content: "Dịch vụ tư vấn chiến lược, chuyển đổi số, ESG và đổi mới sáng tạo cho doanh nghiệp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Consulting,
});

const icons = [Target, Cpu, Leaf, Lightbulb, Landmark, Building2];

function Consulting() {
  const c = t.consulting;
  const [service, setService] = useState(c.services[0]!.title);
  const pick = (s: string) => { setService(s); document.getElementById("dat-lich")?.scrollIntoView({ behavior: "smooth" }); };
  return (
    <>
      <PageHero crumbs={[t.nav[3]!.label]} eyebrow={c.eyebrow} title={c.title} titleEm={c.titleEm} lead={c.lead} image={hero}>
        <Button asChild className="h-auto min-h-12 px-6 py-3"><a href="#dat-lich">{c.cta} <ArrowRight className="h-4 w-4" /></a></Button>
      </PageHero>
      <Section className="py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.services.map((s, i) => {
            const I = icons[i]!;
            return (
              <div key={s.title} className="editorial-card flex flex-col rounded-lg border border-border bg-card p-7">
                <I className="h-8 w-8 text-brand-green" strokeWidth={1.5} />
                <p className="mt-5 font-display text-xl font-semibold text-navy">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <Button variant="link" type="button" onClick={() => pick(s.title)} className="mt-5 justify-start whitespace-normal px-0 text-left">{c.form.pick} <ArrowRight className="h-3.5 w-3.5" /></Button>
              </div>
            );
          })}
        </div>
      </Section>
      <Section>
        <H2>{c.processTitle}</H2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {c.process.map((p, i) => (
            <li key={p} className="border-t-2 border-primary pt-4">
              <span className="font-display text-3xl text-primary">0{i + 1}</span>
              <p className="mt-2 font-medium text-navy">{p}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="grid scroll-mt-24 grid-cols-1 gap-10 pt-24 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div id="dat-lich" className="scroll-mt-24">
          <Eyebrow>{c.form.eyebrow}</Eyebrow>
          <H2>{c.form.title}</H2>
          <p className="mt-4 text-muted-foreground">{c.form.lead}</p>
        </div>
        <ConsultForm service={service} onService={setService} />
      </Section>
    </>
  );
}
