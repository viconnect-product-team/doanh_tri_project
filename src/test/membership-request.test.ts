import { describe, expect, it } from "vitest";
import { approvedRequestProfile } from "@/lib/membership-request";
const request = { id: "11111111-1111-4111-8111-111111111111", source: "community", membership_tier: "vip", full_name: "Nguyễn An", email: "an@example.com", phone: "0901234567", organization: "Công ty An" };
describe("Approved membership request", () => {
  it("imports the exact selected personal details and tier using explicit request identity", () => {
    expect(approvedRequestProfile(request)).toEqual({ registration_request_id: request.id, full_name: "Nguyễn An", email: "an@example.com", phone: "0901234567", organization: "Công ty An", tier_id: "vip" });
  });
  it("cannot turn an unrelated CRM request into membership", () => {
    expect(() => approvedRequestProfile({ ...request, source: "course" })).toThrow();
  });
  it("preserves the selected custom CMS plan when issuing a membership", () => {
    expect(approvedRequestProfile({ ...request, membership_tier: "business-plus" }).tier_id).toBe("business-plus");
  });
});