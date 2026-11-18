import type { Database } from "@/integrations/supabase/types";

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type RequestRow = Database["public"]["Tables"]["leads"]["Row"];
export type TrackedCustomer = Customer & { requests: RequestRow[] };
export const TRACKING_SOURCES = ["ai_advisor", "consulting", "course", "community"] as const;
export type TrackingSource = (typeof TRACKING_SOURCES)[number];

export function filterTrackedCustomers(customers: TrackedCustomer[], source: TrackingSource | "all", status: Customer["status"] | "all", search: string): TrackedCustomer[] {
  const query = search.trim().toLowerCase();
  return customers.filter((customer) => {
    const requests = customer.requests.filter((request) => TRACKING_SOURCES.some((s) => s === request.source));
    return requests.length > 0 && (source === "all" || requests.some((request) => request.source === source)) &&
      (status === "all" || customer.status === status) &&
      [customer.full_name, customer.email, customer.phone, customer.organization, ...requests.flatMap((r) => [r.interest, r.message])].filter(Boolean).join(" ").toLowerCase().includes(query);
  });
}

export function attachRequests(customers: Customer[], requests: RequestRow[]): TrackedCustomer[] {
  const byCustomer = new Map<string, RequestRow[]>();
  for (const request of requests) {
    if (!request.customer_id) continue;
    const group = byCustomer.get(request.customer_id) ?? [];
    group.push(request);
    byCustomer.set(request.customer_id, group);
  }
  return customers.map((customer) => ({ ...customer, requests: byCustomer.get(customer.id) ?? [] }));
}