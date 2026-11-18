import type { Database } from "@/integrations/supabase/types";
import type { Course, Post, Expert, EventRow, MembershipPlan, Partner } from "./cms.functions";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function fetchPublicContent() {
  const sb = await publicClient();
  const [c, p, e, ev, mp, counts, pa] = await Promise.all([
    sb.from("courses").select("*").eq("published", true).order("sort_order"),
    sb.from("posts").select("*").eq("published", true).order("published_on", { ascending: false }),
    sb.from("experts").select("*").eq("published", true).order("sort_order"),
    sb.from("events").select("*").eq("published", true).order("event_date"),
    sb.from("membership_plans").select("*").eq("published", true).order("sort_order"),
    sb.rpc("public_event_registration_counts"),
    sb.from("partners").select("*").eq("published", true).order("sort_order"),
  ]);
  if (c.error || p.error || e.error || ev.error) console.error("getPublicContent", c.error ?? p.error ?? e.error ?? ev.error);
  if (mp.error) throw new Error(mp.error.message);
  if (counts.error) throw new Error(counts.error.message);
  const totals = new Map((counts.data ?? []).map(row => [row.event_id, Number(row.participants)]));
  return { courses: (c.data ?? []) as Course[], posts: (p.data ?? []) as Post[], experts: (e.data ?? []) as Expert[], events: (ev.data ?? []).map(row => ({ ...row, registered_participants: totals.get(row.id) ?? 0 })) as EventRow[], membership_plans: (mp.data ?? []) as MembershipPlan[], partners: (pa.data ?? []) as Partner[] };
}
