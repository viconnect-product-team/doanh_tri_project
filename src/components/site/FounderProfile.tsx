import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, H2, Section } from "@/components/site/Layout";
import { t } from "@/content/i18n";
import portrait from "@/assets/founder/le-dung-portrait.jpeg";
import ceremony from "@/assets/founder/le-dung-ceremony.jpeg";
import event from "@/assets/founder/le-dung-event.jpeg";

export function FounderProfile() {
  const f = t.about.founder;
  return (
    <div className="border-y border-border bg-secondary/50">
      <Section id="ceo-le-dung" className="scroll-mt-28 py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <figure className="min-w-0">
            <img src={portrait} alt={f.portraitAlt} width={660} height={990} loading="lazy" className="mx-auto aspect-[2/3] w-full max-w-md rounded-lg object-cover" />
            <figcaption className="mx-auto mt-3 max-w-md text-xs text-muted-foreground">{f.photoCredit}</figcaption>
          </figure>
          <div className="lg:py-4">
            <Eyebrow>{f.eyebrow}</Eyebrow>
            <H2>{f.name}</H2>
            <p className="mt-3 text-base font-semibold text-primary">{f.role}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.fullName}</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground">{f.intro}</p>
            <div className="mt-8 space-y-6">
              {f.facets.map((facet, i) => (
                <div key={facet.title} className="border-t border-border pt-5">
                  <h3 className="text-base font-semibold text-navy">{facet.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{facet.text}{" "}
                    <a href={facet.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4" aria-label={`${t.news.source}: ${facet.publisher}`}>[{i + 1}]</a>
                  </p>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-8 min-h-12 whitespace-normal">
              <Link to="/tin-tuc">{f.newsLink}<ArrowRight className="h-4 w-4 shrink-0" /></Link>
            </Button>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-xl font-semibold text-navy">{f.galleryTitle}</h3>
          <div className="mt-5 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            {[{ asset: ceremony, caption: f.ceremonyCaption }, { asset: event, caption: f.eventCaption }].map(({ asset, caption }) => (
              <figure key={asset} className="min-w-0">
                <img src={asset} alt={caption} loading="lazy" className="aspect-[3/2] w-full rounded-lg bg-muted object-contain" />
                <figcaption className="mt-3 text-sm text-muted-foreground">{caption}<span className="mt-1 block text-xs">{f.photoCredit}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{f.sourcesTitle}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {f.facets.map((facet, i) => <li key={facet.url}><a href={facet.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline">[{i + 1}] {facet.publisher}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></li>)}
          </ul>
        </div>
      </Section>
    </div>
  );
}