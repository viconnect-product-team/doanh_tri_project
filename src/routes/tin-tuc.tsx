import { RichTextView } from "@/components/site/RichTextEditor";
import { richTextPlain } from "@/lib/rich-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, User, ArrowRight, ExternalLink } from "lucide-react";
import { t } from "@/content/i18n";
import { useState } from "react";
import { EmptyResult, FilterBar, matches } from "@/components/site/FilterBar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L, formatDate } from "@/lib/localized";
import { postSourceUrl } from "@/lib/post-source";
import { eventIsPast } from "@/lib/event-schedule";
import { Button } from "@/components/ui/button";
import { EventPhoto } from "@/components/site/EventPhoto";
import { BtnPrimary, CircleArrow, Eyebrow, H2, PageHero, Section, Tag } from "@/components/site/Layout";
import hero from "@/assets/event.jpg";

export const Route = createFileRoute("/tin-tuc")({
  head: () => ({
    meta: [
      { title: "Tin tức & Sự kiện – Viện Doanh Trí" },
      { name: "description", content: "Hội thảo, tọa đàm, khóa học và hoạt động kết nối của Viện Doanh Trí." },
      { property: "og:title", content: "Tin tức & Sự kiện – Viện Doanh Trí" },
      { property: "og:description", content: "Hội thảo, tọa đàm, khóa học và hoạt động kết nối của Viện Doanh Trí." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  component: News,
});

function News() {
  const n = t.news;
  const { data: { posts: allPosts, events: allEvents } } = useSuspenseQuery({ ...publicContentQuery, refetchInterval: 30_000 });
  const today = new Date().toISOString().slice(0, 10);
  const ev = allEvents.map((e) => ({ id: e.id, capacity: e.capacity, total: e.registered_participants, featured: e.featured, date: e.event_date, title: L(e, "title"), tag: L(e, "tag"), topic: L(e, "topic"), desc: richTextPlain(L(e, "description")), place: L(e, "place"), mode: L(e, "mode"), people: L(e, "attendees"), time: e.time_range, source: e.source_name, sourceUrl: postSourceUrl(e.source_url), img: e.image_url, thumb: e.image_thumb_url, caption: L(e, "image_caption") }));
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const topics = Array.from(new Set([...ev.flatMap((e) => [e.tag, e.topic]), ...allPosts.map((p) => L(p, "tag"))].filter(Boolean)));
  const hit = (e: (typeof ev)[number]) => (!topic || e.tag === topic || e.topic === topic) && matches(q, e.title, e.desc, e.place, e.tag, e.topic, e.mode);
  const events = ev.filter((e) => e.featured && !eventIsPast(e.date, today) && hit(e));
  const posts = allPosts.filter((p) => (!topic || L(p, "tag") === topic) && matches(q, L(p, "title"), L(p, "excerpt"), richTextPlain(L(p, "body")), L(p, "tag")));
  const upcoming = ev.filter((e) => !e.featured && !eventIsPast(e.date, today) && hit(e));
  const past = ev.filter(e => eventIsPast(e.date, today) && hit(e)).sort((a, b) => b.date.localeCompare(a.date));
  const total = events.length + posts.length + upcoming.length + past.length;
  return (
    <>
      <PageHero crumbs={[t.nav[5]?.label ?? n.title]} eyebrow={n.eyebrow} title={n.title} titleEm={n.titleEm} lead={n.lead} image={hero} />
      <Section className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <FilterBar q={q} onQ={setQ} topic={topic} onTopic={setTopic} topics={topics} placeholder={n.searchPh} count={total} />
          {total === 0 && <div className="mt-8"><EmptyResult /></div>}
          <h2 className="mt-10 font-display text-2xl font-semibold text-navy">{n.registration.table}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{n.registration.pending}</p>
          {events.length + upcoming.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{n.registration.empty}</p>}
          <div className="mt-5 overflow-x-auto border-y border-border"><table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground"><tr><th className="p-3">{n.cols[1]}</th><th className="p-3">{n.cols[0]}</th><th className="p-3">{n.registration.quantity}</th><th className="p-3">{n.registration.capacity}</th><th className="p-3"><span className="sr-only">{t.common.register}</span></th></tr></thead>
            <tbody>{ev.filter(hit).sort((a,b) => b.date.localeCompare(a.date)).map(e => <tr key={e.id} className="border-t border-border"><td className="p-3 font-medium"><Link to="/su-kien/$eventId" params={{ eventId: e.id }}>{e.title}</Link></td><td className="whitespace-nowrap p-3">{formatDate(e.date)}</td><td className="p-3 tabular-nums">{e.total}</td><td className="p-3">{e.capacity ?? t.memberPage.unspecified}</td><td className="p-3">{eventIsPast(e.date, today) ? <span className="text-xs text-muted-foreground">{n.pastLabel}</span> : <Button asChild size="sm"><Link to="/su-kien/$eventId" params={{ eventId: e.id }} hash="event-register">{t.common.register}</Link></Button>}</td></tr>)}</tbody>
          </table></div>
          {past.length > 0 && <>
            <h2 className="mt-10 font-display text-2xl font-semibold text-navy">{n.pastTitle}</h2>
            <div className="mt-6 divide-y divide-border border-y border-border">{past.map(e => <article key={e.id} id={`events-${e.id}`} className="scroll-mt-28 py-6">
              <EventPhoto compact url={e.img} thumb={e.thumb} caption={e.caption} title={e.title} />
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><Tag>{e.tag}</Tag><span>{formatDate(e.date)}</span><span>{n.pastLabel}</span></div>
              <h3 className="mt-3 font-display text-xl font-semibold text-navy">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
              {e.place && <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{e.place}</p>}
              {e.source && <p className="mt-3 text-xs text-muted-foreground">{n.source}: {e.source}</p>}
              {e.sourceUrl && <Button asChild variant="link" className="mt-2 h-auto whitespace-normal px-0"><a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">{n.readOriginal}<ExternalLink className="h-4 w-4" /></a></Button>}
            </article>)}</div>
          </>}
          {events.length > 0 && <>
          <div className="mt-10"><Eyebrow>{n.featuredEyebrow}</Eyebrow></div>
          <H2>{n.featuredTitle}</H2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {events.map((e) => (
              <article key={e.id} id={`events-${e.id}`} className="editorial-card group scroll-mt-28 overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative">
                  <EventPhoto compact url={e.img} thumb={e.thumb} caption={e.caption} title={e.title} />
                  <div className="absolute left-4 top-4 rounded-md bg-background px-3 py-2 text-center">
                    <p className="font-display text-2xl font-semibold text-navy">{e.date.slice(8, 10)}</p>
                    <p className="text-[10px] text-muted-foreground">{e.date.slice(5, 7)}/{e.date.slice(0, 4)}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2"><Tag>{e.tag}</Tag><span className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] uppercase text-muted-foreground"><MapPin className="h-3 w-3" />{e.place}</span></div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-navy">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="space-y-1">{e.time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{e.time}</span>}{e.people && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{e.people}</span>}</span>
                    <Button asChild size="sm"><Link to="/su-kien/$eventId" params={{ eventId: e.id }} hash="event-register">{t.common.register}</Link></Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </>}

          {posts.length > 0 && (
            <>
              <h2 className="mt-14 font-display text-2xl font-semibold text-navy">{n.postsTitle}</h2>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {posts.map((p) => {
                  const sourceUrl = postSourceUrl(p.source_url);
                  return (
                  <article key={p.id} id={`posts-${p.id}`} className="scroll-mt-28 py-6 md:py-8">
                    <EventPhoto compact url={p.image_url} thumb={p.image_thumb_url} caption={L(p, "image_caption")} title={L(p, "title")} />
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><Tag>{L(p, "tag")}</Tag>{formatDate(p.published_on)}</div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-navy">{L(p, "title")}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{L(p, "excerpt")}</p>
                    {L(p, "body") && <RichTextView value={L(p, "body")} className="mt-3 text-sm text-foreground/80" />}
                    {(p.source_name || sourceUrl) && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                      {p.source_name && <p className="text-xs text-muted-foreground">{n.source}: {p.source_name}</p>}
                      {sourceUrl && <Button variant="link" asChild className="h-auto max-w-full whitespace-normal px-0 text-left"><a href={sourceUrl} target="_blank" rel="noopener noreferrer">{n.readOriginal}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></Button>}
                    </div>}
                  </article>
                  );
                })}
              </div>
            </>
          )}

          {upcoming.length > 0 && <>
          <h2 className="mt-14 font-display text-2xl font-semibold text-navy">{n.upcomingTitle}</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>{n.cols.map((c, i) => <th key={i} className="px-4 py-3 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody>
                {upcoming.map((u) => (
                  <tr key={u.id} id={`events-${u.id}`} className="scroll-mt-28 border-t border-border">
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDate(u.date)}</td>
                    <td className="px-4 py-4 font-medium text-navy"><EventPhoto compact url={u.img} thumb={u.thumb} caption={u.caption} title={u.title} />{u.title}</td>
                    <td className="px-4 py-4 text-muted-foreground">{u.topic}</td>
                    <td className="px-4 py-4 text-muted-foreground">{u.place}</td>
                    <td className="px-4 py-4 text-muted-foreground">{u.mode}</td>
                    <td className="px-4 py-4"><Button asChild size="sm"><Link to="/su-kien/$eventId" params={{ eventId: u.id }} hash="event-register">{t.common.register}<ArrowRight className="h-3.5 w-3.5" /></Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>}
        </div>
        <aside className="h-fit border-t-2 border-brand-green bg-muted p-6 lg:sticky lg:top-24">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-green">{n.subscribeEyebrow}</p>
          <p className="mt-3 font-display text-2xl font-semibold text-navy">{n.subscribeTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">{n.subscribeText}</p>
          <div className="mt-6"><BtnPrimary to="/lien-he">{n.subscribeCta}</BtnPrimary></div>
        </aside>
      </Section>
    </>
  );
}
