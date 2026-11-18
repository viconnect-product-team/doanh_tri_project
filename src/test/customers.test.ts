import { describe, expect, it } from "vitest";
import { attachRequests, filterTrackedCustomers, type Customer, type RequestRow } from "@/lib/customers";

const customer: Customer = { id: "c1", email: "an@example.com", full_name: "An", phone: null, organization: null, notes: null, status: "consulting", created_at: "2026-10-31", updated_at: "2026-10-31" };
const request: RequestRow = { ...customer, customer_id: "c1", id: "r1", source: "ai_advisor", interest: "AI", message: "Need training", ai_suggestions: null, membership_tier: null, event_id: null, participant_count: null };

describe("Unified customer tracking", () => {
  it("tracks membership and AI requests as one customer with separate history", () => {
    const rows = attachRequests([customer], [request, { ...request, id: "r5", source: "community", interest: "VIP" }]);
    expect(filterTrackedCustomers(rows, "community", "consulting", "VIP")).toHaveLength(1);
    expect(filterTrackedCustomers(rows, "all", "all", "")).toHaveLength(1);
    expect(rows[0]?.requests).toHaveLength(2);
  });
  it("classifies a multi-source customer once in each matching source", () => {
    const rows = attachRequests([customer], [request, { ...request, id: "r2", source: "consulting" }, { ...request, id: "r3", source: "course" }]);
    expect(filterTrackedCustomers(rows, "ai_advisor", "all", "")).toHaveLength(1);
    expect(filterTrackedCustomers(rows, "consulting", "all", "")).toHaveLength(1);
    expect(filterTrackedCustomers(rows, "course", "all", "")).toHaveLength(1);
    expect(filterTrackedCustomers(rows, "all", "all", "")).toHaveLength(1);
  });
  it("combines source, common status and needs search", () => {
    const rows = attachRequests([customer], [request]);
    expect(filterTrackedCustomers(rows, "ai_advisor", "consulting", "training")).toHaveLength(1);
    expect(filterTrackedCustomers(rows, "ai_advisor", "enrolled", "training")).toHaveLength(0);
    expect(filterTrackedCustomers(rows, "course", "consulting", "training")).toHaveLength(0);
  });
  it("excludes customers with only unrelated sources from CMS tracking", () => {
    expect(filterTrackedCustomers(attachRequests([customer], [{ ...request, source: "subscribe" }]), "all", "all", "")).toHaveLength(0);
  });
  it("shows one customer for AI, consultation and course requests without losing history", () => {
    const rows = attachRequests([customer], [request, { ...request, id: "r2", source: "consulting" }, { ...request, id: "r3", source: "course" }]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.requests.map((r) => r.source)).toEqual(["ai_advisor", "consulting", "course"]);
    expect(rows[0]?.status).toBe("consulting");
  });
  it("does not merge distinct customers or discard repeat course registrations", () => {
    const rows = attachRequests([customer, { ...customer, id: "c2", email: "other@example.com" }], [request, { ...request, id: "r2", source: "course" }, { ...request, id: "r3", source: "course" }, { ...request, id: "r4", customer_id: "c2" }]);
    expect(rows.map((r) => r.requests.length)).toEqual([3, 1]);
  });
});