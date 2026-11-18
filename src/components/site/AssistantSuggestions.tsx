import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Newspaper, UserRound } from "lucide-react";
import { publicContentQuery } from "@/lib/cms.functions";
import { assistantSuggestions } from "@/lib/assistant-suggestions";
import { L } from "@/lib/localized";
import { t } from "@/content/i18n";
import { Button } from "@/components/ui/button";

export function AssistantSuggestions() {
  const { data } = useQuery({ ...publicContentQuery, staleTime: 0, refetchOnMount: "always", refetchOnWindowFocus: "always", refetchInterval: 30_000 });
  if (!data) return null;
  const { post, expert, event, eventPast } = assistantSuggestions(data, new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
  if (!post && !expert && !event) return null;
  const rows = [
    ...(post ? [{ id: post.id, kind: "posts" as const, title: L(post, "title"), detail: L(post, "excerpt"), icon: Newspaper, to: "/tin-tuc" as const, hash: `posts-${post.id}` }] : []),
    ...(expert ? [{ id: expert.id, kind: "experts" as const, title: L(expert, "name"), detail: L(expert, "role"), icon: UserRound, to: "/mang-luoi" as const, hash: `experts-${expert.id}` }] : []),
    ...(event ? [{ id: event.id, kind: "events" as const, title: L(event, "title"), detail: `${event.event_date} · ${eventPast ? t.assistant.eventHistory : t.memberPage.upcoming}`, icon: CalendarDays, to: "/tin-tuc" as const, hash: `events-${event.id}` }] : []),
  ];
  return <section aria-label={t.assistant.latestContent} className="border-b border-border py-4">
    <h2 className="mb-2 text-sm font-semibold text-navy">{t.assistant.latestContent}</h2>
    <div className="divide-y divide-border">
      {rows.map(row => <Button key={`${row.kind}-${row.id}`} asChild variant="ghost" className="h-auto w-full justify-start whitespace-normal rounded-none px-0 py-3 text-left">
        <Link to={row.to} hash={row.hash} className="group flex min-w-0 items-start gap-3">
          <row.icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">{t.siteSearch.kinds[row.kind]}</span>
            <span className="mt-1 line-clamp-2 block text-sm font-medium text-foreground">{row.title}</span>
            <span className="mt-1 line-clamp-1 block text-xs font-normal text-muted-foreground">{row.detail}</span>
          </span>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </Button>)}
      {event && !eventPast && <Button asChild variant="outline" className="mt-3 min-h-11 w-full whitespace-normal"><Link to="/su-kien/$eventId" params={{ eventId: event.id }} hash="event-register">{t.news.registration.title}</Link></Button>}
    </div>
  </section>;
}