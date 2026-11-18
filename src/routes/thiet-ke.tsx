import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/content/i18n";
import { H2, Section } from "@/components/site/Layout";

const mods = import.meta.glob<{ default: string }>("@/assets/designs/*.webp", { eager: true });
const designs = Object.keys(mods).sort().map((k) => mods[k]!.default);

export const Route = createFileRoute("/thiet-ke")({
  head: () => ({
    meta: [
      { title: "Bộ thiết kế website – Viện Doanh Trí" },
      { name: "description", content: "Bộ thiết kế giao diện website Viện Doanh Trí (IEM)." },
      { property: "og:title", content: "Bộ thiết kế website – Viện Doanh Trí" },
      { property: "og:description", content: "Bộ thiết kế giao diện website Viện Doanh Trí (IEM)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  return (
    <Section className="py-14">
      <H2>{t.gallery.title}</H2>
      <p className="mt-2 text-muted-foreground">{designs.length} {t.gallery.count}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {designs.map((url, i) => (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border shadow-soft">
            <img src={url} alt={`${t.gallery.title} ${i + 1}`} loading="lazy" className="w-full" />
          </a>
        ))}
      </div>
    </Section>
  );
}
