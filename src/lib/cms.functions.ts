import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Expert = Database["public"]["Tables"]["experts"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"] & { registered_participants: number };
export type Partner = Database["public"]["Tables"]["partners"]["Row"];
export type MembershipPlan = Database["public"]["Tables"]["membership_plans"]["Row"];

// Public: published content only (RLS also enforces this).
export const getPublicContent = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPublicContent } = await import("./cms.server");
  return fetchPublicContent();
});

export const publicContentQuery = queryOptions({
  queryKey: ["public-content"],
  queryFn: () => getPublicContent(),
  staleTime: 60_000,
});
