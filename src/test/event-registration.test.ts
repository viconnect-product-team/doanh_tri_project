import { describe, expect, it } from "vitest";
import { eventRegistrationFields, eventRegistrationUrl } from "@/lib/event-registration";
import { eventAction } from "@/lib/event-schedule";
import { nearestVipDinner } from "@/lib/member-dashboard";

describe("synchronized event registrations", () => {
  const id = "152e3afe-dcd3-48f9-aa48-ff3703d25ad7";
  it("uses the same event ID link from assistant and VIP Dinner suggestions", () => {
    const event = { id, title: "VIP Dinner", title_en: null, published: true, event_date: "2026-11-20" };
    expect(eventAction(id, event.event_date, "2026-11-01").registerUrl).toBe(eventRegistrationUrl(id));
    expect(nearestVipDinner([event], "2026-11-01")?.registerUrl).toBe(eventRegistrationUrl(id));
  });
  it("stores a concrete group quantity linked to the event", () => {
    expect(eventRegistrationFields.parse({ event_id: id, participant_count: 3 })).toEqual({ event_id: id, participant_count: 3 });
    expect(eventRegistrationFields.safeParse({ event_id: id, participant_count: 0 }).success).toBe(false);
    expect(eventRegistrationFields.safeParse({ event_id: id, participant_count: 1.5 }).success).toBe(false);
  });
  it("never gives historical events a registration link", () => {
    expect(eventAction(id, "2023-06-17", "2026-11-01").registerUrl).toBeNull();
  });
});