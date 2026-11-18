import { describe, expect, it } from "vitest";
import { filterRegistrations, registrationQuantity, type Registration } from "@/lib/registrations";

const registration: Registration = {
  id: "course-1", customer_id: "customer-1", full_name: "Nguyễn An", email: "an@example.com", phone: "0900000000",
  organization: null, interest: "AI cho lãnh đạo doanh nghiệp", message: "Số học viên: 3\nĐào tạo nhóm",
  source: "course", status: "new", created_at: "2026-10-31T00:00:00Z", updated_at: "2026-10-31T00:00:00Z",
  notes: null, ai_suggestions: null, membership_tier: null, event_id: null, participant_count: null,
};

describe("Registration tracking", () => {
  it("reads the registered quantity in Vietnamese", () => {
    expect(registrationQuantity(registration.message)).toBe(3);
  });
  it("reads the registered quantity in English", () => {
    expect(registrationQuantity("Participants: 5\nTeam training")).toBe(5);
  });
  it("does not invent a quantity from unrelated notes", () => {
    expect(registrationQuantity("Đào tạo 25 người")).toBeNull();
    expect(registrationQuantity(null)).toBeNull();
  });
  it("lists course registrations only, preserving each separate registration", () => {
    expect(filterRegistrations([registration, { ...registration, id: "course-2" }, { ...registration, source: "consulting" }], "all", "").map((r) => r.id)).toEqual(["course-1", "course-2"]);
  });
  it("filters progress by the saved CRM status", () => {
    expect(filterRegistrations([registration, { ...registration, id: "enrolled-1", status: "enrolled" }], "enrolled", "").map((r) => r.id)).toEqual(["enrolled-1"]);
  });
  it("searches the learner or course", () => {
    expect(filterRegistrations([registration], "all", "  AI cho lãnh đạo ")).toHaveLength(1);
    expect(filterRegistrations([registration], "all", "Nguyễn An")).toHaveLength(1);
    expect(filterRegistrations([registration], "all", "ESG")).toHaveLength(0);
  });
});