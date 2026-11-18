import { describe, expect, it } from "vitest";
import { memberUpdate } from "@/lib/member-management";
const input = { full_name: " Nguyễn An ", organization: "Viện", phone: "0900000000", tier_id: "vip", starts_on: "2026-11-01", ends_on: "2027-11-01", active: true, approval_status: "approved" };
const previous = { approval_status: "pending", approved_at: null };
describe("CMS member updates", () => {
  it("saves member information and selected plan", () => expect(memberUpdate(input, previous, "2026-11-01T05:50:00Z")).toMatchObject({ full_name: "Nguyễn An", phone: "0900000000", organization: "Viện", tier_id: "vip" }));
  it("records approval time without changing invitation history or identity", () => {
    const result = memberUpdate({ ...input, user_id: "other", invitation_sent_at: "fake" }, previous, "2026-11-01T05:50:00Z");
    expect(result.approved_at).toBe("2026-11-01T05:50:00Z"); expect(result).not.toHaveProperty("user_id"); expect(result).not.toHaveProperty("invitation_sent_at");
  });
  it("supports suspending a registered member", () => expect(memberUpdate({ ...input, active: false }, previous, "now").active).toBe(false));
  it("clears approval timestamp when returned to pending", () => expect(memberUpdate({ ...input, approval_status: "pending" }, { approval_status: "approved", approved_at: "before" }, "now").approved_at).toBeNull());
  it("retains existing approval time on information edits", () => expect(memberUpdate(input, { approval_status: "approved", approved_at: "before" }, "now").approved_at).toBe("before"));
  it("rejects expiry before membership start", () => expect(() => memberUpdate({ ...input, ends_on: "2026-10-31" }, previous, "now")).toThrow());
});