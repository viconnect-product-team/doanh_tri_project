import { describe, expect, it } from "vitest";
import { MEMBER_DASHBOARD_REFRESH_MS, nearestVipDinner, vipDinnerSchedule } from "@/lib/member-dashboard";

it("refreshes member profile and payment history every 15 seconds", () => {
  expect(MEMBER_DASHBOARD_REFRESH_MS).toBe(15_000);
});

describe("Member VIP Dinner schedule", () => {
  const events = [
    { title: "VIP Dinner tháng 11", title_en: null, published: true, event_date: "2026-11-20" },
    { title: "VIP Dinner cũ", title_en: null, published: true, event_date: "2026-10-20" },
    { title: "VIP Dinner nháp", title_en: null, published: false, event_date: "2026-11-05" },
    { title: "Diễn đàn tri thức", title_en: null, published: true, event_date: "2026-11-10" },
  ];
  it("only includes published VIP Dinner events", () => {
    const schedule = vipDinnerSchedule(events, "2026-11-01");
    expect([...schedule.upcoming, ...schedule.past].map(event => event.title)).toEqual(["VIP Dinner tháng 11", "VIP Dinner cũ"]);
  });
  it("never presents historical dinners as upcoming", () => {
    expect(vipDinnerSchedule(events, "2026-11-01").upcoming.map(event => event.event_date)).toEqual(["2026-11-20"]);
    expect(vipDinnerSchedule(events, "2026-11-01").past.map(event => event.event_date)).toEqual(["2026-10-20"]);
  });
  it("selects the nearest published dinner, not a later or hidden occurrence", () => {
    const rows = events.map((event, index) => ({ ...event, id: String(index) }));
    const result = nearestVipDinner([...rows, { id: "later", title: "VIP Dinner tháng 12", title_en: null, published: true, event_date: "2026-12-10" }], "2026-11-01");
    expect(result?.event.event_date).toBe("2026-11-20");
  });
  it("links registration to the same event registration page used by the assistant", () => {
    const result = nearestVipDinner(events.map((event, index) => ({ ...event, id: String(index) })), "2026-11-01");
    const url = new URL(result?.registerUrl ?? "", "https://example.org");
    expect(url.pathname).toBe("/su-kien/0");
    expect(url.hash).toBe("#event-register");
  });
  it("returns no suggestion or registration link when all dinners are past", () => {
    expect(nearestVipDinner(events.map((event, index) => ({ ...event, id: String(index) })), "2026-12-01")).toBeNull();
  });
});