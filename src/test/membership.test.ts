import { describe, expect, it } from "vitest";
import { MEMBERSHIP_PLANS, membershipRegistrationSchema, membershipAmountSchema } from "@/lib/membership";

describe("Membership proposal", () => {
  it("offers exactly four tiers at the proposal's annual fees", () => {
    expect(MEMBERSHIP_PLANS.map(p => [p.id, p.fee])).toEqual([["standard", 3000000], ["vip", 10000000], ["vvip", 30000000], ["diamond", 50000000]]);
  });
  it("uses noncumulative Dinner allowances of 1, 3, 5, 5", () => {
    expect(MEMBERSHIP_PLANS.map(p => p.dinners)).toEqual([1, 3, 5, 5]);
  });
  it("provides four knowledge sessions and one press mention and visit in every tier", () => {
    expect(MEMBERSHIP_PLANS.map(p => [p.knowledge, p.press, p.visits])).toEqual([[4, 1, 1], [4, 1, 1], [4, 1, 1], [4, 1, 1]]);
  });
  it("limits mentoring and speaking to VVIP and Diamond", () => {
    expect(MEMBERSHIP_PLANS.map(p => [p.mentoring, p.speaking])).toEqual([[0, 0], [0, 0], [1, 1], [1, 1]]);
  });
  it("includes birthday flowers only above Standard", () => {
    expect(MEMBERSHIP_PLANS.map(p => p.flowers)).toEqual([0, 1, 1, 1]);
  });
  it("reserves one overseas place and CEO PTI course for Diamond", () => {
    expect(MEMBERSHIP_PLANS.map(p => [p.overseas, p.ceo])).toEqual([[0, 0], [0, 0], [0, 0], [1, 1]]);
  });
  it("requires valid tier, contact details and explicit consent", () => {
    const valid = { full_name: "An", email: "an@example.com", phone: "0901234567", organization: "", message: "", membership_tier: "vip", consent: true };
    expect(membershipRegistrationSchema.safeParse(valid).success).toBe(true);
    for (const patch of [{ membership_tier: "" }, { consent: false }, { phone: "abc" }, { email: "invalid" }]) expect(membershipRegistrationSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it("accepts a new CMS tier ID instead of limiting registration to four draft tiers", () => {
    expect(membershipRegistrationSchema.parse({ full_name: "An", email: "an@example.com", phone: "0901234567", organization: "", message: "", membership_tier: "business-plus", consent: true }).membership_tier).toBe("business-plus");
  });
  it("accepts editable prices and rejects invalid amounts", () => {
    expect(membershipAmountSchema.parse("12500000")).toBe(12500000);
    expect(membershipAmountSchema.parse(0)).toBe(0);
    for (const value of [-1, 1.5, "invalid", 2147483648]) expect(membershipAmountSchema.safeParse(value).success).toBe(false);
  });
});