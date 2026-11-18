import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { memberPaymentInput, memberPaymentAmount } from "./member-payment";

export const getMemberPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profile, error } = await context.supabase.from("member_profiles").select("id,full_name,organization,phone").eq("user_id",context.userId).maybeSingle();
  if (error) throw new Error("Profile unavailable");
  if (!profile) return null;
  const [p,b,o] = await Promise.all([context.supabase.from("membership_plans").select("id,title,title_en,description,description_en,fee,published").eq("published",true).order("sort_order"), context.supabase.from("member_payment_settings").select("*").eq("enabled",true).maybeSingle(), context.supabase.from("member_payment_orders").select("*").eq("member_id",profile.id).order("created_at",{ascending:false})]);
  if (p.error || b.error || o.error) throw new Error("Payments unavailable");
  return { profile, plans:p.data ?? [], bank:b.data, orders:o.data ?? [] };
});
export const memberPaymentsQuery = queryOptions({ queryKey:["member-payments"], queryFn:()=>getMemberPayments(), staleTime:0, refetchInterval:15_000 });
export const createMemberPayment = createServerFn({ method:"POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown)=>memberPaymentInput.parse(input)).handler(async ({data,context})=>{
  const { data:member,error } = await context.supabase.from("member_profiles").select("id").eq("user_id",context.userId).single();
  if (error || !member) throw new Error("Institute member required");
  const [p,b] = await Promise.all([context.supabase.from("membership_plans").select("id,title,fee,published").eq("id",data.tier_id).eq("published",true).single(),context.supabase.from("member_payment_settings").select("*").eq("enabled",true).single()]);
  if (p.error || b.error || !p.data || !b.data) return {ok:false as const};
  const amount=memberPaymentAmount(p.data,b.data);
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
  const {consent:_consent,...values}=data;
  const {error:saveError}=await supabaseAdmin.from("member_payment_orders").insert({...values,member_id:member.id,reference:`HV${crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase()}`,package_title:p.data.title,amount,bank_name:b.data.bank_name,account_number:b.data.account_number,account_holder:b.data.account_holder,status:"pending"});
  return {ok:!saveError};
});