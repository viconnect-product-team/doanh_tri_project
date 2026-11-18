import { richTextPlain } from "@/lib/rich-text";
import { useSuspenseQuery } from "@tanstack/react-query";
import { t } from "@/content/i18n";
import { publicContentQuery, type Partner } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { postSourceUrl } from "@/lib/post-source";
import { Eyebrow, H2, Section } from "@/components/site/Layout";

const KINDS = ["client", "partner", "sponsor"] as const;

function PartnerCard({ p }: { p: Partner }) {
  const name = L(p, "name");
  const url = postSourceUrl(p.website_url);
  const body = (
    <>
      <div className="flex h-20 items-center justify-center">
        {p.image_url
          ? <img src={p.image_thumb_url || p.image_url} alt={name} loading="lazy" className="max-h-16 max-w-full object-contain" />
          : <span className="text-center font-display text-lg font-semibold text-navy">{name}</span>}
      </div>
      {p.image_url && <p className="mt-3 text-center text-sm font-medium text-foreground">{name}</p>}
      {L(p, "description") && <p className="mt-1 line-clamp-2 text-center text-xs text-muted-foreground">{richTextPlain(L(p, "description"))}</p>}
    </>
  );
  const cls = "editorial-card flex flex-col justify-center rounded-lg border border-border bg-card p-5";
  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} – ${t.partners.visit}`} className={`${cls} transition-colors hover:border-primary`}>{body}</a>
    : <div className={cls}>{body}</div>;
}

export function PartnersShowcase() {
  const { data: { partners } } = useSuspenseQuery(publicContentQuery);
  if (!partners.length) return null;
  return (
    <Section id="partners" className="scroll-mt-28">
      <Eyebrow>{t.partners.eyebrow}</Eyebrow>
      <H2>{t.partners.title}</H2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t.partners.lead}</p>
      {KINDS.map((k) => {
        const list = partners.filter((p) => p.category === k);
        if (!list.length) return null;
        return (
          <div key={k} className="mt-10">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.partners.kinds[k]}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {list.map((p) => <PartnerCard key={p.id} p={p} />)}
            </div>
          </div>
        );
      })}
    </Section>
  );
}
