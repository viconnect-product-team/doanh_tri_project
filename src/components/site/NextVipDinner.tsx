import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { t } from "@/content/i18n";
import { L, formatDate } from "@/lib/localized";
import { Button } from "@/components/ui/button";

type Dinner = { id: string; title: string; title_en: string | null; event_date: string; time_range: string; place: string; place_en: string | null };
export function NextVipDinner({ suggestion }: { suggestion: { event: Dinner; registerUrl: string } | null }) {
  const event = suggestion?.event;
  return <div className="my-5 border-y border-border py-5">
    <h2 className="flex items-center gap-2 text-base font-semibold text-navy"><CalendarDays className="h-5 w-5 shrink-0 text-primary" />{t.memberPage.nearestDinner}</h2>
    {event ? <><p className="mt-3 font-semibold">{L(event, "title")}</p><p className="mt-2 text-sm text-muted-foreground">{formatDate(event.event_date)} · {event.time_range || t.memberPage.unspecified}</p><p className="mt-1 text-sm text-muted-foreground">{L(event, "place") || t.memberPage.unspecified}</p><Button asChild className="mt-4 h-auto min-h-11 whitespace-normal"><Link to="/su-kien/$eventId" params={{ eventId: event.id }} hash="event-register">{t.memberPage.registerDinner}</Link></Button><p className="mt-2 text-xs text-muted-foreground">{t.memberPage.registrationPending}</p></> : <p className="mt-3 text-sm text-muted-foreground">{t.memberPage.noDinners}</p>}
  </div>;
}