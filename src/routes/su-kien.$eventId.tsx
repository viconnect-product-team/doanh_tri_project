import { richTextPlain } from "@/lib/rich-text";
import { RichTextView } from "@/components/site/RichTextEditor";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { publicContentQuery } from "@/lib/cms.functions";
import { eventIsPast } from "@/lib/event-schedule";
import { L, formatDate } from "@/lib/localized";
import { t } from "@/content/i18n";
import { EventPhoto } from "@/components/site/EventPhoto";
import { EventRegistrationForm } from "@/components/site/EventRegistrationForm";
import { Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/su-kien/$eventId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData, params }) => {
    const event = loaderData?.events.find(row => row.id === params.eventId);
    const title = `${event?.title ?? "Đăng ký sự kiện"} – Viện Doanh Trí`;
    const description = richTextPlain(event?.description ?? "").slice(0, 160) || "Thông tin sự kiện và gửi yêu cầu đăng ký tham dự tại Viện Doanh Trí.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...(event?.image_url.startsWith("https://") ? [{ property: "og:image", content: event.image_url }, { name: "twitter:image", content: event.image_url }] : [])] };
  },
  component: EventPage,
});

function EventPage() {
  const { eventId } = Route.useParams();
  const { data } = useSuspenseQuery({ ...publicContentQuery, refetchInterval: 30_000 });
  const event = data.events.find(row => row.id === eventId);
  const r = t.news.registration;
  if (!event) return <Section className="py-16"><h1 className="text-2xl font-semibold">{r.missing}</h1><Button asChild variant="link"><Link to="/tin-tuc">{r.back}</Link></Button></Section>;
  const past = eventIsPast(event.event_date, new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
  return <Section className="max-w-4xl py-10">
    <Button asChild variant="link" className="px-0"><Link to="/tin-tuc">{r.back}</Link></Button>
    <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">{L(event, "title")}</h1>
    <div className="my-6 flex flex-wrap gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(event.event_date)} · {event.time_range}</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{L(event, "place")}</span></div>
    <EventPhoto url={event.image_url} thumb={event.image_thumb_url} title={L(event, "title")} caption={L(event, "image_caption")} />
    <RichTextView value={L(event, "description")} className="my-6 text-foreground/80" />
    <div className="my-8 flex flex-wrap items-center gap-6 border-y border-border py-5"><p aria-live="polite" className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5 text-primary" /><span>{event.registered_participants} {r.total}</span></p>{event.capacity && <p className="text-sm text-muted-foreground">{r.capacity}: {event.capacity}</p>}</div>
    {past ? <p className="border-t border-border py-8 text-muted-foreground">{r.closed}</p> : <EventRegistrationForm eventId={event.id} />}
  </Section>;
}