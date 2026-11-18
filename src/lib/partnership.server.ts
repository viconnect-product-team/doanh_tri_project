import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
export async function fetchPartnershipCatalog() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Configuration missing");
  const sb = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers }); } } });
  const [p, b] = await Promise.all([sb.from("partnership_packages").select("*").eq("published", true).order("sort_order"), sb.from("partnership_payment_settings").select("*").eq("enabled", true).maybeSingle()]);
  if (p.error || b.error) throw new Error("Catalog unavailable");
  return { packages: p.data ?? [], bank: b.data };
}