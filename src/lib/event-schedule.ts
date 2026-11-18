import { eventRegistrationUrl } from "./event-registration";

export function eventIsPast(date: string, today: string): boolean {
  return date < today;
}

export function eventAction(id: string, date: string, today: string) {
  const past = eventIsPast(date, today);
  return { status: past ? "past" : "upcoming", url: `/tin-tuc#events-${id}`, registerUrl: past ? null : eventRegistrationUrl(id), registrationAvailable: !past };
}