import { describe, expect, it } from "vitest";
import { eventAction, eventIsPast } from "../lib/event-schedule";
describe("real event schedules", () => {
  it("does not offer registration for the June 2023 Business Lunch in November 2026", () => {
    expect(eventAction("business-lunch", "2023-06-17", "2026-11-01")).toEqual({ status: "past", url: "/tin-tuc#events-business-lunch", registerUrl: null, registrationAvailable: false });
  });
  it("keeps current and future dates separate from past events", () => {
    expect(eventIsPast("2026-11-01", "2026-11-01")).toBe(false);
    expect(eventAction("future", "2026-11-02", "2026-11-01").registrationAvailable).toBe(true);
  });
});