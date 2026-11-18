import { describe, expect, it } from "vitest";
import { confirmedMembership, memberInvitationUrl } from "@/lib/member-confirmation";

describe("Institute confirmation", () => {
  it("approves only after the invitation is accepted for sending", () => {
    expect(() => confirmedMembership(false, "2026-11-01T05:00:00Z")).toThrow();
    expect(confirmedMembership(true, "2026-11-01T05:00:00Z")).toEqual({ approval_status: "approved", approved_at: "2026-11-01T05:00:00Z", invitation_sent_at: "2026-11-01T05:00:00Z" });
  });
  it("returns invitations to public member sign-in on the same origin", () => {
    expect(memberInvitationUrl("https://iem.demo.ubos.vn/cms")).toBe("https://iem.demo.ubos.vn/auth?member=true");
    expect(() => memberInvitationUrl("javascript:alert(1)")).toThrow();
  });
});