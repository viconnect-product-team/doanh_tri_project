import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { partnershipOrderSchema, partnershipAmount } from "./partnership";

export const getPartnershipCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPartnershipCatalog } = await import("./partnership.server");
  return fetchPartnershipCatalog();
});
export const partnershipQuery = queryOptions({ queryKey: ["partnership-public"], queryFn: () => getPartnershipCatalog(), staleTime: 30_000 });
export const submitPartnershipOrder = createServerFn({ method: "POST" }).inputValidator((input: unknown) => partnershipOrderSchema.parse(input)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [p, b] = await Promise.all([supabaseAdmin.from("partnership_packages").select("id,title,fee,published").eq("id", data.package_id).eq("published", true).single(), supabaseAdmin.from("partnership_payment_settings").select("*").eq("id", true).eq("enabled", true).single()]);
  if (p.error || b.error || !p.data || !b.data) return { ok: false as const };
  const amount = partnershipAmount(p.data, b.data);
  const reference = `HT${crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
  const receipt = { reference, amount, package_title: p.data.title, bank_name: b.data.bank_name, account_number: b.data.account_number, account_holder: b.data.account_holder };
  const { consent: _consent, ...details } = data;
  const { error } = await supabaseAdmin.from("partnership_orders").insert({ ...details, ...receipt, status: "pending" });
  if (error) return { ok: false as const };
  return { ok: true as const, receipt };
});