import { eventRegistrationUrl } from "./event-registration";

export const MEMBER_DASHBOARD_REFRESH_MS = 15_000;

export function vipDinnerSchedule<T extends { title: string; title_en: string | null; published: boolean; event_date: string }>(events: T[], today: string) {
  const dinners = events.filter(event => event.published && /\bvip\s+dinner\b/i.test(`${event.title} ${event.title_en ?? ""}`));
  return {
    upcoming: dinners.filter(event => event.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date)),
    past: dinners.filter(event => event.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date)),
  };
}

export function nearestVipDinner<T extends { id: string; title: string; title_en: string | null; published: boolean; event_date: string }>(events: T[], today: string) {
  const event = vipDinnerSchedule(events, today).upcoming[0];
  if (!event) return null;
  return { event, registerUrl: eventRegistrationUrl(event.id) };
}