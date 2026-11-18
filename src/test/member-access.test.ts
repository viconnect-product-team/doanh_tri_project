import { describe, expect, it } from "vitest";
import { memberIsActive, remainingBenefits } from "@/lib/member-access";
describe("Member privacy gate", () => {
  it("does not give pending members personal assistant access", () => {
    expect(memberIsActive({ active: true, approval_status: "pending", starts_on: null, ends_on: null }, "2026-11-01")).toBe(false);
    expect(memberIsActive({ active: true, approval_status: "approved", starts_on: null, ends_on: null }, "2026-11-01")).toBe(true);
  });
  it("does not grant membership to an ordinary signed-in account", () => expect(memberIsActive(null, "2026-11-01")).toBe(false));
  it("requires an active institute-issued membership within its term", () => {
    expect(memberIsActive({ active: true, starts_on: "2026-10-01", ends_on: "2027-10-01" }, "2026-11-01")).toBe(true);
    expect(memberIsActive({ active: false, starts_on: null, ends_on: null }, "2026-11-01")).toBe(false);
    expect(memberIsActive({ active: true, starts_on: "2026-10-01", ends_on: "2026-10-31" }, "2026-11-01")).toBe(false);
  });
  it("counts only benefit usage within the member term", () => {
    const usage = [{ kind: "benefit", benefit_key: "dinners", quantity: 1, event_date: "2026-11-01" }, { kind: "benefit", benefit_key: "dinners", quantity: 2, event_date: "2025-11-01" }];
    expect(remainingBenefits({ dinners: 3 }, usage, "2026-10-01", "2027-09-30")["dinners"]).toEqual({ included: 3, used: 1, remaining: 2 });
  });
});